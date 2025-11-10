import { Injectable } from '@angular/core';
import { LABELS } from '@shared/constants/labels.const';
import { NzSelectOptionInterface } from 'ng-zorro-antd/select';

@Injectable({
  providedIn: 'root'
})
export class SystemUtilService {


  /**
   *
   * @param optConstant: the constant or enum which will be transformed
   * @param isEnumKey: if it is an enum key only, labels will be derived from the labels.const file
   * @returns NzSelectOptionInterface[]
   */
  public nzOptionsFormatter(optConstant: Record<string, string>, isEnumKey = false): NzSelectOptionInterface[] {
    return Object.keys(optConstant).map(key =>
      ({ label: isEnumKey ? LABELS[key as keyof typeof LABELS] : optConstant[key], value: key })
    );
  }
}
