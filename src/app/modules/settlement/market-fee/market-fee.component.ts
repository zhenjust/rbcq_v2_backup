import { Component, DestroyRef, inject, OnInit, signal, TemplateRef, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PaginatedTableComponent } from '@shared/components/paginated-table/paginated-table.component';
import { LABELS } from '@shared/constants/labels.const';
import { PipelineTableColumns } from '@shared/constants/pipelines.const';
import { TPL_TABLE_COLUMN, meterProcessBillingPeriod, PublishSettlement } from '@shared/interfaces';
import { SettlementService, MeterprocessService } from '@shared/services/api';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectOptionInterface } from 'ng-zorro-antd/select';
import { Observable, forkJoin, timer, switchMap, Subject, merge, BehaviorSubject, finalize, exhaustMap } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { MeterProcessTypes } from '@shared/enums';
import { RunMarketFeeComponent } from './run-market-fee/run-market-fee.component';
import { ToastrService } from 'ngx-toastr';
import { MESSAGES } from '@shared/constants/messages.const';
import { TemplateTableComponent } from '@shared/components/template-table/template-table.component';
import { PHASE_TWO_AUTHORITIES } from '@shared/constants';
import { effect } from '@angular/core';
import { StlUtilitiesService, DownloadUtilService, DateFormatterUtilService } from '@shared/services/utils';
import { ConfirmWithDescComponent } from '@shared/components/confirm-with-desc/confirm-with-desc.component';
import { UploadBillingStatementComponent } from '@shared/components/upload-billing-statement/upload-billing-statement.component';
@Component({
  selector: 'app-market-fee',
  standalone: false,
  templateUrl: './market-fee.component.html',
})
export class MarketFeeComponent  implements OnInit {

  @ViewChild('paginatedTable') paginatedTable!: PaginatedTableComponent<any>;
  @ViewChild('bpTpl', { static: true }) bpTpl!: TemplateRef<HTMLElement>;
  @ViewChild('tagTpl', { static: true }) tagTpl!: TemplateRef<HTMLElement>;
  @ViewChild('downloadTpl', { static: false }) downloadTpl!: TemplateRef<void>;

  private readonly formBuilder = inject(FormBuilder);
  private readonly settlementService = inject(SettlementService);
  private readonly meteringService = inject(MeterprocessService);
  private readonly modalService = inject(NzModalService);
  private readonly destroyRef$ = inject(DestroyRef);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly toastrService = inject(ToastrService);
  private readonly stlUtil = inject(StlUtilitiesService);
  private readonly du = inject(DownloadUtilService);
  private readonly dfs = inject(DateFormatterUtilService);

  AUTH = PHASE_TWO_AUTHORITIES;

  isEnergy = signal<boolean>(false);

  LABELS = LABELS;
  processTypes = MeterProcessTypes;
  tableColumns: TPL_TABLE_COLUMN[] = [];
  form: FormGroup;
  showForm = false;
  expandedTableColumns: TPL_TABLE_COLUMN[];
  billingPeriods: meterProcessBillingPeriod[] = [];
  billingPeriodOpts: NzSelectOptionInterface[] = [];
  processTypeOptions: NzSelectOptionInterface[] = [];
  filters: any = {};

  // POLLING
  pollingTime = signal<number>(60000);
  private reload$ = new Subject<void>();
  private pollingTime$ = new BehaviorSubject<number>(this.pollingTime());
  url$: Observable<any>;
  firstLoad = signal<boolean>(true);
  // END OF POLLING

  constructor() {
    this.pollingTime$.next(this.pollingTime());
    effect(() => {
      this.pollingTime$.next(this.pollingTime());
    });
  }

  ngOnInit(): void {
    this.processTypeOptions = Object.keys(MeterProcessTypes)
      .filter(key => key !== MeterProcessTypes.DAILY)
      .map(opt => ({ label: LABELS[opt as keyof typeof LABELS], value: opt }));

    this.isEnergy.set(this.activatedRoute.snapshot.data['isEnergy']);

    this.buildForm();
    this.formatTableColumns();
    this.getReferences();
    this.url$ = this.getUrl();
  }

  buildForm(): void {
    this.form = this.formBuilder.group({
      billingPeriod: [null],
      processType: [null]
    });
  }

  formatTableColumns(): void {
    tableColumns[LABELS.BILLING_PERIOD].template = this.bpTpl;
    PipelineTableColumns[LABELS.STATUS].template = this.tagTpl;

    this.tableColumns = Object.values(tableColumns);
    this.expandedTableColumns = Object.values(expandedTableColumns);
  }

  getUrl(): Observable<any> {
    const groupName = this.isEnergy() ? 'energyMarketFee' : 'reserveMarketFee';

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

        return this.settlementService.search(
          this.filters,
          groupName,
          this.paginatedTable?.tableParams
        ).pipe(
          takeUntilDestroyed(this.destroyRef$),
          finalize(() => {
            if (this.paginatedTable) {
              this.paginatedTable.loading = false;
            }
            this.firstLoad.set(false);
          })
        )
      })
    );
  }

  getReferences(): void {
    forkJoin({
      billingPeriod: this.meteringService.getBillingPeriod(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe(({ billingPeriod }) => {
        this.billingPeriods = billingPeriod as meterProcessBillingPeriod[];
        this.billingPeriodOpts = (billingPeriod as meterProcessBillingPeriod[])
          .map(bp => ({ label: bp.supplyMonth, value: bp.supplyMonth }));
      });
  }

  applyFilter(): void {
    this.filters = this.form.getRawValue();
    this.paginatedTable.loading = true;
    this.reload$.next();
  }

  resetFilters(): void {
    this.form.reset();
    this.filters = null;
    this.showForm = false;
    this.paginatedTable.loading = true;
    this.reload$.next();
  }

  runMarketFee(): void {
    const modal = this.modalService.create({
      nzTitle: `${LABELS.RUN} ${LABELS.ENERGY_MARKET_FEE}`,
      nzContent: RunMarketFeeComponent,
      nzCentered: true,
      nzMaskClosable: false,
      nzData: { isEnergy: this.isEnergy() },
      nzFooter: [
        {
          label: LABELS.CLOSE,
          onClick: (component) => component?.triggerClose(),
          disabled: (component) => component ? (component?.busy$ && !component?.busy$?.closed) : true
        },
        {
          label: LABELS.RUN,
          type: 'primary',
          onClick: (component) => component?.triggerOk(),
          disabled: (component) => component ? (component.form.invalid || (component?.busy$ && !component?.busy$?.closed)) : true
        }
      ],
    });

    modal.afterClose.subscribe(res => {
      if (res) {
        this.paginatedTable.loading = true;
        this.reload$.next();
      }
    })
  }

  triggerJob(pipelineName: string, rowData: any, component: TemplateTableComponent, label: string): void {
    const mainPipelineName = this.pipelineName;
    const payload = {
      pipelineName: `${mainPipelineName}-${pipelineName}`,
      isGroup: true,
      refId: rowData.id
    };

    const msg = MESSAGES.CONFIRM_SETTLEMENT_MSG(label);

    this.modalService.confirm({
      nzTitle: label,
      nzCentered: true,
      nzContent: msg,
      nzOnOk: () => this.runJob(payload, false, component)
    });
  }

  runJob(payload: any, isGroup = false, component: TemplateTableComponent): void {
    component.loading$ = this.settlementService.etaJobs(payload, isGroup)
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe(() => {
        this.toastrService.success(MESSAGES.SUCCESS_JOB_TRIGGER);
        this.paginatedTable.loading = true;
        this.reload$.next();
      });
  }

  finalize(action: string, row: any, component: TemplateTableComponent, label: string): void {
    if (row.parameters.processType === MeterProcessTypes.PRELIM) {
      this.triggerJob(action, row, component, label);
    } else {
      const rowData = {...row, ...row.parameters};
      this.stlUtil.triggerAllocModal(`${this.pipelineName}-${action}`, rowData, () => this.reload$.next());
    }
  }

  publish(functionName: string, allData: any, rowData: any): void {
    const payload: PublishSettlement = {
      pipelineId: +rowData.id,
      stlGroupId: +allData.id,
      jobExecutionId: +rowData.id,
      functionName: functionName
    };

    const nzData = {
      message: MESSAGES.CONFIRM_PUBLISH_ITEM(LABELS.TRANSACTION_REPORT.toLowerCase()),
      okAction: LABELS.PUBLISH,
      descriptions: [
        {
          label: LABELS.BILLING_PERIOD,
          value: `${rowData.parameters.billingStartDate} to ${rowData.parameters.billingEndDate}`
        },
      ],
      onOk: () => this.settlementService.publish(payload)
    };

    const modal = this.modalService.create({
      nzTitle: LABELS.PUBLISH_TRANSACTION_REPORT,
      nzContent: ConfirmWithDescComponent,
      nzCentered: true,
      nzFooter: null,
      nzData,
      nzWidth: '600px',
    });

    modal.afterClose.subscribe(res => {
      if (res) {
        this.toastrService.success(res.message);
        this.reload$.next();
      }
    });
  }

  uploadBillingStatement(allData: any, subRowData: any): void {
    const modal = this.modalService.create({
      nzTitle: LABELS.UPLOAD_BILLING_STATEMENT,
      nzContent: UploadBillingStatementComponent,
      nzCentered: true,
      nzFooter: [
        {
          label: LABELS.CLOSE,
          onClick: (component) => component?.triggerClose(),
          disabled: (component) => component ? (component?.busy$ && !component?.busy$?.closed) : true
        },
        {
          label: LABELS.UPLOAD,
          type: 'primary',
          onClick: (component) => component?.triggerOk(),
          disabled: (component) => component ? ((component.formGroup.invalid || !component.fileList?.length) || (component?.busy$ && !component?.busy$?.closed)) : true
        }
      ],
      nzData: { allData, subRowData },
      nzWidth: '600px',
    });

    modal.afterClose.subscribe(res => {
      if (res) {
        this.toastrService.success(res.message);
        this.reload$.next();
      }
    });
  }

  downloadBillingStatement(type: MeterProcessTypes, subRowData: any) {
    const pipelineName = this.pipelineName;
    const filename = `${pipelineName}-${subRowData.id}-${this.dfs.formatDate(subRowData.lastModifiedDatetime, 'yyyyMMddHHmmss')}.zip`;

    this.du.addDownloading(subRowData.id);

    this.settlementService.downloadBillingStatementZip(type, subRowData.id)
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe({
        next: (response) => {
          this.du.processDownloadEvent(response, subRowData, this.downloadTpl, filename, MESSAGES.SUCCESS_DOWNLOAD_ITEM(`billing statement for ${subRowData.id}`));
        },
        error: () => {
          this.du.clearProgress(subRowData.id);
        }
      });
  }

  isDownloadingReport(pipelineId: number): boolean {
    return this.du.isDownloading(pipelineId);
  }

  get pipelineName(): string { return this.isEnergy() ? 'energyMarketFee' : 'reserveMarketFee'; }
}


const tableColumns: Record<string, TPL_TABLE_COLUMN> = {
  // [LABELS.GROUP_ID]: { label: LABELS.GROUP_ID, propName: 'id' },
  [LABELS.RUN_DATE_AND_TIME]: { label: LABELS.RUN_DATE_AND_TIME, propName: 'runDatetime', type: 'date' },
  [LABELS.BILLING_PERIOD]: { label: LABELS.BILLING_PERIOD, propName: 'billingStartDate', type: 'template' },
  [LABELS.PROCESS_TYPE]: { label: LABELS.PROCESS_TYPE, propName: 'processType', type: 'enumLabel' },
}

const expandedTableColumns: Record<string, TPL_TABLE_COLUMN> = {
  [LABELS.WORKSPACE_ID]: { label: LABELS.WORKSPACE_ID, propName: 'id' },
  [LABELS.TYPE]: { label: LABELS.TYPE, propName: 'parameters', secondPropName: 'marketFeeType' },
  [LABELS.MODE]: { label: LABELS.MODE, propName: 'parameters', secondPropName: 'marketFeeMode' },
  [LABELS.STATUS]: { label: LABELS.STATUS, propName: 'status' },
  [LABELS.PUBLISHED]: { label: LABELS.PUBLISHED, propName: 'published', type: 'boolean', align: 'center' }
}
