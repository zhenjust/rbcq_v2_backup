import { TPL_TABLE_COLUMN } from '@shared/interfaces';
import { Component, input } from '@angular/core';
import { PipelineTableColumns } from '@shared/constants/pipelines.const';

@Component({
  selector: 'app-pipeline-table',
  standalone: false,
  templateUrl: './pipeline-table.component.html'
})
export class PipelineTableComponent {

  columns: TPL_TABLE_COLUMN[];

  rowData = input.required();

  constructor() {
    this.columns = Object.values(PipelineTableColumns);
  }

}
