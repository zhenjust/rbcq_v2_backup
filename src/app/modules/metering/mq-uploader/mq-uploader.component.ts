import { Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { PaginatedTableComponent } from '@shared/components/paginated-table/paginated-table.component';
import { LABELS } from '@shared/constants/labels.const';
import { MqList, MqUploadFilters, OngoingTableList, TableDataResult, TableParams, TPL_TABLE_COLUMN } from '@shared/interfaces';
import { AdminService, MqUploaderService } from '@shared/services/api';
import { NzModalService } from 'ng-zorro-antd/modal';
import { catchError, concatMap, from, Observable, of, tap } from 'rxjs';
import { MqUploaderFilterComponent } from './import/mq-uploader-filter.component';
import { ToastrService } from 'ngx-toastr';
import { MESSAGES } from '@shared/constants/messages.const';
import { MqHistoryFiltersComponent } from './filters/mq-history-filters.component';
import { MQ_UPLOAD_CATEGORY, Status } from '@shared/constants';
import { format, setHours, setMinutes } from 'date-fns';

@Component({
  selector: 'app-mq-uploader',
  standalone: false,
  templateUrl: './mq-uploader.component.html',
  styleUrl: './mq-uploader.component.scss'
})
export class MqUploaderComponent implements OnInit {

  @ViewChild('paginatedTable', { static: false }) paginatedTable: PaginatedTableComponent<MqList>;
  @ViewChild('filtersComp', { static: false }) filtersComp: MqHistoryFiltersComponent;
  @ViewChild('sizeTpl', { static: true }) sizeTpl: TemplateRef<HTMLElement>;
  @ViewChild('statusTpl', { static: true }) statusTpl: TemplateRef<HTMLElement>;
  @ViewChild('transacIdTpl', { static: true }) transacIdTpl: TemplateRef<HTMLElement>;
  @ViewChild('billingDateTpl', { static: true }) billingDateTpl: TemplateRef<HTMLElement>;

  private readonly mqs = inject(MqUploaderService);
  private readonly modal = inject(NzModalService);
  private readonly ts = inject(ToastrService);
  private readonly admin = inject(AdminService);

  LABELS = LABELS;
  MESSAGES = MESSAGES;
  tableColumns: TPL_TABLE_COLUMN[];
  filters: Partial<MqUploadFilters> | null = {};
  ongoingTableData: OngoingTableList[] = [];
  ongoingTableColumns: TPL_TABLE_COLUMN[];
  tabIndex = 0;
  Status = Status;
  MQ_UPLOAD_CATEGORY = MQ_UPLOAD_CATEGORY;

  showFilters = false;
  isAllowedImport = true;
  timeLimit: string;
  regCategory: string;

  ngOnInit(): void {
    this.getNavbarInfo();
    this.getValidTime();
  }

  getNavbarInfo(): void {
    this.admin.getNavbarInfo()
      .subscribe(res => {
        if (res) {
          this.regCategory = res?.registrationCategory;
        }

        this.formatTableColumns();
      });
  }

  getValidTime(): void {
    this.admin.getConfigurations('MQ_GATE_CLOSURE_TIME')
      .subscribe(value => {
        const timeSplit = value?.split(':');
        if (timeSplit?.length) {
          const newHour = setHours(new Date(), +timeSplit[0]);
          const newMins = setMinutes(newHour, +timeSplit[1]);
          this.timeLimit = format(newMins, 'p');
          this.isAllowedImport = (new Date()) < newMins;
        }
      });
  }

  formatTableColumns(): void {
    tableColumns[LABELS.SIZE].template = this.sizeTpl;
    tableColumns[LABELS.STATUS].template = this.statusTpl;
    tableColumns[LABELS.TRANSACTION_ID].template = this.transacIdTpl;
    tableColumns[LABELS.BILLING_DATE].template = this.billingDateTpl;

    ongoingTableColumns[LABELS.SIZE].template = this.sizeTpl;
    ongoingTableColumns[LABELS.STATUS].template = this.statusTpl;
    ongoingTableColumns[LABELS.TRANSACTION_ID].template = this.transacIdTpl;
    ongoingTableColumns[LABELS.BILLING_DATE].template = this.billingDateTpl;

    if (this.isMspUser) {
      delete tableColumns[LABELS.MSP];
      delete ongoingTableColumns[LABELS.MSP];
    }

    console.log({tableColumns})

    this.tableColumns = Object.values(tableColumns);
    this.ongoingTableColumns = Object.values(ongoingTableColumns);
  }

  listUrl(): Observable<TableDataResult<MqList[]> | null> {
    if (!this.filters?.tradingDate) {
      return of(null);
    }

    return this.mqs.getList(this.filters, this.paginatedTable?.tableParams || new TableParams())
  }

  import(): void {
    const modal = this.modal.create({
      nzCentered: true,
      nzTitle: LABELS.START_IMPORT,
      nzContent: MqUploaderFilterComponent,
      nzFooter: null,
    });

    modal.afterClose.subscribe(({ formDataGrp, payload, headerId }) => {
      if (payload) {
        this.ongoingTableData = formDataGrp.map((td: FormData) => {
          return {
            ...payload,
            file: td.get('file'),
            status: LABELS.QUEUED_FOR_PROCESSING
          };
        });

        this.handleUpload(formDataGrp, headerId);
      }
    });
  }

  handleUpload(formDataGrp: FormData[], headerId: number): void {
    const hasError: OngoingTableList[] = [];
    const dataLength = formDataGrp.length;

    from(formDataGrp)
      .pipe(concatMap((fd) => {
        const formattedData = fd as FormData;
        const file = formattedData.get('file') as File;
        const index = this.ongoingTableData.findIndex(td => td.file.name === file.name);
        this.ongoingTableData[index].status = Status.IN_PROGRESS;
        this.ongoingTableData[index].percentage = 0;

        return this.mqs.uploadMq(formattedData)
          .pipe(
            tap(({ body, type, loaded, total }) => {
              const percentage = (type === 1 && (loaded / total) * 100);
              this.ongoingTableData[index].percentage = percentage && Math.trunc(percentage) || (body && 100) || 0;

              if (body) {
                this.ongoingTableData[index].transactionId = body.transactionID;
                this.ongoingTableData[index].status = Status.ACCEPTED;
              }
            }),
            catchError(err => {
              const errors = err?.error?.error;
              const compiledErrs = (errors?.length && errors instanceof Array) ? errors?.map((e: any) => e.defaultMessage).join('. ') : err.error;
              const message = compiledErrs.error ? compiledErrs.error : compiledErrs;

              this.ongoingTableData[index].status = Status.REJECTED;
              this.ongoingTableData[index].errorMessage = message;
              this.ongoingTableData[index].transactionId = err.error.transactionID;
              hasError.push(this.ongoingTableData[index]);
              return of(err);
            })
          )
      }))
      .subscribe({
        complete: () => this.handleUploadComplete(hasError, dataLength, headerId)
      });
  }

  handleUploadComplete(hasError: OngoingTableList[], dataLength: number, headerId: number): void {
    if (hasError.length && (dataLength === hasError?.length)) {
      this.ts.error(dataLength > 1 ? MESSAGES.ALL_FILES_ERROR : MESSAGES.SINGLE_FILE_ERROR);
    } else if (hasError.length && (dataLength !== hasError.length)) {
      this.ts.warning(MESSAGES.SOME_FILES_ERROR);
    } else {
      this.ts.success(MESSAGES.SUCCESS_IMPORT_ITEM('file/s'));
    }

    this.mqs.sendMqNotification(headerId).subscribe(() => {});
  }

  triggerSearch(filters: MqUploadFilters): void {
    this.filters = filters ?? {};
    this.paginatedTable?.search();
  }

  resetFilters(): void {
    this.filtersComp.clearFilters();
    this.filters = null;
    this.showFilters = false;
    this.paginatedTable?.search();
  }

  onTabChange(index: number): void {
    if (index) {
      this.paginatedTable.tableData = [];
      setTimeout(() => window.dispatchEvent(new Event('resize')), 10);
    }
  }

  get disableImport(): boolean { return !this.ongoingTableData.length || this.ongoingTableData.every(td => [Status.ACCEPTED, Status.REJECTED].includes(td.status as Status)); }
  get hasInProgress(): boolean { return this.ongoingTableData.some(td => td.status === Status.IN_PROGRESS); }
  get ongoingInProgress(): OngoingTableList[] { return this.ongoingTableData.filter(td => td.status !== LABELS.QUEUED_FOR_PROCESSING); }
  get isMspUser(): boolean { return this.regCategory === 'MSP'; }

}

const tableColumns: Record<string, TPL_TABLE_COLUMN> = {
  [LABELS.TRANSACTION_ID]: { label: LABELS.TRANSACTION_ID, propName: 'transactionId', width: '330px', type: 'template' },
  [LABELS.MSP]: { label: LABELS.MSP, propName: 'msp', width: '150PX' },
  [LABELS.FILE_NAME]: { label: LABELS.FILE_NAME, propName: 'fileName', width: '250px' },
  [LABELS.CATEGORY]: { label: LABELS.CATEGORY, propName: 'category', width: '100px', align: 'center' },
  [LABELS.BILLING_DATE]: { label: LABELS.BILLING_DATE, propName: 'billingDate', width: '140px', align: 'center' },
  [LABELS.SIZE]: { label: LABELS.SIZE, propName: 'fileSize', width: '100px', type: 'template' },
  [LABELS.STATUS]: { label: LABELS.STATUS, propName: 'status', width: '160px', type: 'template', align: 'center' },
}

const ongoingTableColumns: Record<string, TPL_TABLE_COLUMN> = {
  [LABELS.TRANSACTION_ID]: { label: LABELS.TRANSACTION_ID, propName: 'transactionId', width: '250px', type: 'template' },
  [LABELS.MSP]: { label: LABELS.MSP, propName: 'mspShortName', width: '150px' },
  [LABELS.FILE_NAME]: { label: LABELS.FILE_NAME, propName: 'file', secondPropName: 'name', width: '300px' },
  [LABELS.CATEGORY]: { label: LABELS.CATEGORY, propName: 'category', width: '100px', align: 'center' },
  [LABELS.BILLING_DATE]: { label: LABELS.BILLING_DATE, propName: 'billingDate', width: '140px', align: 'center', type: 'template' },
  [LABELS.SIZE]: { label: LABELS.SIZE, propName: 'file', secondPropName: 'size', width: '100px', type: 'template' },
  [LABELS.STATUS]: { label: LABELS.STATUS, propName: 'status', width: '160px', type: 'template', align: 'center' },
}

