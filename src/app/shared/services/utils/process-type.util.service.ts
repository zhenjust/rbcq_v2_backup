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
        startDatetime: '',
        endDatetime: '',
      });
      this.disableNonDailyFields(form);
    } else if (value === MeterProcessTypes.ADJUSTMENT) {
      form.patchValue({
        tradingDate: '',
        billingPeriod: '',
        startDatetime: '',
        endDatetime: '',
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
    form.get('startDatetime')?.disable();
    form.get('endDatetime')?.disable();
    form.get('tradingDate')?.enable();
  }

  enableNonDailyFields(form: FormGroup): void {
    form.get('billingPeriod')?.enable();
    form.get('startDatetime')?.enable();
    form.get('endDatetime')?.enable();
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
      form.get('startDatetime')?.disable();
      form.get('endDatetime')?.disable();
      form.get('billingPeriod')?.disable();
    }else if (value === settlementProcessTypes.ALL){
      form.get('startDatetime')?.disable();
      form.get('endDatetime')?.disable();
      form.get('billingPeriod')?.disable();
      form.get('tradingStartDate')?.disable();
      form.get('tradingEndDate')?.disable();
    }else {
      form.get('startDatetime')?.enable();
      form.get('endDatetime')?.enable();
      form.get('billingPeriod')?.enable();
      form.patchValue({
        billingPeriod: '',
        startDatetime: '',
        endDatetime: ''
      });
      form.get('tradingStartDate')?.disable();
      form.get('tradingEndDate')?.disable();
    }
  }
}
