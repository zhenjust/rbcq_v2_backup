import { pipeline, TPL_TABLE_COLUMN } from '@shared/interfaces';
import { AfterViewInit, ChangeDetectorRef, Component, input, TemplateRef, ViewChild, inject, computed } from '@angular/core';
import { PipelineTableColumns } from '@shared/constants/pipelines.const';
import { LABELS } from '@shared/constants/labels.const';
import { MeterProcessTypes } from '@shared/enums';

@Component({
  selector: 'app-pipeline-table',
  standalone: false,
  templateUrl: './pipeline-table.component.html'
})
export class PipelineTableComponent implements AfterViewInit {

  @ViewChild('statusTpl', { static: true }) statusTpl!: TemplateRef<HTMLElement>;
  @ViewChild('nameTpl', { static: true }) nameTpl!: TemplateRef<HTMLElement>;

  private readonly cdRef = inject(ChangeDetectorRef);

  columns: TPL_TABLE_COLUMN[];

  rowData = input.required<pipeline[]>();
  useCustomTableData = input<any[] | null>();
  LABELS = LABELS;
  processTypes = MeterProcessTypes;

  tableData = computed(() => {
    return (this.rowData() || [])
      .filter(row => row.pipelineRuns?.length)
      .map(row => row?.pipelineRuns[0]);
  });

  constructor() {
  }

  ngAfterViewInit(): void {
    PipelineTableColumns[LABELS.STATUS].template = this.statusTpl;
    PipelineTableColumns[LABELS.NAME].template = this.nameTpl;

    this.columns = Object.values(PipelineTableColumns);

    this.cdRef.detectChanges();
  }

}
