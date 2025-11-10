import { Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { PaginatedTableComponent } from '@shared/components/paginated-table/paginated-table.component';
import { LABELS } from '@shared/constants/labels.const';
import { TPL_TABLE_COLUMN } from '@shared/interfaces';
import { MqUploaderService } from '@shared/services/api';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Observable } from 'rxjs';
import { MqUploaderFilterComponent } from './import/mq-uploader-filter.component';

@Component({
  selector: 'app-mq-uploader',
  standalone: false,
  templateUrl: './mq-uploader.component.html',
  styleUrl: './mq-uploader.component.scss'
})
export class MqUploaderComponent implements OnInit {

  @ViewChild('ongoingTable', { static: true }) tableComp: PaginatedTableComponent;
  @ViewChild('sizeTpl', { static: true }) sizeTpl: TemplateRef<HTMLElement>;
  @ViewChild('statusTpl', { static: true }) statusTpl: TemplateRef<HTMLElement>;
  @ViewChild('transacIdTpl', { static: true }) transacIdTpl: TemplateRef<HTMLElement>;

  private readonly mqs = inject(MqUploaderService);
  private readonly modal = inject(NzModalService);

  LABELS = LABELS;
  tableColumns: TPL_TABLE_COLUMN[];
  filters: any = {};

  ngOnInit(): void {
    tableColumns[LABELS.SIZE].template = this.sizeTpl;
    tableColumns[LABELS.STATUS].template = this.statusTpl;
    tableColumns[LABELS.TRANSACTION_ID].template = this.transacIdTpl;

    this.tableColumns = Object.values(tableColumns);
    this.tableComp?.search();
  }

  listUrl(): Observable<any> {
    return this.mqs.getList(this.filters, this.tableComp?.tableParams)
  }

  import(): void {
    this.modal.create({
      nzCentered: true,
      nzTitle: LABELS.START_IMPORT,
      nzContent: MqUploaderFilterComponent,
      nzFooter: null
    });
  }

}

const tableColumns: Record<string, TPL_TABLE_COLUMN> = {
  [LABELS.TRANSACTION_ID]: { label: LABELS.TRANSACTION_ID, propName: 'transactionId', width: '180px', type: 'template' },
  [LABELS.MSP]: { label: LABELS.MSP, propName: 'msp', width: '180px' },
  [LABELS.FILE_NAME]: { label: LABELS.FILE_NAME, propName: 'fileName', width: '180px' },
  [LABELS.CATEGORY]: { label: LABELS.CATEGORY, propName: 'category', width: '150px' },
  [LABELS.BILLING_DATE]: { label: LABELS.BILLING_DATE, propName: 'description', width: '240px' }, // ask christian
  [LABELS.SIZE]: { label: LABELS.SIZE, propName: 'fileSize', width: '240px', type: 'template' },
  [LABELS.STATUS]: { label: LABELS.STATUS, propName: 'description', width: '240px', type: 'template' },
}
