import { Pipe, PipeTransform } from '@angular/core';
import { LABELS } from '@shared/constants/labels.const';

@Pipe({
  name: 'enumToLabel',
  standalone: false
})
export class EnumsToLabelsPipe implements PipeTransform {

  transform(prop: string): string {
    return LABELS[prop as keyof typeof LABELS];
  }

}
