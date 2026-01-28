import { Pipe, PipeTransform } from '@angular/core';
import { SettlementPipelineWithRun } from '@shared/enums/interfaces';

@Pipe({
  name: 'stlPipelineFormatterPipe',
  standalone: false
})
export class SettlementPipelineFormatterPipe implements PipeTransform {

  transform(tableData: SettlementPipelineWithRun[]): SettlementPipelineWithRun[] {
    const formattedTable = tableData.map(td => {
      return {...td, ...td.pipelineRuns[0]}
    });

    return formattedTable;
  }
}