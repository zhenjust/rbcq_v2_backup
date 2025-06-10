//ts service 
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { METER_PROCESS_TYPE_OPTION } from '@shared/constants';
import { MeterProcessTypes, RegionGroup, Regions } from '@shared/enums';
import { meterProcessOptions, meterProcessParams, mtnList } from '@shared/interfaces';
import { FormatDatePipe } from '@shared/pipes';
import { BehaviorSubject, debounceTime, distinctUntilChanged } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RunJobService {
  private meterProcessForm!: FormGroup;

  private formValueSubject = new BehaviorSubject<meterProcessParams | null>(null);
  private formValidSubject = new BehaviorSubject<boolean>(false);
  private processTypeSubject = new BehaviorSubject<string>('');
  private mtnListSubject = new BehaviorSubject<mtnList[]>([]);
  private formatedDatePipe = new FormatDatePipe();
  
  // observables
  public formValue$ = this.formValueSubject.asObservable();
  public formValid$ = this.formValidSubject.asObservable();
  public processType$ = this.processTypeSubject.asObservable();
  public mtnList$ = this.mtnListSubject.asObservable();
  
  // Form options
  public meterProcessTypeOptions: meterProcessOptions[] = METER_PROCESS_TYPE_OPTION;
  public meterProcessRegionGroup: {label: string, value: Regions}[] = [];
  
  constructor(private fb: FormBuilder) {
    this.initializeForm();
    this.setupFormValueChanges();
    this.initializeRegionGroup();
  }

  public getFormattedDate(dateString: string): string {
    return this.formatedDatePipe.transform(dateString);
  }
  
  private initializeForm(): void {
    //default values for DAILY
    const today = new Date();
    const startDate = new Date(today);
    startDate.setHours(0, 5); 
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + 1);
    endDate.setHours(0, 0);


    this.meterProcessForm = this.fb.group({
      processType: [MeterProcessTypes.DAILY, Validators.required],
      tradingDate: [today],
      billingPeriod: [null],
      billingPeriodName: [null],
      startDatetime: [startDate, Validators.required],
      endDatetime: [endDate, Validators.required],
      regionGroup: [[], Validators.required], 
      mtn: [[], Validators.required],
      adjNo: [null]
    });
  }
  
  private setupFormValueChanges(): void {
    this.meterProcessForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(value => {
        const processedValues = {
          ...value,
          tradingDate: this.formatedDatePipe.formatDateOnly(value.tradingDate),
          startDatetime: this.formatedDatePipe.formatDateTime(value.startDatetime),
          endDatetime: this.formatedDatePipe.formatDateTime(value.endDatetime),
          mtn: Array.isArray(value.mtn) ? value.mtn.join(',') : value.mtn,
          regionGroup: Array.isArray(value.regionGroup) ? value.regionGroup.join(',') : value.regionGroup
        }
        this.formValueSubject.next(processedValues as meterProcessParams);
        this.formValidSubject.next(this.meterProcessForm.valid);
      });
    
    this.meterProcessForm.statusChanges.subscribe(status => {
      this.formValidSubject.next(status === 'VALID');
    });
    
    this.meterProcessForm.get('processType')?.valueChanges.subscribe(value => {
      this.processTypeSubject.next(value);
      this.handleProcessTypeChange(value);
    });

    this.meterProcessForm.get('tradingDate')?.valueChanges.subscribe(value => {
      if (this.isDailyType && value) {
        this.updateDatetimeForTradingDate(value);
      }
    });
    
    this.formValueSubject.next(this.meterProcessForm.value);
    this.formValidSubject.next(this.meterProcessForm.valid);
    this.processTypeSubject.next(this.meterProcessForm.get('processType')?.value);
  }
  
  private initializeRegionGroup(): void {
    this.meterProcessRegionGroup = Object.entries(Regions).map(([key, value]) => ({
      label: key,
      value: value
    }));
  }

  // New method to update datetime based on trading date
  private updateDatetimeForTradingDate(tradingDate: Date): void {
    if (!tradingDate) return;

    const tradingDateObj = new Date(tradingDate);
    if (isNaN(tradingDateObj.getTime())) return;

    const startDate = new Date(tradingDateObj);
    startDate.setHours(0, 5);

    const endDate = new Date(tradingDateObj);
    endDate.setDate(endDate.getDate() + 1);
    endDate.setHours(0, 0);

    this.meterProcessForm.patchValue({
      startDatetime: startDate,
      endDatetime: endDate
    }, { emitEvent: false });
  }
  
  private handleProcessTypeChange(value: string): void {
    if (value === MeterProcessTypes.DAILY) {
      this.meterProcessForm.patchValue({
        billingPeriod: null,
        billingPeriodName: null,
        adjNo: null
      });
      this.disableNonDailyFields();
      
      // Auto-populate datetime based on current trading date
      const currentTradingDate = this.meterProcessForm.get('tradingDate')?.value;
      if (currentTradingDate) {
        this.updateDatetimeForTradingDate(currentTradingDate);
      }
    } else if (value === MeterProcessTypes.ADJUSTMENT) {
      this.meterProcessForm.patchValue({
        tradingDate: null,
        billingPeriod: null,
        billingPeriodName: null,
        startDatetime: null,
        endDatetime: null
      });
      this.enableNonDailyFields();
    } else {
      this.meterProcessForm.patchValue({
        tradingDate: null,
        adjNo: null
      });
      this.enableNonDailyFields();
    }
  }
  
  private disableNonDailyFields(): void {
    this.meterProcessForm.get('billingPeriod')?.disable();
    this.meterProcessForm.get('billingPeriodName')?.disable();
    this.meterProcessForm.get('adjNo')?.disable();
    this.meterProcessForm.get('startDatetime')?.enable();
    this.meterProcessForm.get('endDatetime')?.enable();
  }
  
  private enableNonDailyFields(): void {
    this.meterProcessForm.get('billingPeriod')?.enable();
    this.meterProcessForm.get('billingPeriodName')?.enable();
    this.meterProcessForm.get('startDatetime')?.enable();
    this.meterProcessForm.get('endDatetime')?.enable();
  }
  
  // MTN List methods
  public updateMtnList(mtnList: mtnList[]): void {
    this.mtnListSubject.next(mtnList);
  }
  
  public getMtnList(): mtnList[] {
    return this.mtnListSubject.value;
  }
  
  public getSelectedMtnNames(): string[] {
    const selectedIds = this.meterProcessForm.get('mtn')?.value || [];
    const mtnList = this.getMtnList();
    return mtnList
      .filter(mtn => selectedIds.includes(mtn.id))
      .map(mtn => mtn.name);
  }

  get selectedRegionNames(): string[] {
    const selectedValues = this.meterProcessForm.get('regionGroup')?.value || [];
    return this.meterProcessRegionGroup
        .filter(region => selectedValues.includes(region.value))
        .map(region => region.label);
  }
  
  // Billing period with datetime update
  public updateBillingPeriodWithDatetime(billingPeriod: any): void {
    if (billingPeriod) {
      const startDate = new Date(billingPeriod.startDate);
      const endDate = new Date(billingPeriod.endDate);
      startDate.setHours(0, 5);
      endDate.setHours(0, 0);
      
      this.meterProcessForm.patchValue({
        startDatetime: startDate,
        endDatetime: endDate,
        billingPeriodName: billingPeriod.supplyMonth
      });
    }
  }
  
  // helper method for time intervals
  public roundToNearestFiveMinutes(date: Date): Date {
    const minutes = date.getMinutes();
    const roundedMinutes = Math.round(minutes / 5) * 5;
    const newDate = new Date(date);
    newDate.setMinutes(roundedMinutes, 0, 0);
    return newDate;
  }
  
  // form methods
  getForm(): FormGroup {
    return this.meterProcessForm;
  }
  
  getCurrentFormValue(): meterProcessParams {
    const formValue = this.meterProcessForm.value;
    return {
      ...formValue,
      tradingDate: this.formatedDatePipe.formatDateOnly(formValue.tradingDate),
      startDatetime: this.formatedDatePipe.formatDateTime(formValue.startDatetime),
      endDatetime: this.formatedDatePipe.formatDateTime(formValue.endDatetime),
      mtn: Array.isArray(formValue.mtn) ? formValue.mtn.join(',') : formValue.mtn,
      regionGroup: Array.isArray(formValue.regionGroup) ? formValue.regionGroup.join(',') : formValue.regionGroup
    };
  }
  
  updateFormValue(value: meterProcessParams): void {
    this.meterProcessForm.patchValue(value);
  }
  
  resetForm(): void {
    //default values for DAILY
    const today = new Date();
    const startDate = new Date(today);
    startDate.setHours(0, 5); 
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + 1);
    endDate.setHours(0, 0);


    this.meterProcessForm.reset({
      processType: MeterProcessTypes.DAILY,
      regionGroup: [],
      tradingDate: [today],
      billingPeriod: null,
      billingPeriodName: null,
      startDatetime: [startDate, Validators.required],
      endDatetime: [endDate, Validators.required],
      mtn: [],
      adjNo: null
    });
  }
  
  isFormValid(): boolean {
    return this.meterProcessForm.valid;
  }
  
  // Getters
  get isAdjustmentType(): boolean {
    return this.meterProcessForm?.get('processType')?.value === MeterProcessTypes.ADJUSTMENT;
  }
  
  get isDailyType(): boolean {
    return this.meterProcessForm?.get('processType')?.value === MeterProcessTypes.DAILY;
  }
  
  get isNotDailyType(): boolean {
    return this.meterProcessForm?.get('processType')?.value !== MeterProcessTypes.DAILY;
  }

  get isFinalType(): boolean {
    return this.meterProcessForm?.get('processType')?.value === MeterProcessTypes.FINAL;
  }
  
  get currentProcessType(): string {
    return this.meterProcessForm?.get('processType')?.value || '';
  }

  get isVisibleFieldsValid(): boolean {
    const controlsToCheck: string[] = [];
    const processType = this.currentProcessType;

    if (processType === MeterProcessTypes.DAILY) {
        controlsToCheck.push('tradingDate', 'startDatetime', 'endDatetime');
    } else if (processType === MeterProcessTypes.ADJUSTMENT) {
        controlsToCheck.push('adjNo', 'billingPeriod', 'startDatetime', 'endDatetime');
    } else {
        controlsToCheck.push('billingPeriod', 'startDatetime', 'endDatetime');
    }

    controlsToCheck.push('regionGroup', 'mtn');

    return controlsToCheck.every((fieldName) => {
        const control = this.meterProcessForm.get(fieldName);
        if (fieldName === 'regionGroup' || fieldName === 'mtn') {
            return control && control.enabled && control.valid && 
                  Array.isArray(control.value) && control.value.length > 0;
        }
        return control && control.enabled && control.valid && 
              control.value !== null && control.value !== '';
    });
  }
}