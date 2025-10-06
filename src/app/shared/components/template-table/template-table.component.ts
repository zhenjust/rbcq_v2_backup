import { Component, Input } from '@angular/core';
import { TPL_TABLE_COLUMN } from '@shared/interfaces';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-template-table',
  standalone: false,
  templateUrl: './template-table.component.html',
})
export class TemplateTableComponent {

  @Input({ required: true }) tableColumns!: TPL_TABLE_COLUMN[];
  @Input({ required: true }) tableData!: any[];

  @Input() loading$!: Subscription;
  @Input() enableCheckbox = false;
  @Input() checkboxProperty = 'id';

  selectedItems = new Set<number>();

  // Handling of Checkboxes

  checkAll(value: boolean): void {
    if (value) {
      this.tableData.forEach(data => {
        this.selectedItems.add(data[this.checkboxProperty]);
        console.log({value}, this.selectedItems.values(), data[this.checkboxProperty])
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
  get isLoading(): boolean { return (this.loading$ && !this.loading$?.closed) || false; }

  get widthTotal(): number { return this.widthConfig.reduce((a, b) => a + parseInt(b), 0); }

  get widthConfig(): string[] {
    return [
      ...(this.enableCheckbox ? ['30px'] : []),
      ...this.tableColumns.map(col => col?.width ? col?.width : '150px')
    ];
  }

}
