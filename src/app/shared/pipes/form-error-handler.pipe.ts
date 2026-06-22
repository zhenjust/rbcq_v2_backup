import { Pipe, PipeTransform } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Pipe({
  name: 'formErrorHandler',
  standalone: false
})
export class FormErrorHandler implements PipeTransform {

  transform(formGroup: FormGroup): string {
    console.log({formGroup})
    return ''
  }

}
