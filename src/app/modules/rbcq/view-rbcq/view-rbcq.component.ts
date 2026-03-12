import { Component, OnInit, ViewChild, TemplateRef, ViewEncapsulation, inject } from '@angular/core';
import { PaginatedTableComponent } from '@shared/components/paginated-table/paginated-table.component';
import { LABELS } from '@shared/constants/labels.const';
import { TPL_TABLE_COLUMN, TableDataResult, TableParams } from '@shared/interfaces';
import { Observable, of } from 'rxjs';
import { AdminService } from '@shared/services/api';

@Component({
  selector: 'app-view-rbcq',
  standalone: false,
  templateUrl: './view-rbcq.component.html',
  styleUrls: ['./view-rbcq.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ViewRbcqComponent implements OnInit {

  @ViewChild('paginatedTable', { static: false }) paginatedTable: PaginatedTableComponent<any>;
  @ViewChild('transacIdTpl', { static: true }) transacIdTpl: TemplateRef<any>;
  @ViewChild('statusTpl', { static: true }) statusTpl: TemplateRef<any>;
  @ViewChild('dateTpl', { static: true }) dateTpl: TemplateRef<any>;

  LABELS = LABELS;
  tableColumns: TPL_TABLE_COLUMN[] = [];

  private readonly admin = inject(AdminService);

  constructor() { }

  ngOnInit(): void {
    this.getNavbarInfo();
  }

  getNavbarInfo(): void {
    this.admin.getNavbarInfo().subscribe(() => {
      this.formatTableColumns();
    }, () => this.formatTableColumns());
  }

  formatTableColumns(): void {
    // configure templates for columns
    tableColumns[LABELS.TRANSACTION_ID].template = this.transacIdTpl;
    tableColumns[LABELS.STATUS].template = this.statusTpl;
    tableColumns[LABELS.DATE_SAVED].template = this.dateTpl;

    this.tableColumns = Object.values(tableColumns);
  }

  // TODO: wire this to a real service method that returns TableDataResult<RbcqItem[]>
  listUrl(): Observable<TableDataResult<any> | null> {
    return of(null);
  }

}

const tableColumns: Record<string, TPL_TABLE_COLUMN> = {
  [LABELS.TRANSACTION_ID]: { label: LABELS.TRANSACTION_ID, propName: 'transactionId', width: '220px', type: 'template' },
  [LABELS.FILE_NAME]: { label: LABELS.FILE_NAME, propName: 'fileName', width: '300px' },
  [LABELS.STATUS]: { label: LABELS.STATUS, propName: 'status', width: '140px', type: 'template', align: 'center' },
  [LABELS.DATE_SAVED]: { label: LABELS.DATE_SAVED, propName: 'dateSaved', width: '180px', type: 'template' },
  [LABELS.SAVED_BY]: { label: LABELS.SAVED_BY, propName: 'savedBy', width: '180px' }
};
