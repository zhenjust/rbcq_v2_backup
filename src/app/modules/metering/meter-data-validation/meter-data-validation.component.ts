import { Component, DestroyRef, effect, inject, OnInit, signal, TemplateRef, ViewChild } from '@angular/core';
import { HttpEventType } from '@angular/common/http';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PaginatedTableComponent } from '@shared/components/paginated-table/paginated-table.component';
import { METER_PROCESS_TYPE_OPTION } from '@shared/constants';
import { LABELS } from '@shared/constants/labels.const';
import { MESSAGES } from '@shared/constants/messages.const';
import { TPL_TABLE_COLUMN, meterProcessOptions, meterProcessBillingPeriod, TableAction, DownloadMdvParams } from '@shared/interfaces';
import { MeterprocessService } from '@shared/services/api';
import { DownloadUtilService } from '@shared/services/utils';
import { format } from 'date-fns';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, distinctUntilChanged, filter, merge, Observable, Subject, timer } from 'rxjs';
import { GenerateMdvComponent } from './generate-mdv/generate-mdv.component';
import { MeterProcessTypes } from '@shared/enums';
import { exhaustMap, finalize, switchMap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-meter-data-validation',
  standalone: false,
  templateUrl: './meter-data-validation.component.html',
  styleUrl: './meter-data-validation.component.scss'
})
export class MeterDataValidationComponent implements OnInit {

  @ViewChild('paginatedTable', { static: false }) paginatedTable: PaginatedTableComponent<any>;
  @ViewChild('bpTpl', { static: true }) bpTpl: TemplateRef<HTMLElement>;
  @ViewChild('fileTpl', { static: true }) fileTpl: TemplateRef<HTMLElement>;
  @ViewChild('tagTpl', { static: true }) tagTpl: TemplateRef<HTMLElement>;
  @ViewChild('tagPopoverTpl', { static: true }) tagPopoverTpl: TemplateRef<HTMLElement>;

  tableColumns: TPL_TABLE_COLUMN[];
  LABELS = LABELS;

  readonly meterService = inject(MeterprocessService);
  readonly modalService = inject(NzModalService);
  readonly downloadService = inject(DownloadUtilService);
  readonly toastrService = inject(ToastrService);
  readonly destroyRef$ = inject(DestroyRef);

  formBuilder = inject(FormBuilder);

  form: FormGroup;
  showForm = false;
  processTypeOpts: meterProcessOptions[];
  billingPeriodOpts: { label: string; value: { startDate: string, endDate: string }; }[];
  expandedTableCols: TPL_TABLE_COLUMN[];

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
    this.formatTableColumns();
    this.buildForm();
    this.getBillingPeriods();

    this.processTypeOpts = METER_PROCESS_TYPE_OPTION;
    this.url$ = this.getUrl();
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

        const formValues = this.form.getRawValue();
        let tdFormatted;
        if (formValues?.tradingDate) {
          tdFormatted = {
            startDate: format(formValues?.tradingDate, 'yyyy-MM-dd'),
            endDate: format(formValues?.tradingDate, 'yyyy-MM-dd')
          }
        }

        const filters = {
          ...formValues,
          ...(this.isDaily ? tdFormatted : formValues.billingPeriod),
          name: 'runMDVReport'
        };

        delete filters?.billingPeriod;
        delete filters?.tradingDate;

        return this.meterService.searchByNameParams(filters, this.paginatedTable?.tableParams)
          .pipe(
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

  buildForm(): void {
    this.form = this.formBuilder.group({
      billingPeriod: [null],
      processType: [null],
      tradingDate: [null]
    });

    this.form.get('processType')?.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe(() => {
        this.form.get('billingPeriod')?.reset();
        this.form.get('tradingDate')?.reset();
      });
  }

  resetFilters(): void {
    this.showForm =! this.showForm;
    this.form.reset();
    this.reload$.next();
  }

  getBillingPeriods(): void {
    const formatDate = (date: string) => format(new Date(date), 'yyyy-MM-dd');

    this.meterService.getBillingPeriod()
      .subscribe({
        next: options => {
          this.billingPeriodOpts = (options as meterProcessBillingPeriod[])
            .map(bp => ({
              label: bp.supplyMonth,
              value: { startDate: formatDate(bp.startDate), endDate: formatDate(bp.endDate) }
            }));
        }
      });
  }

  formatTableColumns(): void {
    tableColumns[LABELS.BILLING_PERIOD_TRADING_DATE].template = this.bpTpl;
    expandedTableCols[LABELS.FILE].template = this.fileTpl;
    tableColumns[LABELS.STATUS].template = this.tagTpl;
    expandedTableCols[LABELS.STATUS].template = this.tagPopoverTpl;

    this.tableColumns = Object.values(tableColumns);
    this.expandedTableCols = Object.values(expandedTableCols);
  }

  generate(): void {
    const modal = this.modalService.create({
      nzTitle: LABELS.GENERATE,
      nzCentered: true,
      nzContent: GenerateMdvComponent,
    });

    modal.afterClose.subscribe(val => {
      if (val) {
        this.reload$.next();
      }
    });
  }

  download(data: any): void {
    const { workspaceId, fileName } = data;
    const params: DownloadMdvParams = { workspaceId, fileName };

    data.loading = true;
    this.meterService.downloadMeteringReport(params, 'mdv')
      .pipe(
        filter(res => res.type === HttpEventType.Response),
        takeUntilDestroyed(this.destroyRef$),
        finalize(() => data.loading = false)
      )
      .subscribe(res => {
        this.downloadService.handleDownloadedFile(res, fileName);
      });
  }

  delete(data: any): void {
    this.modalService.confirm({
      nzTitle: `${LABELS.DELETE} ${LABELS.METER_DATA_VALIDATION}`,
      nzCentered: true,
      nzContent: MESSAGES.CONFIRM_DELETE_ITEM(LABELS.METER_DATA_VALIDATION),
      nzOnOk: () => {
        const id = data.pipelineRuns[0].workspaceId;

        data.loading = true;
        this.meterService.deleteMeteringReport(id, 'mdv-delete')
          .pipe(
            takeUntilDestroyed(this.destroyRef$),
            finalize(() => data.loading = false)
          )
          .subscribe(() => {
            const message = MESSAGES.SUCCESS_DELETE_ITEM(LABELS.METER_DATA_VALIDATION);
            this.toastrService.success(message);
            this.reload$.next();
          });
      }
    });
  }


  get isDaily(): boolean { return this.form.get('processType')?.value === MeterProcessTypes.DAILY; }

  actionControls = (rowData: any): TableAction<any>[] => [
    { label: LABELS.DELETE, value: 'generate', click: () => this.delete(rowData), danger: true, loading: rowData.loading},
  ];

}

const tableColumns: Record<string, TPL_TABLE_COLUMN> = {
  [LABELS.BILLING_PERIOD_TRADING_DATE]: { label: LABELS.BILLING_PERIOD_TRADING_DATE, propName: 'parameters', width: '150px', type: 'template' },
  [LABELS.BILLING_RUN_TYPE]: { label: LABELS.BILLING_RUN_TYPE, propName: 'parameters', secondPropName: 'processType',  width: '150PX' },
  [LABELS.DATE_SAVED]: { label: LABELS.DATE_SAVED, propName: 'lastModifiedDatetime', width: '100px', align: 'center', type: 'date' },
  [LABELS.SAVED_BY]: { label: LABELS.SAVED_BY, propName: 'lastModifiedBy', width: '140px', align: 'center' },
  [LABELS.STATUS]: { label: LABELS.STATUS, propName: 'status', width: '100px', align: 'center', type: 'template' },
}

const expandedTableCols: Record<string, TPL_TABLE_COLUMN> = {
  [LABELS.NAME]: { label: LABELS.NAME, propName: 'description', width: '180px' },
  [LABELS.RUN_START]: { label: LABELS.RUN_START, propName: 'runStart', type: 'date', width: '140px', align: 'center' },
  [LABELS.RUN_END]: { label: LABELS.RUN_END, propName: 'runEnd', type: 'date', width: '140px', align: 'center' },
  [LABELS.FILE]: { label: LABELS.FILE, propName: 'fileName', width: '250px', type: 'template' },
  [LABELS.DURATION]: { label: LABELS.DURATION, propName: 'duration', type: 'string', width: '60px' },
  [LABELS.RUN_BY]: { label: LABELS.RUN_BY, propName: 'runBy', type: 'string', width: '100px' },
  [LABELS.STATUS]: { label: LABELS.STATUS, propName: 'status', type: 'template', width: '100px', align: 'center' }
}
