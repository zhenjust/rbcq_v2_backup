import { Component, OnDestroy, OnInit, computed, effect, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MeterProcessTypes, Regions } from '@shared/enums';
import { Subject, takeUntil, debounceTime, distinctUntilChanged} from 'rxjs';
import { RunJobService } from '@shared/services/meterProcess';
import { meterProcessBillingPeriod, mtnList, mtnListPage, meterProcessParams, meterProcessOptions } from '@shared/interfaces';
import { MeterprocessService } from '@shared/services/api';
import { METER_PROCESS_TYPE_OPTION } from '@shared/constants';
import { isAfter, isBefore, isSameDay, startOfDay } from 'date-fns';
import { DateFormatterUtilService } from '@shared/services/utils';
import { DisabledTimeFn } from 'ng-zorro-antd/date-picker';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-meter-process-config',
  standalone: false,
  templateUrl: './meter-process-config.component.html',
  styleUrl: './meter-process-config.component.scss',
})
export class MeterProcessConfigComponent implements OnInit, OnDestroy {
  private readonly yesterday: Date = new Date(Date.now() - 24 * 60 * 60 * 1000);
  private readonly destroy$ = new Subject<void>();

  private readonly rjs = inject(RunJobService);
  private readonly mpa = inject(MeterprocessService);
  private readonly fb = inject(FormBuilder);
  private readonly dfp = inject(DateFormatterUtilService);
  public toast = inject(ToastrService)

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
  public initialAdjNo = signal<number>(1); // adjustment number initial value

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
      tradingDate: [this.yesterday],
      billingPeriodName: [null],
      datetimeRange: [[startDate, endDate], Validators.required],
      regionGroup: [null],
      mtn: [null],
      adjNo: [null],
      billingStartDate: [null],
      billingEndDate: [null]
    }, {validators: [this.dateRangeValidator()]});

    this.updateServiceConfiguration();
  }

  private setupFormSubscriptions(): void {
    this.meterProcessForm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => this.updateServiceConfiguration());

    this.meterProcessForm.statusChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        this.rjs.updateFormValidity(status === 'VALID');
      });

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

    this.meterProcessForm.get('datetimeRange')?.valueChanges
      .pipe(takeUntil(this.destroy$), debounceTime(100))
      .subscribe((range: [Date, Date]) => {
        const processType = this.meterProcessForm.get('processType')?.value;

        if (range && range.length === 2) {
          const [start, end] = range;
          if (!start || !end) return;

          if (processType === MeterProcessTypes.DAILY) {
            if (isSameDay(start, end)) {
              if (start > end) {
                const correctedEnd = new Date(start);
                correctedEnd.setMinutes(correctedEnd.getMinutes() + 5);
                this.meterProcessForm.patchValue({ datetimeRange: [start, correctedEnd] }, { emitEvent: false });
              }
            }
          }
        }
        this.meterProcessForm.updateValueAndValidity({ onlySelf: false, emitEvent: false });
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
    const startDate = new Date(this.yesterday);
    startDate.setHours(0, 5, 0, 0);

    const endDate = new Date(this.yesterday);
    endDate.setDate(endDate.getDate() + 1);
    endDate.setHours(0, 0, 0, 0);

    return { startDate, endDate };
  }

  private processFormValue(formValue: any): meterProcessParams {
    return {
      ...formValue,
      tradingDate: this.dfp.formatDateOnly(formValue.tradingDate),
      startDatetime: this.dfp.formatDateTime(formValue.datetimeRange?.[0]),
      endDatetime: this.dfp.formatDateTime(formValue.datetimeRange?.[1]),
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
      datetimeRange: [startDate, endDate],
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
        datetimeRange: [null, null]
      }, { emitEvent: false });
    }

    setTimeout(() => this.updateServiceConfiguration(), 0);
  }

  private updateDateTimeValidators(processType: string): void {
    const [startControl, endControl] = this.meterProcessForm.get('datetimeRange')?.value || [];

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
      datetimeRange: [null, null],
      billingStartDate: null,
      billingEndDate: null
    };

    const currentTradingDate = this.meterProcessForm?.get('tradingDate')?.value;

    switch (processType) {
      case MeterProcessTypes.DAILY:
        return {
          ...baseReset,
          tradingDate: currentTradingDate ?? this.yesterday,
          datetimeRange: [
            currentTradingDate ?? this.yesterday,
            new Date(new Date(currentTradingDate ?? this.yesterday).getTime() + 24 * 60 * 60 * 1000)
          ]
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
    startDate.setHours(0, 5);

    endDate.setDate(endDate.getDate() + 1);
    endDate.setHours(0, 0, 0, 0);

    this.meterProcessForm.patchValue({
      datetimeRange: [startDate, endDate],
      billingStartDate: this.dfp.formatDateOnly(billingPeriod.startDate),
      billingEndDate: this.dfp.formatDateOnly(billingPeriod.endDate)
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
          const updatedList = [...this._mtnList(), ...response.data];
          this._mtnList.set(updatedList);

          if (response.hasMore) {
            this._nextPage.set(currentPage + 1);
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
      datetimeRange: [startDate, endDate],
      mtn: [],
      adjNo: null,
      billingStartDate: null,
      billingEndDate: null
    });

    this._processType.set(MeterProcessTypes.DAILY);
    this.updateServiceConfiguration();
  }

  // Date validation methods
  public onRangePickerOk(): void {
    this.meterProcessForm.get('datetimeRange')?.updateValueAndValidity({ onlySelf: false });
  };

  dateRangeValidator(): ValidatorFn {
    return (group: AbstractControl): { [key: string]: any } | null => {
      const range = group.get('datetimeRange')?.value;
      if (range && range.length === 2) {
        const [start, end] = range;
        if (!start || !end) return null;

        if (new Date(start) > new Date(end)) {
          return { dateRangeInvalid: true };
        }

        if (isSameDay(start, end)) {
          const diff = (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60); // minutes
          if (diff < 5) {
            return { dateRangeTooShort: true };
          }
        }
      }
      return null;
    };
  };

  disableTradingDateRange = (date: Date): boolean => {
      if (!this.isDailyType()) return false;
      return isAfter(startOfDay(date), this.yesterday);
  };

  disableRangeDate = (date: Date): boolean => {
    const processType = this.meterProcessForm.get('processType')?.value;
    const tradingDate = this.meterProcessForm.get('tradingDate')?.value;
    const billingStartStr = this.meterProcessForm.get('billingStartDate')?.value;
    const billingEndStr = this.meterProcessForm.get('billingEndDate')?.value;

    if (processType === MeterProcessTypes.DAILY) {
      if (!tradingDate) return true;

      const trading = startOfDay(new Date(tradingDate));
      const nextDay = new Date(trading);
      nextDay.setDate(trading.getDate() + 1);

      const target = startOfDay(date);
      return !isSameDay(target, trading) && !isSameDay(target, nextDay);
    }

    if (billingStartStr && billingEndStr) {
      const billingStart = startOfDay(new Date(billingStartStr));
      const billingEnd = startOfDay(new Date(billingEndStr));
      billingEnd.setDate(billingEnd.getDate() + 1);
      return isBefore(date, billingStart) || isAfter(date, billingEnd);
    }

    return true;
  };

  disabledRangeTime: DisabledTimeFn = ((current: Date, partial: 'start' | 'end') => {
    const processType = this.meterProcessForm.get('processType')?.value;

    const tradingDate = this.meterProcessForm.get('tradingDate')?.value;
    const billingStartStr = this.meterProcessForm.get('billingStartDate')?.value;
    const billingEndStr = this.meterProcessForm.get('billingEndDate')?.value;

    const isDaily = processType === MeterProcessTypes.DAILY;

    const minDate = isDaily && tradingDate
      ? new Date(new Date(tradingDate).setHours(0, 5, 0, 0))
      : billingStartStr
        ? new Date(new Date(billingStartStr).setHours(0, 5, 0, 0))
        : null;


    let maxDate: Date | null = null;
    if (isDaily && tradingDate) {
      const tDate = new Date(tradingDate);
      maxDate = new Date(tDate);
      maxDate.setDate(tDate.getDate() + 1);
      maxDate.setHours(0, 0, 0, 0);
    } else if (billingEndStr) {
      const parsedEnd = new Date(billingEndStr + 'T00:00:00');
      maxDate = new Date(parsedEnd);
      maxDate.setDate(parsedEnd.getDate() + 1);
      maxDate.setHours(0, 0, 0, 0);
    }

    return {
      nzDisabledHours: () => {
        const disabled: number[] = [];

        if (partial === 'end' && maxDate && isSameDay(current, maxDate)) {
          disabled.push(...Array.from({ length: 24 }, (_, h) => h).filter(h => h !== 0));
        }

        return Array.from(new Set(disabled));
      },

      nzDisabledMinutes: (hour: number) => {
        const disabled: number[] = [];

        if (partial === 'start' && minDate && isSameDay(current, minDate) && hour === 0) {
          for (let m = 0; m < 5; m++) disabled.push(m);
        }

        if (partial === 'end' && maxDate && isSameDay(current, maxDate) && hour === 0) {
          for (let m = 1; m < 60; m++) disabled.push(m);
        }

        return Array.from(new Set(disabled));
      },

      nzDisabledSeconds: () => []
    };
  }) as DisabledTimeFn;
}
