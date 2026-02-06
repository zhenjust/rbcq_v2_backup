import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'hasInprogress',
  standalone: false
})
export class HasInprogressPipe implements PipeTransform {

  transform(tableData: any[]): boolean {
    return !!tableData?.filter(td => td.status === 'In-Progress')?.length;
  }

}
