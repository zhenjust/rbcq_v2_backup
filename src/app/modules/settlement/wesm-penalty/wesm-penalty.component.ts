import { Component, DestroyRef, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PaginatedTableComponent } from '@shared/components/paginated-table/paginated-table.component';
import { WESM_PENALTY_STATUS, WESM_PENALTY_TYPE } from '@shared/constants';
import { LABELS } from '@shared/constants/labels.const';
import { meterProcessBillingPeriod, TPL_TABLE_COLUMN, TableAction } from '@shared/interfaces';
import { MeterprocessService, SettlementService } from '@shared/services/api';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectOptionInterface } from 'ng-zorro-antd/select';
import { Observable, of } from 'rxjs';
import { PenaltyGenerateIwsComponent } from './penalty-generate-iws/penalty-generate-iws.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MESSAGES } from '@shared/constants/messages.const';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-wesm-penalty',
  standalone: false,
  templateUrl: './wesm-penalty.component.html'
})
export class WesmPenaltyComponent implements OnInit {

  @ViewChild('paginatedTable') paginatedTable!: PaginatedTableComponent<any>;
  @ViewChild('bpTpl', { static: true }) bpTpl!: TemplateRef<HTMLElement>;

  private readonly formBuilder = inject(FormBuilder);
  private readonly meteringService = inject(MeterprocessService);
  private readonly settlementService = inject(SettlementService);
  private readonly modalService = inject(NzModalService);
  private readonly destroyRef$ = inject(DestroyRef);
  private readonly toastrService = inject(ToastrService);

  LABELS = LABELS;
  tableColumns: TPL_TABLE_COLUMN[];
  form: FormGroup;
  showForm = false;
  expandedTableCols: TPL_TABLE_COLUMN[];
  billingColumns: TPL_TABLE_COLUMN[];

  billingPeriods: meterProcessBillingPeriod[] = [];
  billingPeriodOpts: { label: any; value: any; }[] = [];
  statusOptions: NzSelectOptionInterface[] = [];
  typeOptions: NzSelectOptionInterface[] = [];
  filters: any = {};

  pipelineRecords: Record<string, any> = {
    ['penalty-calculate']: {
      message: MESSAGES.CONFIRM_SETTLEMENT_MSG('Calculate Financial Penalty'),
      modalTitle: LABELS.CALCULATE
    },
    ['penalty-finalize']: {
      message: MESSAGES.CONFIRM_SETTLEMENT_MSG('Finalize Financial Penalty'),
      modalTitle: LABELS.FINALIZE
    },
  }


  ngOnInit(): void {
    this.statusOptions = WESM_PENALTY_STATUS.map(opt => ({ label: opt, value: opt}));
    this.typeOptions = Object.keys(WESM_PENALTY_TYPE)
      .map(key => ({ label: WESM_PENALTY_TYPE[key as keyof typeof WESM_PENALTY_TYPE], value: key}))

    this.buildForm();
    this.formatTableColumns();
    this.getOptions();
  }

  buildForm(): void {
    this.form = this.formBuilder.group({
      billingPeriod: [null],
      status: [null],
      penaltyType: [null]
    });
  }

  formatTableColumns(): void {
    tableColumns[LABELS.BILLING_PERIOD_TRADING_DATE].template = this.bpTpl;
    this.tableColumns = Object.values(tableColumns);
    this.billingColumns = Object.values(billingColumns);
    this.expandedTableCols = Object.values(expandedTableCols);
  }

  getUrl(): Observable<any> {
    if (!this.paginatedTable) {
      return of([]);
    }

    return this.settlementService.search(this.filters, 'penalty', this.paginatedTable?.tableParams);
  }

  generateIws(): void {
    const modal = this.modalService.create({
      nzTitle: LABELS.GENERATE_INPUT_WORKSPACE,
      nzContent: PenaltyGenerateIwsComponent,
      nzCentered: true,
      nzMaskClosable: false,
      nzFooter: [
        {
          label: LABELS.CLOSE,
          onClick: (component: PenaltyGenerateIwsComponent) => component.triggerClose(),
          disabled: (component?: PenaltyGenerateIwsComponent) => component ? (component?.busy$ && !component?.busy$?.closed) : true
        },
        {
          label: LABELS.GENERATE_INPUT_WORKSPACE,
          type: 'primary',
          onClick: (component: PenaltyGenerateIwsComponent) => component.triggerOk(),
          disabled: (component?: PenaltyGenerateIwsComponent) => component ? (component.form.invalid || (component?.busy$ && !component?.busy$?.closed)) : true
        }
      ],
    });

    modal.afterClose.subscribe(res => {
      if (res) {
        this.paginatedTable?.search();
      }
    })
  }

  getOptions(): void {
    this.meteringService.getBillingPeriod()
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe({
        next: options => {
          this.billingPeriods = options as meterProcessBillingPeriod[];
          this.billingPeriodOpts = (options as meterProcessBillingPeriod[])
            .map(bp => ({ label: bp.supplyMonth, value: bp.supplyMonth }));
        }
      });

    this.settlementService.getPenaltyStatuses()
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe({
        next: options => this.statusOptions = options?.map(opt => ({ label: opt.label, value: opt.label }))
      });
  }

  applyFilter(): void {
    this.filters = this.form.getRawValue();
    this.paginatedTable?.search();
  }

  resetFilters(): void {
    this.form.reset();
    this.showForm = false;
    this.filters = null;
    this.paginatedTable?.search();
  }

//   {
//     "pipelineName": "penalty-finalize",
//     "isGroup": true,
//     "refId": 168,
//     "parameters": {
//         "billingStartDate": "2025-11-26",
//         "billingEndDate": "2025-12-25",
//         "billingPeriodName": "December 2025",
//         "allocDate": "2026-04-30",
//         "dueDate": "2026-05-30",
//         "remarks": "Penalty Allocation for December 2025"
//     }
// }
  triggerAction(pipelineName: string, rowData: any): void {
    const payload = {
      pipelineName,
      isGroup: true,
      refId: rowData.id,
      parameters: {
        billingStartDate: rowData.billingStartDate,
        billingEndDate: rowData.billingEndDate,
        billingPeriodName: rowData.billingPeriod,
      },
    };

    this.modalService.confirm({
      nzTitle: this.pipelineRecords[pipelineName].modalTitle,
      nzCentered: true,
      nzContent: this.pipelineRecords[pipelineName].message,
      nzOnOk: () => this.runJob(payload, false)
    });
  }


  runJob(payload: any, isGroup = false): void {
    this.paginatedTable.busy$ = this.settlementService.etaJobs(payload, isGroup)
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe(() => {
        this.toastrService.success(MESSAGES.SUCCESS_JOB_TRIGGER);
        this.paginatedTable?.search();
      });
  }


  get actionControls(): TableAction<any>[] {
    return [
      { label: LABELS.CALCULATE, value: 'calculate', click: (rowData: any) => this.triggerAction('penalty-calculate', rowData) },
      { label: LABELS.FINALIZE, value: 'finalize', click: (rowData: any) => this.triggerAction('penalty-finalize', rowData) },
    ];
  }


}

const tableColumns: Record<string, TPL_TABLE_COLUMN> = {
  [LABELS.BILLING_PERIOD_TRADING_DATE]: { label: LABELS.BILLING_PERIOD_TRADING_DATE, propName: 'parameters', type: 'template' },
  [LABELS.WORKSPACE_ID]: { label: LABELS.WORKSPACE_ID, propName: 'id', width: '120px', align: 'center' },
  [LABELS.STATUS]: { label: LABELS.STATUS, propName: 'status', width: '250px', align: 'center' },
}

const billingColumns: Record<string, TPL_TABLE_COLUMN> = {
  [LABELS.BILLING_ID]: { label: LABELS.BILLING_ID, propName: 'billingId'},
  [LABELS.TYPE]: { label: LABELS.TYPE, propName: 'type', align: 'center' },
  [LABELS.PENALTY_AMOUNT]: { label: LABELS.PENALTY_AMOUNT, propName: 'penaltyAmount', align: 'center', type: 'number' },
}

const expandedTableCols: Record<string, TPL_TABLE_COLUMN> = {
  [LABELS.DOCUMENT_NUMBER]: { label: LABELS.DOCUMENT_NUMBER, propName: 'documentNo' },
  [LABELS.DATE]: { label: LABELS.DATE, propName: 'date', type: 'date', align: 'center' },
  [LABELS.RESOURCE_ID]: { label: LABELS.RESOURCE_ID, propName: 'resourceId' },
  [LABELS.PENALTY_OR_REFUND]: { label: LABELS.PENALTY_OR_REFUND, propName: 'penalty', type: 'number' },
}
