import { Component, DestroyRef, effect, inject, OnInit, signal, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PaginatedTableComponent } from '@shared/components/paginated-table/paginated-table.component';
import { PHASE_TWO_AUTHORITIES, WESM_PENALTY_STATUS, WESM_PENALTY_TYPE } from '@shared/constants';
import { LABELS } from '@shared/constants/labels.const';
import {
  meterProcessBillingPeriod,
  TPL_TABLE_COLUMN,
  TableAction,
  meterProcessPipelineGroup,
  meterProcessPipeline,
  PublishSettlement,
  settlementPipeline
} from '@shared/interfaces';
import { MeterprocessService, SettlementService } from '@shared/services/api';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectOptionInterface } from 'ng-zorro-antd/select';
import { BehaviorSubject, exhaustMap, finalize, merge, Observable, of, Subject, switchMap, timer } from 'rxjs';
import { PenaltyGenerateIwsComponent } from './penalty-generate-iws/penalty-generate-iws.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MESSAGES } from '@shared/constants/messages.const';
import { ToastrService } from 'ngx-toastr';
import { StlUtilitiesService } from '@shared/services/utils/stl-actions.util.service';
import { NgxPermissionsService } from 'ngx-permissions';

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
  private readonly permissionService = inject(NgxPermissionsService);
  private readonly stlUtil = inject(StlUtilitiesService);

  LABELS = LABELS;
  AUTH = PHASE_TWO_AUTHORITIES;
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
  hasCalcPerm: boolean;

  // POLLING
  pollingTime = signal<number>(60000);
  private reload$ = new Subject<void>();
  private pollingTime$ = new BehaviorSubject<number>(this.pollingTime());
  url$: Observable<any>;
  firstLoad = signal<boolean>(true);
  // END OF POLLING


  pipelineRecords: Record<string, any> = {
    ['penalty-calculate']: {
      message: MESSAGES.CONFIRM_SETTLEMENT_MSG('Calculate Financial Penalty'),
      modalTitle: `${LABELS.CALCULATE} ${LABELS.PENALTY}`
    },
    ['penalty-finalize']: {
      message: MESSAGES.CONFIRM_SETTLEMENT_MSG('Finalize Financial Penalty'),
      modalTitle: `${LABELS.FINALIZE} ${LABELS.PENALTY}`
    },
    ['penalty-calculateRefund']: {
      message: MESSAGES.CONFIRM_SETTLEMENT_MSG('Calculate Financial Penalty - Refund'),
      modalTitle: `${LABELS.CALCULATE} ${LABELS.REFUND}`
    },
    ['penalty-finalizeRefund']: {
      message: MESSAGES.CONFIRM_SETTLEMENT_MSG('Finalize Financial Penalty - Refund'),
      modalTitle: `${LABELS.FINALIZE} ${LABELS.REFUND}`
    },
  }

  constructor() {
    this.pollingTime$.next(this.pollingTime());
    effect(() => {
      this.pollingTime$.next(this.pollingTime());
    });
  }

  ngOnInit(): void {
    this.statusOptions = WESM_PENALTY_STATUS.map(opt => ({ label: opt, value: opt }));
    this.typeOptions = Object.keys(WESM_PENALTY_TYPE)
      .map(key => ({ label: WESM_PENALTY_TYPE[key as keyof typeof WESM_PENALTY_TYPE], value: key }))

    this.buildForm();
    this.formatTableColumns();
    this.getOptions();

    this.permissionService.hasPermission(PHASE_TWO_AUTHORITIES.CALC_PENALTY)
      .then(hasPerm => this.hasCalcPerm = hasPerm);

    this.url$ = this.getUrl();
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
    const polling$ = this.pollingTime$.pipe(
      switchMap(interval => {
        return timer(0, interval)
      })
    );

    return merge(
      polling$,
      this.reload$
    ).pipe(
      exhaustMap(() => {
        if (!this.paginatedTable) {
          return of([]);
        }

        if (this.firstLoad()) {
          this.paginatedTable.loading = true;
        }

        return this.settlementService.search(this.filters, 'penalty', this.paginatedTable.tableParams)
          .pipe(
            finalize(() => {
              if (this.paginatedTable) {
                this.paginatedTable.loading = false;
              }

              this.firstLoad.set(false);
          })
        )
      }),
      takeUntilDestroyed(this.destroyRef$)
    );

  }

  generateIws(isRefund = false): void {
    const modal = this.modalService.create({
      nzTitle: `Generate ${isRefund ? 'Refund' : 'Penalty'} Input Workspace`,
      nzContent: PenaltyGenerateIwsComponent,
      nzCentered: true,
      nzMaskClosable: false,
      nzData: { isRefund },
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
        this.paginatedTable.loading = false;
        this.reload$.next();
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
    this.paginatedTable.loading = false;
    this.reload$.next();
  }

  resetFilters(): void {
    this.form.reset();
    this.showForm = false;
    this.filters = null;
    this.paginatedTable.loading = false;
    this.reload$.next();
}

  triggerAction(pipelineName: string, rowData: meterProcessPipelineGroup): void {
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
        this.paginatedTable.loading = false;
        this.paginatedTable.expandSet.clear();
        this.reload$.next();
      });
  }

  isFinalized(rowData: meterProcessPipelineGroup): boolean {
    const isRefund = rowData.penaltyHeaders?.[0]?.type === 'REFUND';
    return rowData.pipelines?.some((p: meterProcessPipeline) => p.name === `penalty-finalize${isRefund ? 'Refund' : ''}` && p.status === 'Completed');
  }

  hideAction(rowData: meterProcessPipelineGroup, labelName: string): boolean {
    return !rowData.pipelines?.some((p: meterProcessPipeline) => p.name === labelName && p.status === 'Completed') || !this.hasCalcPerm;
  }

  actionControls = (row: meterProcessPipelineGroup): TableAction<any> [] => {
    return row.published ? [
      {
        label: LABELS.SEND_NOTIFICATION,
        value: 'send',
        click: () => this.stlUtil.sendNotification(row, () => {
          this.paginatedTable.expandSet.clear();
          this.paginatedTable.loading = false;
          this.reload$.next();
        }),
        hidden: () => !row.published
      },
    ] : [
      {
        label: LABELS.CALCULATE,
        value: 'calculate',
        click: () => {
          const isPenalty = row.penaltyHeaders?.[0]?.type === 'PENALTY';
          this.triggerAction(`penalty-calculate${isPenalty ? '' : 'Refund'}`, row);
        },
        hidden: () => this.isFinalized(row) || this.hideAction(row, 'penalty'),
      },
      {
        label: LABELS.FINALIZE,
        value: 'finalize',
        click: (rowData: any) => {
          const isRefund = row.pipelines?.find(p => p.name === 'penalty-calculateRefund');
          this.stlUtil.triggerAllocModal(`penalty-finalize${isRefund ? 'Refund' : ''}`, rowData, () => {
            this.paginatedTable.expandSet.clear();
            this.paginatedTable.loading = false;
            this.reload$.next();
          });
        },
        hidden: () => {
          const isRefund = row.pipelines?.find(p => p.name === 'penalty-calculateRefund');
          return this.isFinalized(row) || this.hideAction(row, `penalty-calculate${isRefund ? 'Refund' : ''}`)
        },
      },
      {
        label: LABELS.PUBLISH,
        value: 'publish',
        click: () => this.handlePublish(row),
        hidden: () => {
          const isRefund = row.pipelines?.find(p => p.name === 'penalty-calculateRefund');
          return this.hideAction(row, `penalty-finalize${isRefund ? 'Refund' : ''}`)
        },
      }
    ];
  }

  handlePublish(rowData: meterProcessPipelineGroup): void {
    const payload: PublishSettlement = {
      pipelineGroupId: rowData.id,
      stlGroupId: rowData.id,
      jobExecutionId: rowData.id,
      functionName: 'Financial Penalty Calculation',
      billingPeriod: rowData.billingPeriod
    };

    const title = LABELS.PUBLISH_PENALTY_REPORT;
    const message = MESSAGES.CONFIRM_PUBLISH_ITEM(LABELS.PENALTY_REPORT.toLowerCase());
    const descriptions = [
      {
        label: LABELS.BILLING_PERIOD,
        value: `${rowData.billingStartDate} to ${rowData.billingEndDate}`
      },
    ];

    this.stlUtil.publish(payload, title, message, descriptions, () => this.reload$.next());
  }

  onCancel(): void {
    this.paginatedTable.loading = true;
    this.toastrService.success(MESSAGES.SUCCESS_CANCEL_ITEM('run'));
    this.paginatedTable.expandSet.clear();
    this.reload$.next();
  }

  progressBarCondition = (rowData: settlementPipeline): boolean => {
    return rowData.status?.startsWith('In-Progress');
  }

}


const tableColumns: Record<string, TPL_TABLE_COLUMN> = {
  [LABELS.BILLING_PERIOD_TRADING_DATE]: { label: LABELS.BILLING_PERIOD_TRADING_DATE, propName: 'parameters', type: 'template' },
  [LABELS.WORKSPACE_ID]: { label: LABELS.WORKSPACE_ID, propName: 'id', width: '120px', align: 'center' },
  [LABELS.STATUS]: { label: LABELS.STATUS, propName: 'status', width: '250px', align: 'center' },
  [LABELS.PUBLISHED]: { label: LABELS.PUBLISHED, propName: 'published', type: 'boolean', align: 'center' }
}

const billingColumns: Record<string, TPL_TABLE_COLUMN> = {
  [LABELS.BILLING_ID]: { label: LABELS.BILLING_ID, propName: 'billingId' },
  [LABELS.TYPE]: { label: LABELS.TYPE, propName: 'type', align: 'center', type: 'enumLabel' },
  [LABELS.PENALTY_AMOUNT]: { label: LABELS.PENALTY_AMOUNT, propName: 'penaltyAmount', align: 'right', type: 'amount' },
}

const expandedTableCols: Record<string, TPL_TABLE_COLUMN> = {
  [LABELS.DOCUMENT_NUMBER]: { label: LABELS.DOCUMENT_NUMBER, propName: 'documentNo' },
  [LABELS.DATE]: { label: LABELS.DATE, propName: 'date', type: 'date' },
  [LABELS.RESOURCE_ID]: { label: LABELS.RESOURCE_ID, propName: 'resourceId' },
  [LABELS.PENALTY_OR_REFUND]: { label: LABELS.PENALTY_OR_REFUND, propName: 'penalty', type: 'amount', align: 'right' },
}
