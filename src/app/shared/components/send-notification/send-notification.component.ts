import { Component, inject, input, signal } from '@angular/core';

import 'froala-editor/js/plugins/link.min.js';
import 'froala-editor/js/plugins/image.min.js';
import 'froala-editor/js/plugins/colors.min.js';
import { LABELS } from '@shared/constants/labels.const';
import { TPL_TABLE_COLUMN } from '@shared/interfaces';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-send-notification',
  standalone: false,
  templateUrl: './send-notification.component.html',
  styleUrl: './send-notification.component.scss'
})
export class SendNotificationComponent{

  private readonly modalData = inject(NZ_MODAL_DATA);

  defaultValue = input<string>();
  tableData = signal<{ dueDate: string, status: string}[]>([]);

  columns: TPL_TABLE_COLUMN[] = [];
  froalaOptions = froalaOptions;
  LABELS = LABELS;

  constructor() {
    this.columns = Object.values(expandedTableCols);
    this.tableData.set(this.modalData?.dueDateTable as { dueDate: string, status: string }[]);
  }
}

const expandedTableCols: Record<string, TPL_TABLE_COLUMN> = {
  [LABELS.DUE_DATE]: { label: LABELS.DUE_DATE, propName: 'dueDate', type: 'date' },
  [LABELS.STATUS]: { label: LABELS.STATUS, propName: 'status' },
}

const froalaOptions = {
  toolbarButtons: [ 'bold', 'italic', 'underline', 'strikeThrough', '|', 'insertLink', 'insertImage', 'textColor', 'backgroundColor', '|', 'undo', 'redo' ],
  pluginsEnabled: ['link', 'image', 'colors'],
  colorsHEXTemplate: true,
  colorsBackground: true,
};
