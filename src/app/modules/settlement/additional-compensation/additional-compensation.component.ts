import { Component, DestroyRef, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PaginatedTableComponent } from '@shared/components/paginated-table/paginated-table.component';
import { LABELS } from '@shared/constants/labels.const';
import { meterProcessBillingPeriod, Reference, TPL_TABLE_COLUMN } from '@shared/interfaces';
import { AdminService, MeterprocessService, SettlementService } from '@shared/services/api';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectOptionInterface } from 'ng-zorro-antd/select';
import { forkJoin, Observable, of } from 'rxjs';
import { FileAClaimComponent } from './file-a-claim/file-a-claim.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PipelineTableColumns } from '@shared/constants/pipelines.const';

@Component({
  selector: 'app-additional-compensation',
  standalone: false,
  templateUrl: './additional-compensation.component.html'
})
export class AdditionalCompensationComponent implements OnInit {

  @ViewChild('paginatedTable') paginatedTable!: PaginatedTableComponent<any>;
  @ViewChild('bpTpl', { static: true }) bpTpl!: TemplateRef<HTMLElement>;
  @ViewChild('rateTpl', { static: true }) rateTpl!: TemplateRef<HTMLElement>;
  @ViewChild('mtnTpl', { static: true }) mtnTpl!: TemplateRef<HTMLElement>;
  @ViewChild('billingIdTpl', { static: true }) billingIdTpl!: TemplateRef<HTMLElement>;
  @ViewChild('progressTpl', { static: true }) progressTpl!: TemplateRef<HTMLElement>;
  @ViewChild('tagTpl', { static: true }) tagTpl!: TemplateRef<HTMLElement>;
  @ViewChild('datetimeTpl', { static: true }) datetimeTpl!: TemplateRef<HTMLElement>;

  private readonly formBuilder = inject(FormBuilder);
  private readonly settlementService = inject(SettlementService);
  private readonly meteringService = inject(MeterprocessService);
  private readonly modalService = inject(NzModalService);
  private readonly adminService = inject(AdminService);
  private readonly destroyRef$ = inject(DestroyRef);

  LABELS = LABELS;
  tableColumns: TPL_TABLE_COLUMN[] = [];
  form: FormGroup;
  showForm = false;
  claimsTableCols: TPL_TABLE_COLUMN[];
  expandedTableCols: TPL_TABLE_COLUMN[];

  billingPeriods: meterProcessBillingPeriod[] = [];
  billingPeriodOpts: { label: any; value: any; }[] = [];
  pricingConditionOpts: NzSelectOptionInterface[] = [];
  statusOpts: NzSelectOptionInterface[] = [];

  filters: any = {};

  ngOnInit(): void {
    this.buildForm();
    this.formatTableColumns();
    this.getReferences();
  }

  buildForm(): void {
    this.form = this.formBuilder.group({
      pricingCondition: [null],
      billingPeriod: [null],
      status: [null],
      type: [null]
    });
  }

  formatTableColumns(): void {
    tableColumns[LABELS.TRADING_DATE].template = this.bpTpl;
    // tableColumns[LABELS.PROGRESS].template = this.progressTpl;

    claimTableCols[LABELS.APPROVED_RATE].template = this.rateTpl;
    claimTableCols[LABELS.MTN].template = this.mtnTpl;
    claimTableCols[LABELS.BILLING_ID].template = this.billingIdTpl;
    claimTableCols[LABELS.DATE_TIME_RANGE].template = this.datetimeTpl;

    PipelineTableColumns[LABELS.STATUS].template = this.tagTpl;

    this.tableColumns = Object.values(tableColumns);
    this.claimsTableCols = Object.values(claimTableCols);
    this.expandedTableCols = Object.values(PipelineTableColumns);

  }

  getUrl(): Observable<any> {
    if (!this.paginatedTable) {
      return of([]);
    }

    return this.settlementService.search(this.filters, 'additionalCompensation', this.paginatedTable?.tableParams);
  }

  getReferences(): void {
    const formatOpts = (opts: Reference[]) => opts.map(({label}) => ({ label, value: label }));

    forkJoin({
      billingPeriod: this.meteringService.getBillingPeriod(),
      pricingCondition: this.adminService.getRefByType('AC_PRICING_CONDITION'),
      status: this.adminService.getRefByType('AC_STATUS'),
    })
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe(({ billingPeriod, pricingCondition , status }) => {
        this.billingPeriods = billingPeriod as meterProcessBillingPeriod[];
        this.billingPeriodOpts = (billingPeriod as meterProcessBillingPeriod[])
          .map(bp => ({ label: bp.supplyMonth, value: bp.supplyMonth }));

        this.pricingConditionOpts = formatOpts(pricingCondition);
        this.statusOpts = formatOpts(status);
      });
  }

  applyFilter(): void {
    const values = this.form.getRawValue();
    this.filters = values;
    this.paginatedTable.search();
  }

  triggerFileClaim(): void {
    const modal = this.modalService.create({
      nzTitle: LABELS.FILE_A_CLAIM,
      nzContent: FileAClaimComponent,
      nzCentered: true,
      nzWidth: '800px',
      nzMaskClosable: false,
      nzFooter: [
        {
          label: LABELS.CLOSE,
          onClick: (component: FileAClaimComponent) => component.triggerClose(),
          disabled: (component?: FileAClaimComponent) => component ? (component?.busy$ && !component?.busy$?.closed) : true
        },
        {
          label: LABELS.FILE_A_CLAIM,
          type: 'primary',
          onClick: (component: FileAClaimComponent) => component.triggerOk(),
          disabled: (component?: FileAClaimComponent) => component ? (component?.busy$ && !component?.busy$?.closed) : true
        }
      ],
      nzBodyStyle: {
        maxHeight: '75vh',
        overflowY: 'auto'
      },
    });

    modal.afterClose.subscribe(res => {
      if (res) {
        this.paginatedTable?.search();
      }
    })
  }

  resetFilters(): void {
    this.form.reset();
    this.filters = null;
    this.showForm = false;
    this.paginatedTable?.search();
  }

}

const tableColumns: Record<string, TPL_TABLE_COLUMN> = {
  [LABELS.TRADING_DATE]: { label: LABELS.TRADING_DATE, propName: 'billingStartDate', width: '150px', type: 'template' },
  [LABELS.WORKSPACE_ID]: { label: LABELS.WORKSPACE_ID, propName: 'id', width: '100px' },
  [LABELS.PRICING_CONDITION]: { label: LABELS.PRICING_CONDITION, propName: 'pricingCondition', width: '100px', align: 'center' },
  [LABELS.STATUS]: { label: LABELS.STATUS, propName: 'status', width: '200px', align: 'center' },
  // [LABELS.PROGRESS]: { label: LABELS.PROGRESS, propName: 'status', width: '100px', align: 'center', type: 'template' },
}

const claimTableCols: Record<string, TPL_TABLE_COLUMN> = {
  [LABELS.BILLING_ID]: { label: LABELS.BILLING_ID, propName: 'billingId', width: '150px' },
  [LABELS.MTN]: { label: LABELS.MTN, propName: 'mtn', width: '150px' },
  [LABELS.APPROVED_RATE]: { label: LABELS.APPROVED_RATE, propName: 'approveRate', width: '250px' },

  [LABELS.DATE_TIME_RANGE]: { label: LABELS.DATE_TIME_RANGE, propName: 'startDate', width: '250px', type: 'template' },
  [LABELS.CREATED_DATE]: { label: LABELS.CREATED_DATE, propName: 'creationDate', type: 'date' },
}
