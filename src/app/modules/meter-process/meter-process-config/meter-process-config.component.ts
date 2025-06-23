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

  public readonly disabledStartTime = computed(() => ({
    nzDisabledHours: () => [],
    nzDisabledMinutes: (hour: number) => hour === 0 ? Array.from({ length: 5 }, (_, i) => i) : [],
    nzDisabledSeconds: () => [],
  }));

  public readonly disabledEndTime = computed(() => {
    const start = new Date(this.meterProcessForm?.get('startDatetime')?.value);
    const end = new Date(this.meterProcessForm?.get('endDatetime')?.value);
    if (!start || !end) return { nzDisabledHours: () => [], nzDisabledMinutes: () => [], nzDisabledSeconds: () => [] };

    const nextDay = new Date(start);
    nextDay.setDate(start.getDate() + 1);

    if (isSameDay(end, nextDay)) {
      return {
        nzDisabledHours: () => Array.from({ length: 24 }, (_, i) => i).filter(h => h !== 0),
        nzDisabledMinutes: (hour: number) => hour === 0 ? Array.from({ length: 60 }, (_, i) => i).filter(m => m !== 0) : [],
        nzDisabledSeconds: () => [],
      };
    }

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
        this.updateServiceConfiguration();
      });

    this.meterProcessForm.get('tradingDate')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        if (this.isDailyType() && value) {
          this.updateDatetimeForTradingDate(value);
          this.updateServiceConfiguration();
        }
      });

    this.meterProcessForm.get('billingPeriodName')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(selectedValue => {
        const billingPeriod = this._meterProcessBillingPeriod().find(item => item.name === selectedValue);
        if (billingPeriod) {
          this.updateBillingPeriodWithDatetime(billingPeriod);
          this.updateServiceConfiguration();
        }
      });

    this.meterProcessForm.get('regionGroup')?.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.resetMtnSelection();
        this.loadMtnList();
        this.updateServiceConfiguration();
      });
  }

  private setupEffects(): void {
    effect(() => {
      if (this.isNotDailyType() && this._meterProcessBillingPeriod().length > 0) {
        const firstPeriod = this._meterProcessBillingPeriod()[0];
        this.updateBillingPeriodWithDatetime(firstPeriod);
        this.meterProcessForm.patchValue({ billingPeriodName: firstPeriod.billingPeriod });
        this.updateServiceConfiguration();
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
      mtn: Array.isArray(formValue.mtn) ? formValue.mtn.join(',') : formValue.mtn,
      regionGroup: Array.isArray(formValue.regionGroup) 
        ? formValue.regionGroup.join(',') 
        : formValue.regionGroup,
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
    const resetValues: any = this.getResetValuesForProcessType(processType);
    
    this.meterProcessForm.patchValue(resetValues, { emitEvent: false });
    this.updateFieldStates(processType);
    this.validateDateTimeFields();

    // Special handling for daily type trading date
    if (processType === MeterProcessTypes.DAILY) {
      const tradingDate = this.meterProcessForm.get('tradingDate')?.value;
      if (tradingDate) {
        this.updateDatetimeForTradingDate(tradingDate);
      }
    }
  }

  private getResetValuesForProcessType(processType: string): any {
    const baseReset = { tradingDate: null, billingPeriodName: null, adjNo: null };

    switch (processType) {
      case MeterProcessTypes.DAILY:
        return {
          ...baseReset,
          tradingDate: new Date(), // Keep trading date for daily
          billingPeriodName: null,
          adjNo: null,
        };
      
      case MeterProcessTypes.ADJUSTMENT:
        return {
          ...baseReset,
          startDatetime: null,
          endDatetime: null,
        };
      
      default:
        return baseReset;
    }
  }

  private updateFieldStates(processType: string): void {
    const billingControl = this.meterProcessForm.get('billingPeriodName');
    const adjControl = this.meterProcessForm.get('adjNo');

    // Reset validators and states
    adjControl?.clearValidators();

    if (processType === MeterProcessTypes.DAILY) {
      billingControl?.disable();
      adjControl?.disable();
    } else {
      billingControl?.enable();
      billingControl?.setValidators(Validators.required);
      
      if (processType === MeterProcessTypes.ADJUSTMENT) {
        adjControl?.enable();
        adjControl?.setValidators(Validators.required);
      } else {
        adjControl?.disable();
        adjControl?.clearValidators();
      }
    }

    adjControl?.updateValueAndValidity();
  }

  private validateDateTimeFields(): void {
    ['startDatetime', 'endDatetime', 'tradingDate'].forEach(fieldName => {
      this.meterProcessForm.get(fieldName)?.updateValueAndValidity();
    });
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
    if (!billingPeriod) return;

    const startDate = new Date(billingPeriod.startDate);
    const endDate = new Date(billingPeriod.endDate);
    startDate.setHours(0, 5);
    endDate.setHours(0, 0);

    this.meterProcessForm.patchValue({
      startDatetime: startDate,
      endDatetime: endDate
    });
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
    const processType = this._processType();
    const dateStart = startOfDay(date);

    if (processType === MeterProcessTypes.DAILY) {
      return !isSameDay(dateStart, this.today);
    }

    const selectedBilling = this.selectedBillingPeriod();
    if (selectedBilling) {
      const billingStart = startOfDay(new Date(selectedBilling.startDate));
      const billingEnd = startOfDay(new Date(selectedBilling.endDate));
      return isBefore(dateStart, billingStart) || isAfter(dateStart, billingEnd);
    }

    return isAfter(dateStart, this.today);
  };

  public disableEndDateRange = (date: Date): boolean => {
    const processType = this._processType();
    const dateStart = startOfDay(date);

    if (processType === MeterProcessTypes.DAILY) {
      return !isSameDay(dateStart, this.today);
    }

    const selectedBilling = this.selectedBillingPeriod();
    const startDatetime = this.meterProcessForm?.get('startDatetime')?.value;

    if (selectedBilling) {
      const billingStart = startOfDay(new Date(selectedBilling.startDate));
      const billingEnd = startOfDay(new Date(selectedBilling.endDate));
      let valid = !isBefore(dateStart, billingStart) && !isAfter(dateStart, billingEnd);

      if (startDatetime) {
        const startDate = startOfDay(new Date(startDatetime));
        valid = valid && !isBefore(dateStart, startDate);
      }

      return !valid;
    }

    if (startDatetime) {
      const startDate = startOfDay(new Date(startDatetime));
      return isBefore(dateStart, startDate);
    }

    return isBefore(dateStart, this.today);
  };
}