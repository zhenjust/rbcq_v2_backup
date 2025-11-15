import { Component, Input, ViewChild } from '@angular/core';
import { TPL_TABLE_COLUMN } from '@shared/interfaces';
import { SearchListBase } from '@shared/services/utils/list.util.service';
import { NzTableComponent } from 'ng-zorro-antd/table';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-paginated-table',
  standalone: false,
  templateUrl: './paginated-table.component.html',
})
export class PaginatedTableComponent extends SearchListBase {

  @ViewChild('table', { static: true }) table!: NzTableComponent<any>;

  @Input({ required: true }) tableColumns!: TPL_TABLE_COLUMN[];

  // Checkbox configurations
  @Input() enableCheckbox = false;
  @Input() checkboxProperty = 'id';
  @Input() disableSelectAll = false;
  @Input() checkboxCondition!: (rowData: any) => boolean;
  @Input() url: Observable<any>;

  selectedItems = new Set<number>();

  constructor() {
    super();
  }

  override busy$: Subscription;
  override resultsProp: string;

  override getListUrl(): Observable<any> {
    return this.url;
  }

  // Handling of Checkboxes

  checkAll(value: boolean): void {
    if (value) {
      this.tableData?.forEach(data => {
        this.selectedItems.add(data[this.checkboxProperty]);
      });
    } else {
      this.selectedItems.clear();
    }
  }

  checkRow(checked: boolean, value: any): void {
    if (checked) {
      this.selectedItems.add(value);
    } else {
      this.selectedItems.delete(value);
    }
  }

  // End of Checkbox Handling

  get isIndeterminate(): boolean { return (this.selectedItems?.size !== this.tableData?.length) && !!this.selectedItems.size; }
  get isAllChecked(): boolean { return !!this.tableData?.length && (this.selectedItems?.size === this.tableData?.length); }
  get widthTotal(): number { return this.widthConfig.reduce((a, b) => a + parseInt(b), 0); }
  get widthConfig(): string[] {
    return [
      ...(this.enableCheckbox ? ['30px'] : []),
      ...this.tableColumns.map(col => col?.width ? col?.width : '150px')
    ];
  }


}
