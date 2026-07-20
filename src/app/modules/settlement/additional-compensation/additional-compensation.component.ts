import { Component, DestroyRef, effect, inject, OnInit, signal, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PaginatedTableComponent } from '@shared/components/paginated-table/paginated-table.component';
import { LABELS } from '@shared/constants/labels.const';
import { ACPipelineGroup, AllClaim, meterProcessBillingPeriod, pipeline, Reference, TableAction, TPL_TABLE_COLUMN } from '@shared/interfaces';
import { AdminService, MeterprocessService, SettlementService } from '@shared/services/api';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectOptionInterface } from 'ng-zorro-antd/select';
import { BehaviorSubject, exhaustMap, finalize, forkJoin, merge, Observable, Subject, switchMap, timer } from 'rxjs';
import { FileAClaimComponent } from './file-a-claim/file-a-claim.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PipelineTableColumns } from '@shared/constants/pipelines.const';
import { ToastrService } from 'ngx-toastr';
import { MESSAGES } from '@shared/constants/messages.const';
import { modalConfig, PHASE_TWO_AUTHORITIES } from '@shared/constants';
import { StlUtilitiesService } from '@shared/services/utils';
import { ConfirmWithDescComponent } from '@shared/components/confirm-with-desc/confirm-with-desc.component';
import { NgxPermissionsService } from 'ngx-permissions';

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
  private readonly toastrService$ = inject(ToastrService);
  private readonly stlUtil = inject(StlUtilitiesService);
  private readonly permsService = inject(NgxPermissionsService);

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

  // POLLING
  pollingTime = signal<number>(60000);
  private reload$ = new Subject<void>();
  private pollingTime$ = new BehaviorSubject<number>(this.pollingTime());
  url$: Observable<any>;
  firstLoad = signal<boolean>(true);
  // END OF POLLING

  currentPermissions = signal<string[]>([]);

  constructor() {
    this.pollingTime$.next(this.pollingTime());
    effect(() => {
      this.pollingTime$.next(this.pollingTime());
    });
  }


  ngOnInit(): void {
    this.buildForm();
    this.formatTableColumns();
    this.getReferences();

    this.url$ = this.getUrl();

    this.currentPermissions.set(Object.keys(this.permsService.getPermissions()));
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
        if (this.firstLoad()) {
          this.paginatedTable.loading = true;
        }

        return this.settlementService.search(this.filters, 'additionalCompensation', this.paginatedTable?.tableParams)
        .pipe(
          takeUntilDestroyed(this.destroyRef$),
          finalize(() => {
            if (this.paginatedTable) {
              this.paginatedTable.loading = false;
            }
            this.firstLoad.set(false);
          })
        )
        // return this.settlementService.search(
        //   this.filters,
        //   groupName,
        //   this.paginatedTable?.tableParams
        // ).pipe(
        //   takeUntilDestroyed(this.destroyRef$),
        //   finalize(() => {
        //     if (this.paginatedTable) {
        //       this.paginatedTable.loading = false;
        //     }
        //     this.firstLoad.set(false);
        //   })
        // )
      })
    );
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

    this.paginatedTable.loading = true;
    this.reload$.next();
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
        this.paginatedTable.loading = true;
        this.reload$.next();
      }
    })
  }

  resetFilters(): void {
    this.form.reset();
    this.filters = null;
    this.showForm = false;

    this.paginatedTable.loading = true;
    this.reload$.next();
  }


  isPipelineComplete = (perm: string, pipelineName: string, rowData: any) => !this.currentPermissions().includes(perm) || !rowData.pipelines.some((pipeline: pipeline) => pipeline.name === pipelineName && ['Succeeded', 'Completed'].includes(pipeline.status));

  actionControls = (rowData: any): TableAction<any>[] => [
    { label: LABELS.CALCULATE_GMR_VAT, hidden: () => {
      return this.isPipelineComplete(PHASE_TWO_AUTHORITIES.AC_CALC_GMR_VAT, 'additionalCompensation', rowData) || rowData?.published
    }, click: () => this.runJob('additionalCompensation-calculateGmrVat', rowData, LABELS.CALCULATE_GMR_VAT) },
    { label: LABELS.FINALIZE, hidden: () => {
      return this.isPipelineComplete(PHASE_TWO_AUTHORITIES.FINALIZE_AC, 'additionalCompensation-calculateGmrVat', rowData)|| rowData?.published
    }, click: () => this.runJob('additionalCompensation-finalize', rowData, LABELS.FINALIZE) },

    { label: LABELS.CALCULATE_TRANSACTION_ALLOCATION, hidden: () => {
      return this.isPipelineComplete(PHASE_TWO_AUTHORITIES.FINALIZE_AC, 'additionalCompensation-finalize', rowData) || rowData?.published
    }, click: () => this.stlUtil.triggerAllocModal('additionalCompensation-calculateTransAlloc', rowData, () => this.reloadTable() )},

  { label: LABELS.GENERATE_FILES, hidden: () => {
      return this.isPipelineComplete(PHASE_TWO_AUTHORITIES.FINALIZE_AC, 'additionalCompensation-finalize', rowData) || rowData?.published
    }, click: () => this.runJob('additionalCompensation-generateFiles', rowData, LABELS.GENERATE_FILES) },

    { label: LABELS.GENERATE_TRANSACTION_REPORT, hidden: () => {
      return this.isPipelineComplete(PHASE_TWO_AUTHORITIES.FINALIZE_AC, 'additionalCompensation-finalize', rowData) || rowData?.published
    }, click: () => this.runJob('additionalCompensation-generateTransactionReport', rowData, LABELS.GENERATE_TRANSACTION_REPORT) },

    { label: LABELS.SEND_NOTIFICATION, hidden: () => !rowData?.published, click: () => this.sendNotice(rowData) },
  ];

  sendNotice(rowData: any): void {
    this.stlUtil.sendNotification(rowData, () => {
      this.paginatedTable.loading = true;
      this.reload$.next();
    });
  }

  cancelRun(id: number): void {
    this.settlementService.cancelRun(+id)
    .subscribe(() => {
      this.reload$.next();
    });
  }

  deleteBillingId(mainRow: ACPipelineGroup, billingRow: AllClaim): void {
    const payload = {
      pipelineName: 'additionalCompensation-deleteAdditionalCompensationClaim',
      isGroup: true,
      refId: mainRow?.id,
      parameters: {
        pricingCondition: mainRow?.pricingCondition
      },
      startEndDateRanges: billingRow?.customDateRanges,
      claims: [
        {
          billingId: billingRow?.billingId,
          mtn: billingRow?.mtn,
          approveRate: billingRow?.approveRate
        }
      ]
    };


    this.modalService.confirm({
      ...modalConfig,
      nzTitle: LABELS.CONFIRMATION,
      nzContent: ConfirmWithDescComponent,
      nzWidth: '560px',
      nzData: {
        message: MESSAGES.CONFIRM_ACTION,
        descriptions: [
          { label: LABELS.DATE_TIME_RANGE, value: billingRow.customDateRanges.map(d => `${d.startDate} - ${d.endDate}`).join(', ')},
        ]
      },
      nzOnOk: () => {
        this.paginatedTable.loading = true;
        this.settlementService.etaJobs(payload, false)
          .subscribe({
            next: () => {
              this.toastrService$.success(MESSAGES.SUCCESS_JOB_TRIGGER_SINGULAR);
              this.reload$.next();
            },
            error: () => this.paginatedTable.loading = false
          });
        }
    });

  }

  reloadTable = () => {
    this.paginatedTable.loading = true;
    this.reload$.next();
  }

  runJob(pipelineName: string, rowData: any, title: string): void {
    this.modalService.confirm({
      ...modalConfig,
      nzTitle: title,
      nzContent: ConfirmWithDescComponent,
      nzData: {
        message: MESSAGES.CONFIRM_ACTION,
        descriptions: [
          { label: LABELS.BILLING_PERIOD, value: rowData?.billingPeriod},
          { label: LABELS.BILLING_START_DATE, value: rowData?.billingStartDate},
          { label: LABELS.BILLING_END_DATE, value: rowData?.billingEndDate }
        ]
      },
      nzOnOk: () => {
        const payload = {
          pipelineName,
          refId: rowData?.id,
          isGroup: true,
          parameters: {
            billingStartDate: rowData?.billingStartDate,
            billingEndDate: rowData?.billingEndDate,
            billingPeriodName: rowData?.billingPeriod,
            pricingCondition: rowData?.pricingCondition
          }
        };

        this.paginatedTable.loading = true;

        this.settlementService.etaJobs(payload, false)
          .pipe(takeUntilDestroyed(this.destroyRef$))
          .subscribe({
            next: () => {
              this.toastrService$.success(MESSAGES.SUCCESS_JOB_TRIGGER_SINGULAR);
              this.reload$.next();
            },
            error: () => this.paginatedTable.loading = false
          });
      }
    });
  }
}

const tableColumns: Record<string, TPL_TABLE_COLUMN> = {
  [LABELS.TRADING_DATE]: { label: LABELS.TRADING_DATE, propName: 'billingStartDate', width: '150px', type: 'template' },
  [LABELS.WORKSPACE_ID]: { label: LABELS.WORKSPACE_ID, propName: 'id', width: '100px' },
  [LABELS.PRICING_CONDITION]: { label: LABELS.PRICING_CONDITION, propName: 'pricingCondition', width: '100px', align: 'center' },
  [LABELS.STATUS]: { label: LABELS.STATUS, propName: 'status', width: '200px', align: 'center' },
  [LABELS.PUBLISHED]: { label: LABELS.PUBLISHED, propName: 'published', type: 'boolean', align: 'center' }
  // [LABELS.PROGRESS]: { label: LABELS.PROGRESS, propName: 'status', width: '100px', align: 'center', type: 'template' },
}

const claimTableCols: Record<string, TPL_TABLE_COLUMN> = {
  [LABELS.BILLING_ID]: { label: LABELS.BILLING_ID, propName: 'billingId', width: '150px' },
  [LABELS.MTN]: { label: LABELS.MTN, propName: 'mtn', width: '150px' },
  [LABELS.APPROVED_RATE]: { label: LABELS.APPROVED_RATE, propName: 'approveRate', width: '250px' },

  [LABELS.DATE_TIME_RANGE]: { label: LABELS.DATE_TIME_RANGE, propName: 'startDate', width: '250px', type: 'template' },
  [LABELS.CREATED_DATE]: { label: LABELS.CREATED_DATE, propName: 'creationDate', type: 'date' },
}
