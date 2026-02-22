import { Pipe, PipeTransform } from '@angular/core';
import { SettlementPipelineWithRun } from '@shared/interfaces';

@Pipe({
  name: 'stlPipelineFormatterPipe',
  standalone: false
})
export class SettlementPipelineFormatterPipe implements PipeTransform {

  transform(tableData: SettlementPipelineWithRun[]): SettlementPipelineWithRun[] {
    return tableData.flatMap(td => {
      const rowSpan = td.pipelineRuns.length;

      return td.pipelineRuns.map((run, idx) => {
        const row: any = {
          ...td,
          ...run,
          description: idx === 0 ? (run.description ?? '') : ''
        };

        if (idx === 0) {
          row.rowSpan = rowSpan;
        }

        return row;
      });
    });
  }
}
