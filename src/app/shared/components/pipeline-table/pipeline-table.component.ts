import { pipeline, PipelineRun, TPL_TABLE_COLUMN } from '@shared/interfaces';
import { AfterViewInit, Component, input, TemplateRef, ViewChild } from '@angular/core';
import { PipelineTableColumns } from '@shared/constants/pipelines.const';
import { LABELS } from '@shared/constants/labels.const';

@Component({
  selector: 'app-pipeline-table',
  standalone: false,
  templateUrl: './pipeline-table.component.html'
})
export class PipelineTableComponent implements AfterViewInit {

  @ViewChild('tagTpl', { static: true }) tagTpl!: TemplateRef<HTMLElement>;

  columns: TPL_TABLE_COLUMN[];

  rowData = input.required<pipeline[]>();
  tableData: PipelineRun[];

  constructor() {
  }

  ngAfterViewInit(): void {
    PipelineTableColumns[LABELS.STATUS].template = this.tagTpl;
    this.columns = Object.values(PipelineTableColumns);

    this.tableData = this.rowData()
      .filter(row => row.pipelineRuns?.length)
      .map(row => row?.pipelineRuns[0]);
  }

}
