import { Component, OnDestroy, OnInit, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MeterProcessTypes, Regions } from '@shared/enums';
import { Subject, takeUntil, debounceTime, distinctUntilChanged} from 'rxjs';
import { RunJobService } from '@shared/services/meterProcess';
import { meterProcessBillingPeriod, mtnList, mtnListPage, meterProcessParams, meterProcessOptions } from '@shared/interfaces';
import { MeterprocessService } from '@shared/services/api';
import { METER_PROCESS_TYPE_OPTION } from '@shared/constants';
import { isAfter, isBefore, isSameDay, startOfDay } from 'date-fns';
import { DateFormatterUtilService } from '@shared/services/utils';
import { DisabledTimeFn } from 'ng-zorro-antd/date-picker';

@Component({
  selector: 'app-meter-process-config',
  standalone: false,
  templateUrl: './meter-process-config.component.html',
  styleUrl: './meter-process-config.component.scss',
})
export class MeterProcessConfigComponent implements OnInit, OnDestroy {
  private readonly today: Date = new Date();
  private readonly destroy$ = new Subject<void>();

  private readonly rjs = inject(RunJobService);
  private readonly mpa = inject(MeterprocessService);
  private readonly fb = inject(FormBuilder);
  private readonly dfp = inject(DateFormatterUtilService);

  //Forms
  public meterProcessForm!: FormGroup;
  public readonly meterProcessTypeOptions: meterProcessOptions[] = METER_PROCESS_TYPE_OPTION;
  public readonly meterProcessRegionGroup = this.initializeRegionGroup();

  //Private Signals
  private readonly _nextPage = signal<number>(0);
  private readonly _search = signal<string>('');
  private readonly _mtnIsLoading = signal<boolean>(false);
  private readonly _meterProcessBillingPeriod = signal<meterProcessBillingPeriod[]>([]);
  private readonly _mtnList = signal<mtnList[]>([]);
  private readonly _processType = signal<string>(MeterProcessTypes.DAILY);


  //Public Signals
  public readonly mtnIsLoading = this._mtnIsLoading.asReadonly();
  public readonly meterProcessBillingPeriod = this._meterProcessBillingPeriod.asReadonly();
  public readonly mtnList = this._mtnList.asReadonly();

  //Computed Signals
  public readonly isAdjustmentType = computed(() => this._processType() === MeterProcessTypes.ADJUSTMENT);
  public readonly isDailyType = computed(() => this._processType() === MeterProcessTypes.DAILY);
  public readonly isNotDailyType = computed(() => this._processType() !== MeterProcessTypes.DAILY);

  public readonly selectedBillingPeriod = computed(() => {
    const billingPeriodValue = this.meterProcessForm?.get('billingPeriodName')?.value;
    if (!billingPeriodValue) return null;
    return this._meterProcessBillingPeriod().find(period => period.name === billingPeriodValue);
  });

  constructor() {
    this.setupEffects();
  }

  ngOnInit(): void {
    this.initializeForm();
    this.setupFormSubscriptions();
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    const { startDate, endDate } = this.getDefaultDates();

    this.meterProcessForm = this.fb.group({
      processType: [MeterProcessTypes.DAILY, Validators.required],
      tradingDate: [new Date()],
      billingPeriodName: [null],
      startDatetime: [startDate, Validators.required],
      endDatetime: [endDate, Validators.required],
      regionGroup: [null],
      mtn: [null],
      adjNo: [null],
      billingStartDate: [null],
      billingEndDate: [null]
    });

    this.updateServiceConfiguration();
  }

  private setupFormSubscriptions(): void {
    this.meterProcessForm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => this.updateServiceConfiguration());

    this.meterProcessForm.statusChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => this.rjs.updateFormValidity(status === 'VALID'));

    this.meterProcessForm.get('processType')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        this._processType.set(value);
        this.handleProcessTypeChange(value);
      });

    this.meterProcessForm.get('tradingDate')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        if (this.isDailyType() && value) {
          this.updateDatetimeForTradingDate(value);
        }
      });

    this.meterProcessForm.get('billingPeriodName')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(selectedValue => {
        if (selectedValue && this.isNotDailyType()) {
          const billingPeriod = this._meterProcessBillingPeriod().find(item => item.name === selectedValue);
          if (billingPeriod) {
            this.updateBillingPeriodWithDatetime(billingPeriod);
          }
        }
      });

    this.meterProcessForm.get('regionGroup')?.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.resetMtnSelection();
        this.loadMtnList();
      });
  }

  private setupEffects(): void {
    effect(() => {
      if (this.isNotDailyType() && this._meterProcessBillingPeriod().length > 0) {
        const currentBillingPeriod = this.meterProcessForm.get('billingPeriodName')?.value;
        if (!currentBillingPeriod) {
          const firstPeriod = this._meterProcessBillingPeriod()[0];
          this.meterProcessForm.patchValue({ 
            billingPeriodName: firstPeriod.name 
          }, { emitEvent: true });
        }
      }
    });

    effect(() => {
      if (this.rjs.isConfigurationCleared()) {
        this.resetComponentState();
      }
    });
  }

  private updateServiceConfiguration(): void {
    const processedValue = this.processFormValue(this.meterProcessForm.getRawValue());
    this.rjs.updateConfiguration(processedValue);
    this.rjs.updateFormValidity(this.meterProcessForm.valid);
  }

  private loadInitialData(): void {
    this.loadBillingPeriods();
    this.loadMtnList();
  }

  private getDefaultDates() {
    const startDate = new Date(this.today);
    startDate.setHours(0, 5, 0, 0);
    
    const endDate = new Date(this.today);
    endDate.setDate(endDate.getDate() + 1);
    endDate.setHours(0, 0, 0, 0);

    return { startDate, endDate };
  }

  private processFormValue(formValue: any): meterProcessParams {
    return {
      ...formValue,
      tradingDate: this.dfp.formatDateOnly(formValue.tradingDate),
      startDatetime: this.dfp.formatDateTime(formValue.startDatetime),
      endDatetime: this.dfp.formatDateTime(formValue.endDatetime),
      mtn: Array.isArray(formValue.mtn) ? formValue.mtn.join(',') : formValue.mtn
    };
  }

  private initializeRegionGroup() {
    return Object.entries(Regions).map(([key, value]) => ({
      label: key,
      value: value,
    }));
  }

  private updateDatetimeForTradingDate(tradingDate: Date): void {
    if (!tradingDate || isNaN(new Date(tradingDate).getTime())) return;

    const tradingDateObj = new Date(tradingDate);
    const startDate = new Date(tradingDateObj);
    startDate.setHours(0, 5);

    const endDate = new Date(tradingDateObj);
    endDate.setDate(endDate.getDate() + 1);
    endDate.setHours(0, 0);

    this.meterProcessForm.patchValue({
      startDatetime: startDate,
      endDatetime: endDate,
    }, { emitEvent: false });
  }

  private handleProcessTypeChange(processType: string): void {
    const resetValues = this.getResetValuesForProcessType(processType);
    
    this.meterProcessForm.patchValue(resetValues, { emitEvent: false });

    this.updateFieldStates(processType);
    this.updateDateTimeValidators(processType);

    if (processType === MeterProcessTypes.DAILY) {
      const tradingDate = this.meterProcessForm.get('tradingDate')?.value;
      if (tradingDate) {
        this.updateDatetimeForTradingDate(tradingDate);
      }
    } else {
      this.meterProcessForm.patchValue({
        startDatetime: null,
        endDatetime: null
      }, { emitEvent: false });
    }

    setTimeout(() => this.updateServiceConfiguration(), 0);
  }

  private updateDateTimeValidators(processType: string): void {
    const startControl = this.meterProcessForm.get('startDatetime');
    const endControl = this.meterProcessForm.get('endDatetime');

    startControl?.clearValidators();
    endControl?.clearValidators();

    if (processType === MeterProcessTypes.DAILY) {
      startControl?.setValidators(Validators.required);
      endControl?.setValidators(Validators.required);
    } else {
      startControl?.setValidators(Validators.required);
      endControl?.setValidators(Validators.required);
    }

    startControl?.updateValueAndValidity({ emitEvent: false });
    endControl?.updateValueAndValidity({ emitEvent: false });
  }

  private getResetValuesForProcessType(processType: string): any {
    const baseReset = { 
      tradingDate: null, 
      billingPeriodName: null, 
      adjNo: null,
      startDatetime: null,
      endDatetime: null,
      billingStartDate: null,
      billingEndDate: null
    };

    switch (processType) {
      case MeterProcessTypes.DAILY:
        return {
          ...baseReset,
          tradingDate: new Date()
        };
      
      case MeterProcessTypes.ADJUSTMENT:
      case MeterProcessTypes.FINAL:
      case MeterProcessTypes.PRELIMINARY:
        return {
          ...baseReset
        };
      
      default:
        return baseReset;
    }
  }

  private updateFieldStates(processType: string): void {
    const tradingControl = this.meterProcessForm.get('tradingDate');
    const billingControl = this.meterProcessForm.get('billingPeriodName');
    const adjControl = this.meterProcessForm.get('adjNo');

    tradingControl?.clearValidators();
    billingControl?.clearValidators();
    adjControl?.clearValidators();

    if (processType === MeterProcessTypes.DAILY) {
      tradingControl?.enable();
      tradingControl?.setValidators(Validators.required);
      billingControl?.disable();
      adjControl?.disable();
    } else {
      tradingControl?.disable();
      billingControl?.enable();
      billingControl?.setValidators(Validators.required);
      
      if (processType === MeterProcessTypes.ADJUSTMENT) {
        adjControl?.enable();
        adjControl?.setValidators(Validators.required);
      } else {
        adjControl?.disable();
      }
    }

    tradingControl?.updateValueAndValidity({ emitEvent: false });
    billingControl?.updateValueAndValidity({ emitEvent: false });
    adjControl?.updateValueAndValidity({ emitEvent: false });
  }

  private resetMtnSelection(): void {
    this.meterProcessForm.patchValue({ mtn: [] }, { emitEvent: false });
    this._mtnList.set([]);
    this._nextPage.set(0);
    this._search.set('');
  }

  private resetComponentState(): void {
    this._nextPage.set(0);
    this._search.set('');
    this._mtnList.set([]);
    this._meterProcessBillingPeriod.set([]);
    this.resetForm();
    this.loadInitialData();
  }

  private loadBillingPeriods(): void {
    this.mpa.getBillingPeriod()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          const billingPeriods: any = Array.isArray(data) ? data : Object.values(data);
          this._meterProcessBillingPeriod.set(billingPeriods);
        },
        error: (err) => console.error('Error loading billing periods:', err),
      });
  }

  private getSelectedRegions(): string[] {
    const regionValues = this.meterProcessForm.get('regionGroup')?.value;
    return Array.isArray(regionValues) ? regionValues : [];
  }

  private loadMtnList(): void {
    const regionValues = this.getSelectedRegions();
    const regionString = regionValues.join(',');
    
    this.mpa.getMtnList(0, '', regionString)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const mtnData = this.extractMtnData(response.data);
          this._mtnList.set(mtnData);
        },
        error: (error) => {
          console.error('Error loading MTN list:', error);
          this._mtnList.set([]);
        },
      });
  }

  private extractMtnData(response: any): mtnList[] {
    if (response?.data && Array.isArray(response.data)) {
      return response.data;
    }
    if (Array.isArray(response)) {
      return response;
    }
    console.warn('Unexpected MTN response format:', response);
    return [];
  }

  // Public methods
  public updateBillingPeriodWithDatetime(billingPeriod: any): void {
    if (!billingPeriod || this.isDailyType()) return;

    const startDate = new Date(billingPeriod.startDate);
    const endDate = new Date(billingPeriod.endDate);
    endDate.setDate(endDate.getDate() + 1); // Add one day to end date
    
    startDate.setHours(0, 5);
    endDate.setHours(0, 0);

    this.meterProcessForm.patchValue({
      startDatetime: startDate,
      endDatetime: endDate,
      billingStartDate: this.dfp.formatDateOnly(startDate),
      billingEndDate: this.dfp.formatDateOnly(endDate)
    }, { emitEvent: false });
  }

  public getNextMtnRecord(search?: string): void {
    this._mtnIsLoading.set(true);
    const currentPage = this._nextPage();
    const regionValues = this.getSelectedRegions();
    const regionString = regionValues.join(',');

    this.mpa.getMtnList(currentPage, search, regionString)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: mtnListPage) => {
          if (response.hasMore) {
            this._nextPage.set(currentPage + 1);
            const updatedList = [...this._mtnList(), ...response.data];
            this._mtnList.set(updatedList);
          }
        },
        error: (error) => console.error('Error loading MTN list:', error.message),
      })
      .add(() => this._mtnIsLoading.set(false));
  }

  public searchMtnRecord(search: string): void {
    this._nextPage.set(0);
    this._search.set(search);
    this._mtnList.set([]);
    this.getNextMtnRecord(search);
  }

  public onSearchClear(): void {
    this._nextPage.set(0);
    this._search.set('');
    this._mtnList.set([]);
    this.getNextMtnRecord();
  }

  public resetForm(): void {
    const { startDate, endDate } = this.getDefaultDates();

    this.meterProcessForm.reset({
      processType: MeterProcessTypes.DAILY,
      regionGroup: [],
      tradingDate: new Date(),
      billingPeriodName: null,
      startDatetime: startDate,
      endDatetime: endDate,
      mtn: [],
      adjNo: null,
      billingStartDate: null,
      billingEndDate: null
    });

    this._processType.set(MeterProcessTypes.DAILY);
    this.updateServiceConfiguration();
  }

  // Date validation methods
  public disableTradingDateRange = (date: Date): boolean => {
    if (!this.isDailyType()) return false;
    return isAfter(startOfDay(date), this.today);
  };

  public disableStartDateRange = (date: Date): boolean => {
    const currentConfig = this.rjs.getLatestConfiguration();
    const currentTradingDate = currentConfig ? currentConfig.tradingDate : '';
    const dateStart = startOfDay(date);

    if (currentConfig?.processType !== MeterProcessTypes.DAILY) {
      const currentBillingStart = currentConfig ? currentConfig.billingStartDate : '';
      const currentBillingEnd = currentConfig ? currentConfig.billingEndDate : '';
      const billingStart = startOfDay(new Date(currentBillingStart));
      const billingEnd = startOfDay(new Date(currentBillingEnd));
      return isBefore(dateStart, billingStart) || isAfter(dateStart, billingEnd);
    }

    return !isSameDay(dateStart, new Date(currentTradingDate));
  };

  public disableEndDateRange = (date: Date): boolean => {
    const currentConfig = this.rjs.getLatestConfiguration();
    const currentBillingStart = currentConfig ? currentConfig.billingStartDate : '';
    const currentBillingEnd = currentConfig ? currentConfig.billingEndDate : '';
    const currentTradingDate = currentConfig ? currentConfig.startDatetime : '';
    const dateStart = startOfDay(date);

    if (currentConfig?.processType === MeterProcessTypes.DAILY) {
      return !isSameDay(dateStart, this.today);
    }

    if (currentConfig?.billingPeriodName) {
      const billingStart = startOfDay(new Date(currentBillingStart));
      const billingEnd = startOfDay(new Date(currentBillingEnd));
      let valid = !isBefore(dateStart, billingStart) && !isAfter(dateStart, billingEnd);

      if (currentTradingDate) {
        const startDate = startOfDay(new Date(currentTradingDate));
        valid = valid && !isBefore(dateStart, startDate);
      }

      return !valid;
    }

    return isBefore(dateStart, new Date(currentTradingDate));
  };

  disabledStartTime(){
   return {
      nzDisabledHours: () => [],
      nzDisabledMinutes: (hour: number) => hour === 0 ? Array.from({ length: 5 }, (_, i) => i) : [],
      nzDisabledSeconds: () => [],
   } 
  }

  disabledEndTimeExceed(){
    return {
      nzDisabledHours: () => [],
      nzDisabledMinutes: (hour: number) => hour === 0 ? Array.from({ length: 5 }, (_, i) => i) : [],
      nzDisabledSeconds: () => [],
    }
  }

  disabledEndTime: DisabledTimeFn = () => {
    const currentConfig = this.rjs.getLatestConfiguration();
    const currentBillingStart = currentConfig ? currentConfig.startDatetime : '';
    const currentBillingEnd = currentConfig ? currentConfig.endDatetime : '';
    const start = new Date(currentBillingStart);
    const end = new Date(currentBillingEnd);

    if (isSameDay(start, end)) {
      const startHour = start.getHours();
      const startMinute = start.getMinutes();

      return {
        nzDisabledHours: () => Array.from({ length: startHour }, (_, i) => i).concat([24]),
        nzDisabledMinutes: (hour: number) => {
          if (hour === startHour) return Array.from({ length: startMinute }, (_, i) => i);
          if (hour === 24) return [56, 57, 58, 59];
          return [];
        },
        nzDisabledSeconds: () => [],
      };
    }

    return {
      nzDisabledHours: () => Array.from({ length: 24 }, (_, i) => i).filter(h => h !== 0),
      nzDisabledMinutes: (hour: number) => hour === 0 ? Array.from({ length: 60 }, (_, i) => i).filter(m => m !== 0) : [],
      nzDisabledSeconds: () => [],
    };
  }

}