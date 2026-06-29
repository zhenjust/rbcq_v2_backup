import { Component, DestroyRef, effect, inject, OnInit, signal, TemplateRef, ViewChild } from '@angular/core';
import { HttpEventType } from '@angular/common/http';
import { PaginatedTableComponent } from '@shared/components/paginated-table/paginated-table.component';
import { LABELS } from '@shared/constants/labels.const';
import { DownloadMmfParams, meterProcessBillingPeriod, meterProcessOptions, TableAction, TPL_TABLE_COLUMN } from '@shared/interfaces';
import { MeterprocessService } from '@shared/services/api';
import { NzModalService } from 'ng-zorro-antd/modal';
import { BehaviorSubject, exhaustMap, filter, finalize, merge, Observable, Subject, switchMap, timer } from 'rxjs';
import { GenerateMmfComponent } from './generate-mmf/generate-mmf.component';
import { FormBuilder, FormGroup } from '@angular/forms';
import { METER_PROCESS_TYPE_OPTION } from '@shared/constants';
import { MeterProcessTypes } from '@shared/enums';
import { DownloadUtilService } from '@shared/services/utils';
import { ToastrService } from 'ngx-toastr';
import { MESSAGES } from '@shared/constants/messages.const';
import { format } from 'date-fns';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-metering-masterfile',
  standalone: false,
  templateUrl: './metering-masterfile.component.html',
  styleUrl: './metering-masterfile.component.scss'
})
export class MeteringMasterfileComponent implements OnInit {

  @ViewChild('paginatedTable', { static: false }) paginatedTable: PaginatedTableComponent<any>;
  @ViewChild('bpTpl', { static: true }) bpTpl: TemplateRef<HTMLElement>;
  @ViewChild('fileTpl', { static: true }) fileTpl: TemplateRef<HTMLElement>;
  @ViewChild('tagTpl', { static: true }) tagTpl: TemplateRef<HTMLElement>;

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

    this.processTypeOpts = METER_PROCESS_TYPE_OPTION
      .filter(opt => opt.id !== MeterProcessTypes.DAILY);

    this.url$ = this.getUrl();
  }

  buildForm(): void {
    this.form = this.formBuilder.group({
      billingPeriod: [null],
      processType: [null]
    });
  }

  resetFilters(): void {
    this.showForm =! this.showForm;
    this.form.reset();
    this.reload$?.next();
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
    tableColumns[LABELS.BILLING_PERIOD].template = this.bpTpl;
    tableColumns[LABELS.FILE].template = this.fileTpl;
    tableColumns[LABELS.STATUS].template = this.tagTpl;

    this.tableColumns = Object.values(tableColumns);
  }

  generate(): void {
    const modal = this.modalService.create({
      nzTitle: LABELS.GENERATE,
      nzCentered: true,
      nzContent: GenerateMmfComponent,
    });

    modal.afterClose.subscribe(val => {
      if (val) {
        this.reload$?.next();
      }
    });
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
        const filters = {
          ...formValues,
          ...formValues.billingPeriod,
          name: 'runMMFReport'
        };

        delete filters?.billingPeriod;

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

  download(data: any): void {
    const { workspaceId } = data.pipelineRuns[0];
    const { endDate, processType } = data.parameters;
    const params: DownloadMmfParams = { workspaceId, endDate, processType };

    this.paginatedTable.busy$ = this.meterService.downloadMeteringReport(params, 'mmf')
      .pipe(filter(res => res.type === HttpEventType.Response))
      .subscribe(res => {
        this.downloadService.handleDownloadedFile(res);
      });
  }

  delete(data: any): void {
    this.modalService.confirm({
      nzTitle: `${LABELS.DELETE} ${LABELS.METERING_MASTERFILE}`,
      nzCentered: true,
      nzContent: MESSAGES.CONFIRM_DELETE_ITEM(LABELS.METERING_MASTERFILE),
      nzOnOk: () => {
        const id = data.pipelineRuns[0].workspaceId;
        const processType = data.parameters?.processType;

        this.paginatedTable.busy$ = this.meterService.deleteMeteringReport(id, 'mmf-delete', processType)
          .pipe(takeUntilDestroyed(this.destroyRef$))
          .subscribe(() => {
            const message = MESSAGES.SUCCESS_DELETE_ITEM(LABELS.METERING_MASTERFILE);
            this.toastrService.success(message);
            this.reload$?.next();
          });
      }
    });
  }


  actionControls = (rowData: any): TableAction<any>[] => [
    { label: LABELS.DOWNLOAD, value: 'download', click: () => this.download(rowData)},
    { label: LABELS.DELETE, value: 'generate', click: () => this.delete(rowData), danger: true},
  ];

}

const tableColumns: Record<string, TPL_TABLE_COLUMN> = {
  [LABELS.BILLING_PERIOD]: { label: LABELS.BILLING_PERIOD, propName: 'parameters', width: '150px', type: 'template' },
  [LABELS.BILLING_RUN_TYPE]: { label: LABELS.BILLING_RUN_TYPE, propName: 'parameters', secondPropName: 'processType',  width: '150PX' },
  [LABELS.FILE]: { label: LABELS.FILE, propName: 'fileName', width: '250px', type: 'template' },
  [LABELS.DATE_SAVED]: { label: LABELS.DATE_SAVED, propName: 'lastModifiedDatetime', width: '100px', align: 'center', type: 'date' },
  [LABELS.SAVED_BY]: { label: LABELS.SAVED_BY, propName: 'lastModifiedBy', width: '140px', align: 'center' },
  [LABELS.STATUS]: { label: LABELS.STATUS, propName: 'status', width: '100px', align: 'center', type: 'template' },
}

