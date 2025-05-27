import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { METER_PROCESS_TYPE_OPTION } from '@shared/constants';
import { MeterProcessTypes, RegionGroup } from '@shared/enums';
import { meterProcessOptions, meterProcessParams } from '@shared/interfaces';
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
  private formatedDatePipe = new FormatDatePipe();
  
  // observables
  public formValue$ = this.formValueSubject.asObservable();
  public formValid$ = this.formValidSubject.asObservable();
  public processType$ = this.processTypeSubject.asObservable();
  
  // Form options
  public meterProcessTypeOptions: meterProcessOptions[] = METER_PROCESS_TYPE_OPTION;
  public meterProcessRegionGroup: {label: string, value: RegionGroup}[] = [];
  
  constructor(private fb: FormBuilder) {
    this.initializeForm();
    this.setupFormValueChanges();
    this.initializeRegionGroup();
  }

  public getFormattedDate(dateString: string): string {
    return this.formatedDatePipe.transform(dateString);
  }
  
  private initializeForm(): void {
    this.meterProcessForm = this.fb.group({
      processType: [MeterProcessTypes.DAILY, Validators.required],
      tradingDate: [this.formatedDatePipe.formatToShortDate(new Date().toISOString())],
      billingPeriod: [this.formatedDatePipe.formatToShortDate(new Date().toISOString())],
      startDate: [''],
      endDate: [''],
      regionGroup: [RegionGroup.ALL],
      adjNo: ['']
    });
  }
  
  private setupFormValueChanges(): void {
    // Emit form value changes
    this.meterProcessForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(value => {
        const processedValues = {
          ...value,
          tradingDate: this.formatedDatePipe.transform(value.tradingDate),
          startDate: this.formatedDatePipe.transform(value.startDate),
          endDate: this.formatedDatePipe.transform(value.endDate)
        }
        this.formValueSubject.next(processedValues as meterProcessParams);
        this.formValidSubject.next(this.meterProcessForm.valid);
      });
    
    // Emit form validity changes
    this.meterProcessForm.statusChanges.subscribe(status => {
      this.formValidSubject.next(status === 'VALID');
    });
    
    // Emit process type changes specifically
    this.meterProcessForm.get('processType')?.valueChanges.subscribe(value => {
      this.processTypeSubject.next(value);
      this.handleProcessTypeChange(value);
    });
    
    // Emit initial values
    this.formValueSubject.next(this.meterProcessForm.value);
    this.formValidSubject.next(this.meterProcessForm.valid);
    this.processTypeSubject.next(this.meterProcessForm.get('processType')?.value);
  }
  
  private initializeRegionGroup(): void {
    this.meterProcessRegionGroup = Object.entries(RegionGroup).map(([key, value]) => ({
      label: key,
      value: value
    }));
  }
  
  private handleProcessTypeChange(value: string): void {
    if (value === MeterProcessTypes.DAILY) {
      this.meterProcessForm.patchValue({
        billingPeriod: '',
        startDate: '',
        endDate: '',
        adjNo: ''
      });
      this.disableNonDailyFields();
    } else if (value === MeterProcessTypes.ADJUSTMENT) {
      this.meterProcessForm.patchValue({
        tradingDate: '',
        billingPeriod: '',
        startDate: '',
        endDate: ''
      });
      this.enableNonDailyFields();
    } else {
      this.meterProcessForm.patchValue({
        tradingDate: '',
        adjNo: ''
      });
      this.enableNonDailyFields();
    }
  }
  
  private disableNonDailyFields(): void {
    this.meterProcessForm.get('billingPeriod')?.disable();
    this.meterProcessForm.get('startDate')?.disable();
    this.meterProcessForm.get('endDate')?.disable();
    this.meterProcessForm.get('adjNo')?.disable();
  }
  
  private enableNonDailyFields(): void {
    this.meterProcessForm.get('billingPeriod')?.enable();
    this.meterProcessForm.get('startDate')?.enable();
    this.meterProcessForm.get('endDate')?.enable();
  }
  
  // form methods
  getForm(): FormGroup {
    return this.meterProcessForm;
  }
  
  getCurrentFormValue(): meterProcessParams {
    return this.meterProcessForm.value;
  }
  
  updateFormValue(value: meterProcessParams): void {
    this.meterProcessForm.patchValue(value);
  }
  
  resetForm(): void {
    this.meterProcessForm.reset({
      processType: MeterProcessTypes.DAILY,
      regionGroup: RegionGroup.ALL,
      tradingDate: new Date()
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
}
