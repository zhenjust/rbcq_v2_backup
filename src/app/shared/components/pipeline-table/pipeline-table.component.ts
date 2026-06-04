import { pipeline, TPL_TABLE_COLUMN } from '@shared/interfaces';
import { AfterViewInit, ChangeDetectorRef, Component, input, TemplateRef, ViewChild, inject, output, DestroyRef, computed } from '@angular/core';
import { PipelineTableColumns } from '@shared/constants/pipelines.const';
import { LABELS } from '@shared/constants/labels.const';
import { MeterProcessTypes } from '@shared/enums';
import { NzModalService } from 'ng-zorro-antd/modal';
import { SettlementService } from '@shared/services/api/settlement.service';
import { MESSAGES } from '@shared/constants/messages.const';
import { modalConfig } from '@shared/constants';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-pipeline-table',
  standalone: false,
  templateUrl: './pipeline-table.component.html'
})
export class PipelineTableComponent implements AfterViewInit {

  @ViewChild('statusTpl', { static: true }) statusTpl!: TemplateRef<HTMLElement>;
  @ViewChild('nameTpl', { static: true }) nameTpl!: TemplateRef<HTMLElement>;

  cancelEmit = output<void>();

  private readonly cdRef = inject(ChangeDetectorRef);
  private readonly modalService = inject(NzModalService);
  private readonly settlementService = inject(SettlementService);
  private readonly destroyRef$ = inject(DestroyRef);

  columns: TPL_TABLE_COLUMN[];

  rowData = input.required<pipeline[]>();
  useCustomTableData = input<any[] | null>();
  LABELS = LABELS;
  processTypes = MeterProcessTypes;

  tableData = computed(() => {
    return (this.rowData() || [])
      .filter(row => row.pipelineRuns?.length)
      .map(row => ({...row?.pipelineRuns[0], id: row.id}));
  });

  showActions = computed(() => {
    return this.tableData().some(row => row.status.startsWith('In-Progress'));
  });

  constructor() {
  }

  ngAfterViewInit(): void {
    PipelineTableColumns[LABELS.STATUS].template = this.statusTpl;
    PipelineTableColumns[LABELS.NAME].template = this.nameTpl;

    this.columns = Object.values(PipelineTableColumns);

    this.cdRef.detectChanges();
  }

  cancelRun(id: number): void {
    const modal = this.modalService.confirm({
      ...modalConfig,
      nzTitle: LABELS.CANCEL_RUN,
      nzContent: MESSAGES.CONFIRM_ACTION,
    });

    modal.updateConfig({
      nzOnOk: () => {
        this.settlementService.cancelRun(id)
          .pipe(takeUntilDestroyed(this.destroyRef$))
          .subscribe(() => this.cancelEmit.emit());
      }
    });
  }

}
