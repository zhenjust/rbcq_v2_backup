import { Component, OnDestroy, OnInit, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MeterProcessTypes, Regions } from '@shared/enums';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { RunJobService } from '@shared/services/meterProcess';
import { meterProcessBillingPeriod, mtnList, mtnListPage, meterProcessParams, meterProcessOptions } from '@shared/interfaces';
import { MeterprocessService } from '@shared/services/api';
import { METER_PROCESS_TYPE_OPTION } from '@shared/constants';
import { differenceInCalendarDays, isSameDay } from 'date-fns';
import { DateFormatterUtilService } from '@shared/services/utils';

@Component({
  selector: 'app-meter-process-config',
  standalone: false,
  templateUrl: './meter-process-config.component.html',
  styleUrl: './meter-process-config.component.scss',
})
export class MeterProcessConfigComponent implements OnInit, OnDestroy {
  today: Date = new Date();
  meterProcessForm!: FormGroup;
  private readonly destroy$ = new Subject<void>();

  // Form options
  public readonly meterProcessTypeOptions: meterProcessOptions[] = METER_PROCESS_TYPE_OPTION;
  public readonly meterProcessRegionGroup = this.initializeRegionGroup();

  // Private signals
  private readonly _nextPage = signal<number>(0);
  private readonly _search = signal<string>('');
  private readonly _mtnIsLoading = signal<boolean>(false);
  private readonly _meterProcessBillingPeriod = signal<meterProcessBillingPeriod[]>([]);
  private readonly _mtnList = signal<mtnList[]>([]);
  private readonly _processType = signal<string>(MeterProcessTypes.DAILY);

  // Public readonly signals
  public readonly mtnIsLoading = this._mtnIsLoading.asReadonly();
  public readonly meterProcessBillingPeriod = this._meterProcessBillingPeriod.asReadonly();
  public readonly mtnList = this._mtnList.asReadonly();

  // Computed signals
  public readonly isAdjustmentType = computed(() => 
    this._processType() === MeterProcessTypes.ADJUSTMENT
  );

  public readonly isDailyType = computed(() => 
    this._processType() === MeterProcessTypes.DAILY
  );

  public readonly isNotDailyType = computed(() => 
    this._processType() !== MeterProcessTypes.DAILY
  );

  private readonly rjs = inject(RunJobService);
  private readonly mpa = inject(MeterprocessService);
  private readonly fb = inject(FormBuilder);
  private readonly fdp = inject(DateFormatterUtilService)
  
  constructor(){
    this.setupEffects();
  };

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
      billingPeriod: [null],
      billingPeriodName: [null],
      startDatetime: [startDate, Validators.required],
      endDatetime: [endDate, Validators.required],
      regionGroup: [[], Validators.required],
      mtn: [[], Validators.required],
      adjNo: [null],
    });
  }

  private setupFormSubscriptions(): void {
    this.meterProcessForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(value => {
        const processedValue = this.processFormValue(value);
        this.rjs.updateConfiguration(processedValue);
      });

    this.meterProcessForm.statusChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        this.rjs.updateFormValidity(status === 'VALID');
      });

    this.meterProcessForm.get('processType')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        this._processType.set(value);
        this.handleProcessTypeChange(value);
      });

    this.meterProcessForm.get('tradingDate')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        if (this.isDailyType() && value) {
          this.updateDatetimeForTradingDate(value);
        }
      });

    this.meterProcessForm.get('billingPeriod')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(selectedValue => {
        const billingPeriod = this._meterProcessBillingPeriod()
          .find(item => item.billingPeriod === selectedValue);
        
        if (billingPeriod) {
          this.updateBillingPeriodWithDatetime(billingPeriod);
        }
      });

    this.meterProcessForm.get('regionGroup')
      ?.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(regionValues => {
        if (regionValues && regionValues.length > 0) {
          this.meterProcessForm.patchValue({ mtn: [] }, { emitEvent: false });
          this._mtnList.set([]);
          this._nextPage.set(0);
          this._search.set('');          
          this.loadMtnList();
        } else {
          this.meterProcessForm.patchValue({ mtn: [] }, { emitEvent: false });
          this._mtnList.set([]);
        }
    });
  }

  private setupEffects(): void {
    effect(() => {
      const billingPeriods = this._meterProcessBillingPeriod();
      if (this.isNotDailyType() && billingPeriods.length > 0) {
        const firstPeriod = billingPeriods[0];
        this.updateBillingPeriodWithDatetime(firstPeriod);
        this.meterProcessForm.patchValue({ billingPeriod: firstPeriod.billingPeriod });
      }
    });
    effect(() => {
      if (this.rjs.isConfigurationCleared()) {
        this.resetComponentState();
      }
    });
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
      tradingDate: this.fdp.formatDateOnly(formValue.tradingDate),
      startDatetime: this.fdp.formatDateTime(formValue.startDatetime),
      endDatetime: this.fdp.formatDateTime(formValue.endDatetime),
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
    const resetValues: any = {};
    
    if (processType === MeterProcessTypes.DAILY) {
      resetValues.billingPeriod = null;
      resetValues.billingPeriodName = null;
      resetValues.adjNo = null;
      
      // Auto-populate datetime for current trading date
      const tradingDate = this.meterProcessForm.get('tradingDate')?.value;
      if (tradingDate) {
        this.updateDatetimeForTradingDate(tradingDate);
      }
    } else if (processType === MeterProcessTypes.ADJUSTMENT) {
      resetValues.tradingDate = null;
      resetValues.billingPeriod = null;
      resetValues.billingPeriodName = null;
      resetValues.startDatetime = null;
      resetValues.endDatetime = null;
    } else {
      resetValues.tradingDate = null;
      resetValues.adjNo = null;
    }

    this.meterProcessForm.patchValue(resetValues);
    this.updateFieldStates(processType);
  }

  private updateFieldStates(processType: string): void {
    const billingControl = this.meterProcessForm.get('billingPeriod');
    const billingNameControl = this.meterProcessForm.get('billingPeriodName');
    const adjControl = this.meterProcessForm.get('adjNo');

    if (processType === MeterProcessTypes.DAILY) {
      billingControl?.disable();
      billingNameControl?.disable();
      adjControl?.disable();
    } else {
      billingControl?.enable();
      billingNameControl?.enable();
      if (processType === MeterProcessTypes.ADJUSTMENT) {
        adjControl?.enable();
      }
    }
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

  private hasRegionSelected(): string[] {
    const regionValues = this.meterProcessForm.get('regionGroup')?.value;
    return Array.isArray(regionValues) ? regionValues : [];
  }

  private loadMtnList(): void {
    const regionValues = this.hasRegionSelected();
    const regionString = regionValues.length > 0 ? regionValues.join(',') : '';
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
    startDate.setHours(0, 5, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    this.meterProcessForm.patchValue({
      startDatetime: startDate,
      endDatetime: endDate,
      billingPeriodName: billingPeriod.supplyMonth,
    });
  }

  public getNextMtnRecord(search?: string): void {
    this._mtnIsLoading.set(true);
    const currentPage = this._nextPage();
    const regionValues = this.hasRegionSelected();
    const regionString = regionValues.length > 0 ? regionValues.join(',') : '';

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
      billingPeriod: null,
      billingPeriodName: null,
      startDatetime: startDate,
      endDatetime: endDate,
      mtn: [],
      adjNo: null,
    });

    this._processType.set(MeterProcessTypes.DAILY);
    this.rjs.updateFormValidity(false);
  }

  disableDate = (date: Date): boolean =>
    this.isDailyType() ? differenceInCalendarDays(date, this.today) > 0  : false;

  disableDailyDates = (date: Date): boolean => !isSameDay(date, this.today);
}