import { Component, input, Input, TemplateRef, ViewChild } from '@angular/core';
import { LABELS } from '@shared/constants/labels.const';
import { TPL_TABLE_COLUMN } from '@shared/interfaces';
import { NzTableComponent } from 'ng-zorro-antd/table';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-template-table',
  standalone: false,
  templateUrl: './template-table.component.html',
})
export class TemplateTableComponent {

  @ViewChild('table') table!: NzTableComponent<any>;

  @Input({ required: true }) tableColumns!: TPL_TABLE_COLUMN[];
  @Input({ required: true }) tableData!: any[];

  actionsTpl = input<TemplateRef<any>>();

  @Input() loading$!: Subscription;

  // Checkbox configurations
  @Input() enableCheckbox = false;
  @Input() checkboxProperty = 'id';
  @Input() disableSelectAll = false;
  @Input() checkboxCondition!: (rowData: any) => boolean;

  enableExpand = input<boolean>();
  expandProp = input<string>('id');
  expandTpl = input<TemplateRef<any>>();
  expandSet = new Set<number>();

  useDarkBg = input<boolean>(false);


  LABELS = LABELS;
  selectedItems = new Set<number>();

  // Handling of Checkboxes

  checkAll(value: boolean): void {
    if (value) {
      this.tableData.forEach(data => {
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
  get isLoading(): boolean { return (this.loading$ && !this.loading$?.closed) || false; }

  get widthTotal(): number { return this.widthConfig.reduce((a, b) => a + parseInt(b), 0); }

  get widthConfig(): string[] {
    return [
      ...(this.enableExpand() ? ['20px'] : []),
      ...(this.enableCheckbox ? ['30px'] : []),
      ...(this.tableColumns?.length ? this.tableColumns.map(col => col?.width ? col?.width : '150px') : []),
      ...(this.actionsTpl() ? ['100px'] : [])
    ];
  }


}
