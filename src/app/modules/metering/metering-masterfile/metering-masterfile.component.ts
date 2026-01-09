import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { PaginatedTableComponent } from '@shared/components/paginated-table/paginated-table.component';
import { LABELS } from '@shared/constants/labels.const';
import { TableDataResult, TPL_TABLE_COLUMN } from '@shared/interfaces';
import { MeterprocessService } from '@shared/services/api';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Observable, of } from 'rxjs';
import { GenerateMmfComponent } from './generate-mmf/generate-mmf.component';

@Component({
  selector: 'app-metering-masterfile',
  standalone: false,
  templateUrl: './metering-masterfile.component.html',
  styleUrl: './metering-masterfile.component.scss'
})
export class MeteringMasterfileComponent implements OnInit {

  @ViewChild('paginatedTable', { static: false }) paginatedTable: PaginatedTableComponent;

  tableColumns: TPL_TABLE_COLUMN[];
  LABELS = LABELS;


  readonly meterService = inject(MeterprocessService);
  readonly modalService = inject(NzModalService);


  ngOnInit(): void {
    this.formatTableColumns()
  }

  formatTableColumns(): void {
    this.tableColumns = Object.values(tableColumns);
  }

  generate(): void {
    const modal = this.modalService.create({
      nzTitle: LABELS.GENERATE,
      nzCentered: true,
      nzContent: GenerateMmfComponent,
    });

    modal.afterClose.subscribe(() => {
      // trigger search
    });
  }

  listUrl(): Observable<TableDataResult<any[]> | null> {
    if (!this.paginatedTable) {
      return of();
    }

    return this.meterService.searchByName({ name: 'runMMFReport' }, this.paginatedTable?.tableParams);
  }

}

const tableColumns: Record<string, TPL_TABLE_COLUMN> = {
  [LABELS.BILLING_PERIOD]: { label: LABELS.BILLING_PERIOD, propName: 'billingPeriod', width: '150px' },
  [LABELS.BILLING_RUN_TYPE]: { label: LABELS.BILLING_RUN_TYPE, propName: 'msp', width: '150PX' },
  [LABELS.FILE]: { label: LABELS.FILE, propName: 'fileName', width: '150px', type: 'template' },
  [LABELS.DATE_SAVED]: { label: LABELS.DATE_SAVED, propName: 'category', width: '100px', align: 'center', type: 'date' },
  [LABELS.SAVED_BY]: { label: LABELS.SAVED_BY, propName: 'billingDate', width: '140px', align: 'center' },
}

