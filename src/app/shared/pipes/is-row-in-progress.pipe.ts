import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'isRowInProgress',
  standalone: false
})
export class IsRowInProgressPipe implements PipeTransform {

  transform(row: any, id: number, billingId: string): boolean {
    return !!row?.pipelines?.some((pipeline: any) =>
      row.id === id &&
      pipeline.name === 'additionalCompensation-deleteAdditionalCompensationClaim' &&
      pipeline.status === 'In-Progress' &&
      pipeline.parameters?.claim1_billingId === billingId
    );
  }

}
