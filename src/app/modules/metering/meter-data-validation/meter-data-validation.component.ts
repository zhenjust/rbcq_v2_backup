import { Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PaginatedTableComponent } from '@shared/components/paginated-table/paginated-table.component';
import { METER_PROCESS_TYPE_OPTION } from '@shared/constants';
import { LABELS } from '@shared/constants/labels.const';
import { MESSAGES } from '@shared/constants/messages.const';
import { MeterProcessTypes } from '@shared/enums';
import { TPL_TABLE_COLUMN, meterProcessOptions, meterProcessBillingPeriod, TableDataResult, DownloadMmfParams, TableAction } from '@shared/interfaces';
import { MeterprocessService } from '@shared/services/api';
import { DownloadUtilService } from '@shared/services/utils';
import { format } from 'date-fns';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ToastrService } from 'ngx-toastr';
import { Observable, of } from 'rxjs';
import { GenerateMmfComponent } from '../metering-masterfile/generate-mmf/generate-mmf.component';

@Component({
  selector: 'app-meter-data-validation',
  standalone: false,
  templateUrl: './meter-data-validation.component.html',
})
export class MeterDataValidationComponent implements OnInit {

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

  formBuilder = inject(FormBuilder);

  form: FormGroup;
  showForm = false;
  processTypeOpts: meterProcessOptions[];
  billingPeriodOpts: { label: string; value: { startDate: string, endDate: string }; }[];

  ngOnInit(): void {
    this.formatTableColumns();
    this.buildForm();
    this.getBillingPeriods();

    this.processTypeOpts = METER_PROCESS_TYPE_OPTION
      .filter(opt => opt.id !== MeterProcessTypes.DAILY);
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
    this.paginatedTable.search();
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
        this.paginatedTable.search();
      }
    });
  }

  listUrl(): Observable<TableDataResult<any[]> | null> {
    if (!this.paginatedTable) {
      return of();
    }

    const formValues = this.form.getRawValue();
    const filters = {
      ...formValues,
      ...formValues.billingPeriod,
      name: 'runMMFReport'
    };

    delete filters?.billingPeriod;

    return this.meterService.searchByNameParams(filters, this.paginatedTable?.tableParams);
  }

  download(data: any): void {
    const { workspaceId } = data.pipelineRuns[0];
    const { endDate, processType } = data.parameters;
    const params: DownloadMmfParams = { workspaceId, endDate, processType };

    this.paginatedTable.busy$ = this.meterService.downloadMmf(params)
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
        this.paginatedTable.busy$ = this.meterService.deleteMmf(id)
          .subscribe(() => {
            const message = MESSAGES.SUCCESS_DELETE_ITEM(LABELS.METERING_MASTERFILE);
            this.toastrService.success(message);
            this.paginatedTable.search();
          });
      }
    });
  }


  get actionControls(): TableAction<any>[] {
    return [
      { label: LABELS.DOWNLOAD, value: 'download', click: (rowData: any) => this.download(rowData)},
      { label: LABELS.DELETE, value: 'generate', click: (rowData: any) => this.delete(rowData), danger: true},
    ];
  }

}

const tableColumns: Record<string, TPL_TABLE_COLUMN> = {
  [LABELS.BILLING_PERIOD_TRADING_DATE]: { label: LABELS.BILLING_PERIOD_TRADING_DATE, propName: 'parameters', width: '150px', type: 'template' },
  [LABELS.BILLING_RUN_TYPE]: { label: LABELS.BILLING_RUN_TYPE, propName: 'parameters', secondPropName: 'processType',  width: '150PX' },
  [LABELS.FILE]: { label: LABELS.FILE, propName: 'fileName', width: '250px', type: 'template' },
  [LABELS.DATE_SAVED]: { label: LABELS.DATE_SAVED, propName: 'lastModifiedDatetime', width: '100px', align: 'center', type: 'date' },
  [LABELS.SAVED_BY]: { label: LABELS.SAVED_BY, propName: 'lastModifiedBy', width: '140px', align: 'center' },
  [LABELS.STATUS]: { label: LABELS.STATUS, propName: 'status', width: '100px', align: 'center', type: 'template' },
}

