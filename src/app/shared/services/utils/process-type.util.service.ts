import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MeterProcessTypes, settlementProcessTypes } from '@shared/enums';

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
      });
      this.enableNonDailyFields(form);
    }
  }

  disableNonDailyFields(form: FormGroup): void {
    form.get('billingPeriod')?.disable();
    form.get('startDate')?.disable();
    form.get('endDate')?.disable();
    form.get('tradingDate')?.enable();
  }

  enableNonDailyFields(form: FormGroup): void {
    form.get('billingPeriod')?.enable();
    form.get('startDate')?.enable();
    form.get('endDate')?.enable();
    form.get('tradingDate')?.disable();
  }

  handleSettlementProcessTypeChange(value: string, form: FormGroup): void {
    if(value === settlementProcessTypes.DAILY){
      form.get('tradingStartDate')?.enable();
      form.get('tradingEndDate')?.enable();
      form.patchValue({
        tradingStartDate: '',
        tradingEndDate: ''
      });
      form.get('startDate')?.disable();
      form.get('endDate')?.disable();
      form.get('billingPeriod')?.disable();
    }else if (value === settlementProcessTypes.ALL){
      form.get('startDate')?.disable();
      form.get('endDate')?.disable();
      form.get('billingPeriod')?.disable();
      form.get('tradingStartDate')?.disable();
      form.get('tradingEndDate')?.disable();
    }else {
      form.get('startDate')?.enable();
      form.get('endDate')?.enable();
      form.get('billingPeriod')?.enable();
      form.patchValue({
        billingPeriod: '',
        startDate: '',
        endDate: ''
      });
      form.get('tradingStartDate')?.disable();
      form.get('tradingEndDate')?.disable();
    }
  }
}
