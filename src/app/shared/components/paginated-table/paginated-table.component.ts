import { Component, input, Input, TemplateRef, ViewChild } from '@angular/core';
import { LABELS } from '@shared/constants/labels.const';
import { TableAction, TPL_TABLE_COLUMN } from '@shared/interfaces';
import { SearchListBase } from '@shared/services/utils/list.util.service';
import { NzTableComponent } from 'ng-zorro-antd/table';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-paginated-table',
  standalone: false,
  templateUrl: './paginated-table.component.html',
})
export class PaginatedTableComponent<T> extends SearchListBase {

  @ViewChild('table', { static: true }) table!: NzTableComponent<any>;

  @Input({ required: true }) tableColumns!: TPL_TABLE_COLUMN[];

  // Checkbox configurations
  @Input() enableCheckbox = false;
  @Input() checkboxProperty = 'id';
  @Input() disableSelectAll = false;
  @Input() checkboxCondition!: (rowData: any) => boolean;
  @Input() progressBarCondition!: (rowData: any) => boolean;
  @Input() url: Observable<any>;
  @Input() showCustomLoading: boolean;


  enableExpand = input<boolean>();
  expandTpl = input<TemplateRef<any>>();
  expandSet = new Set<number>();

  @Input() tableConfig: {
    height?: string;
    width?: string;
  } = {
    height: '400px'
  }

  showActions = input<boolean>(false);

  actionControls = input<TableAction<T>[] | ((rowData: T) => TableAction<T>[])>([]);

  selectedItems = new Set<number>();
  LABELS = LABELS;

  constructor() {
    super();
  }

  override busy$: Subscription;
  @Input() override resultsProp: string;

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

  /**
   * Handling of Expand
   */

  onExpandChange(id: number, status = false): void {
    if (status) {
      this.expandSet.clear();
      this.expandSet.add(id);
    } else {
      this.expandSet.delete(id);
    }
  }


  get isIndeterminate(): boolean { return (this.selectedItems?.size !== this.tableData?.length) && !!this.selectedItems.size; }
  get isAllChecked(): boolean { return !!this.tableData?.length && (this.selectedItems?.size === this.tableData?.length); }
  get widthTotal(): number { return this.widthConfig.reduce((a, b) => a + parseInt(b), 0); }
  get widthConfig(): string[] {
    return [
      ...(this.enableExpand() ? ['20px'] : []),
      ...(this.enableCheckbox ? ['30px'] : []),
      ...(this.tableColumns ? this.tableColumns.map(col => col?.width ? col?.width : '150px') : []),
      ...(this.showActions() ? ['100px'] : [])
    ];
  }


  getActions(row: T): TableAction<T>[] {
    const actionsOrFn = this.actionControls();
    let actions: TableAction<T>[];
    if (typeof actionsOrFn === 'function') {
      actions = actionsOrFn(row);
    } else {
      actions = actionsOrFn || [];
    }

    return actions.filter(action => !action.hidden || !action.hidden());
  }


}
