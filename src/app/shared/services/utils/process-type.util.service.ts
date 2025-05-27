import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MeterProcessTypes } from '@shared/enums';

@Injectable({
  providedIn: 'root'
})
export class ProcessTypeUtilService {

  constructor() { }

  handleProcessTypeChange(value: string, form: FormGroup): void {
    if (value === MeterProcessTypes.DAILY) {
      form.patchValue({
        billingPeriod: '',
        startDate: '',
        endDate: '',
        adjNo: '',
      });
      this.disableNonDailyFields(form);
    } else if (value === MeterProcessTypes.ADJUSTMENT) {
      form.patchValue({
        tradingDate: '',
        billingPeriod: '',
        startDate: '',
        endDate: '',
      });
      this.enableNonDailyFields(form);
    } else {
      form.patchValue({
        tradingDate: '',
        adjNo: '',
      });
      this.enableNonDailyFields(form);
    }
  }

  disableNonDailyFields(form: FormGroup): void {
    form.get('billingPeriod')?.disable();
    form.get('startDate')?.disable();
    form.get('endDate')?.disable();
    form.get('adjNo')?.disable();
    form.get('tradingDate')?.enable();
  }

  enableNonDailyFields(form: FormGroup): void {
    form.get('billingPeriod')?.enable();
    form.get('startDate')?.enable();
    form.get('endDate')?.enable();
    form.get('adjNo')?.enable();
    form.get('tradingDate')?.disable();
  }
}
