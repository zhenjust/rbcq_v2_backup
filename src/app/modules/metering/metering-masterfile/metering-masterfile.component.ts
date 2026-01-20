import { Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { PaginatedTableComponent } from '@shared/components/paginated-table/paginated-table.component';
import { LABELS } from '@shared/constants/labels.const';
import { DownloadMmfParams, meterProcessBillingPeriod, meterProcessOptions, TableAction, TableDataResult, TPL_TABLE_COLUMN } from '@shared/interfaces';
import { MeterprocessService } from '@shared/services/api';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Observable, of } from 'rxjs';
import { GenerateMmfComponent } from './generate-mmf/generate-mmf.component';
import { FormBuilder, FormGroup } from '@angular/forms';
import { METER_PROCESS_TYPE_OPTION } from '@shared/constants';
import { MeterProcessTypes } from '@shared/enums';
import { DownloadUtilService } from '@shared/services/utils';

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

  formBuilder = inject(FormBuilder);

  form: FormGroup;
  showForm = false;
  processTypeOpts: meterProcessOptions[];
  billingPeriodOpts: { label: string; value: number; }[];

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
      processType: [null],
      file: [null],
      lastModifiedBy: [null],
      lastModifiedDateTime: [null],
    })
  }

  getBillingPeriods(): void {
    this.meterService.getBillingPeriod()
      .subscribe({
        next: options => {
          this.billingPeriodOpts = (options as meterProcessBillingPeriod[])
            .map(bp => ({ label: bp.supplyMonth, value: bp.id }));
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
        this.paginatedTable.search();
      }
    });
  }

  listUrl(): Observable<TableDataResult<any[]> | null> {
    if (!this.paginatedTable) {
      return of();
    }

    return this.meterService.searchByName({ name: 'runMMFReport', ...this.form.getRawValue() }, this.paginatedTable?.tableParams);
  }

  download(data: any): void {
    const { workspaceId } = data.pipelineRuns[0];
    const { endDate, processType } = data.parameters;
    const params: DownloadMmfParams = { workspaceId, endDate, processType };

    this.meterService.downloadMmf(params)
      .subscribe(res => {
        this.downloadService.handleDownloadedFile(res);
      });
  }

  delete(_data: any): void {
    console.debug(_data);
  }

  get actionControls(): TableAction<any>[] {
    return [
      { label: LABELS.DOWNLOAD, value: 'download', click: (rowData: any) => this.download(rowData)},
      { label: LABELS.DELETE, value: 'generate', click: (rowData: any) => this.delete(rowData), danger: true},
    ];
  }

}

const tableColumns: Record<string, TPL_TABLE_COLUMN> = {
  [LABELS.BILLING_PERIOD]: { label: LABELS.BILLING_PERIOD, propName: 'parameters', width: '150px', type: 'template' },
  [LABELS.BILLING_RUN_TYPE]: { label: LABELS.BILLING_RUN_TYPE, propName: 'parameters', secondPropName: 'processType',  width: '150PX' },
  [LABELS.FILE]: { label: LABELS.FILE, propName: 'fileName', width: '250px', type: 'template' },
  [LABELS.DATE_SAVED]: { label: LABELS.DATE_SAVED, propName: 'lastModifiedDatetime', width: '100px', align: 'center', type: 'date' },
  [LABELS.SAVED_BY]: { label: LABELS.SAVED_BY, propName: 'lastModifiedBy', width: '140px', align: 'center' },
  [LABELS.STATUS]: { label: LABELS.STATUS, propName: 'status', width: '100px', align: 'center', type: 'template' },
}

