import {
  Component,
  OnDestroy,
  OnInit,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MeterProcessTypes, Regions } from '@shared/enums';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { RunJobService } from '@shared/services/meterProcess';
import {
  meterProcessBillingPeriod,
  mtnList,
  mtnListPage,
  meterProcessParams,
  meterProcessOptions,
} from '@shared/interfaces';
import { MeterprocessService } from '@shared/services/api';
import { METER_PROCESS_TYPE_OPTION } from '@shared/constants';
import { FormatDatePipe } from '@shared/pipes';

@Component({
  selector: 'app-meter-process-config',
  standalone: false,
  templateUrl: './meter-process-config.component.html',
  styleUrl: './meter-process-config.component.scss',
})
export class MeterProcessConfigComponent implements OnInit, OnDestroy {
  meterProcessForm!: FormGroup;
  private formatedDatePipe = new FormatDatePipe();

  // Form options
  public meterProcessTypeOptions: meterProcessOptions[] = METER_PROCESS_TYPE_OPTION;
  public meterProcessRegionGroup: { label: string; value: Regions }[] = [];

  // Signals for component state
  private readonly _nextPage = signal<number>(1);
  private readonly _search = signal<string>('');
  private readonly _mtnIsLoading = signal<boolean>(false);
  private readonly _meterProcessBillingPeriod = signal<meterProcessBillingPeriod[]>([]);
  private readonly _mtnList = signal<mtnList[]>([]);
  private readonly _processType = signal<string>('');
  private readonly _formValid = signal<boolean>(false);

  // Public readonly signals
  public readonly nextPage = this._nextPage.asReadonly();
  public readonly search = this._search.asReadonly();
  public readonly mtnIsLoading = this._mtnIsLoading.asReadonly();
  public readonly meterProcessBillingPeriod = this._meterProcessBillingPeriod.asReadonly();
  public readonly mtnList = this._mtnList.asReadonly();
  public readonly processType = this._processType.asReadonly();
  public readonly formValid = this._formValid.asReadonly();

  // Default time values for date pickers
  defaultStartTime: Date;
  defaultEndTime: Date;

  // Computed signals for form state
  public readonly isAdjustmentType = computed(() => 
    this._processType() === MeterProcessTypes.ADJUSTMENT
  );

  public readonly isDailyType = computed(() => 
    this._processType() === MeterProcessTypes.DAILY
  );

  public readonly isNotDailyType = computed(() => 
    this._processType() !== MeterProcessTypes.DAILY
  );

  public readonly isFinalType = computed(() => 
    this._processType() === MeterProcessTypes.FINAL
  );

  public readonly currentProcessType = computed(() => 
    this._processType() || ''
  );

  public readonly selectedRegionNames = computed(() => {
    const selectedValues = this.meterProcessForm?.get('regionGroup')?.value || [];
    return this.meterProcessRegionGroup
      .filter((region) => selectedValues.includes(region.value))
      .map((region) => region.label);
  });

  public readonly selectedMtnNames = computed(() => {
    const selectedIds = this.meterProcessForm?.get('mtn')?.value || [];
    const mtnList = this._mtnList();
    return mtnList
      .filter((mtn) => selectedIds.includes(mtn.id))
      .map((mtn) => mtn.name);
  });

  public readonly isVisibleFieldsValid = computed(() => {
    const controlsToCheck: string[] = [];
    const processType = this.currentProcessType();

    if (processType === MeterProcessTypes.DAILY) {
      controlsToCheck.push('tradingDate', 'startDatetime', 'endDatetime');
    } else if (processType === MeterProcessTypes.ADJUSTMENT) {
      controlsToCheck.push('adjNo', 'billingPeriod', 'startDatetime', 'endDatetime');
    } else {
      controlsToCheck.push('billingPeriod', 'startDatetime', 'endDatetime');
    }

    controlsToCheck.push('regionGroup', 'mtn');

    return controlsToCheck.every((fieldName) => {
      const control = this.meterProcessForm?.get(fieldName);
      if (fieldName === 'regionGroup' || fieldName === 'mtn') {
        return (
          control &&
          control.enabled &&
          control.valid &&
          Array.isArray(control.value) &&
          control.value.length > 0
        );
      }
      return (
        control &&
        control.enabled &&
        control.valid &&
        control.value !== null &&
        control.value !== ''
      );
    });
  });

  private destroy$ = new Subject<void>();
  private rjs = inject(RunJobService);
  private mpa = inject(MeterprocessService);
  private fb = inject(FormBuilder);

  constructor(
  ) {
    // Initialize default time values
    this.defaultStartTime = new Date();
    this.defaultStartTime.setHours(0, 0);

    this.defaultEndTime = new Date();
    this.defaultEndTime.setHours(23, 59);

    this.initializeRegionGroup();
    this.setupEffects();
  }

  ngOnInit(): void {
    this.initializeForm();
    this.setupFormValueChanges();
    this.getBillingPeriod();
    this.updateBillingPeriodForm();
    this.callMtnList();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
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
      adjNo: [null],
    });

    // Set initial process type
    this._processType.set(MeterProcessTypes.DAILY);
  }

  private setupFormValueChanges(): void {
    // Handle form value changes and update service configuration
    this.meterProcessForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((value) => {
        const processedValues = this.processFormValue(value);
        this.rjs.updateConfiguration(processedValues);
      });

    // Handle form status changes
    this.meterProcessForm.statusChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((status) => {
        this._formValid.set(status === 'VALID');
        this.rjs.updateFormValidity(status === 'VALID');
      });

    // Handle process type changes
    this.meterProcessForm
      .get('processType')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this._processType.set(value);
        this.handleProcessTypeChange(value);
      });

    // Handle trading date changes for daily type
    this.meterProcessForm
      .get('tradingDate')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        if (this.isDailyType() && value) {
          this.updateDatetimeForTradingDate(value);
        }
      });

    // Set initial form validity
    this._formValid.set(this.meterProcessForm.valid);
    this.rjs.updateFormValidity(this.meterProcessForm.valid);
  }

  private processFormValue(formValue: any): meterProcessParams {
    return {
      ...formValue,
      tradingDate: this.formatedDatePipe.formatDateOnly(formValue.tradingDate),
      startDatetime: this.formatedDatePipe.formatDateTime(formValue.startDatetime),
      endDatetime: this.formatedDatePipe.formatDateTime(formValue.endDatetime),
      mtn: Array.isArray(formValue.mtn) ? formValue.mtn.join(',') : formValue.mtn,
      regionGroup: Array.isArray(formValue.regionGroup)
        ? formValue.regionGroup.join(',')
        : formValue.regionGroup,
    };
  }

  private initializeRegionGroup(): void {
    this.meterProcessRegionGroup = Object.entries(Regions).map(
      ([key, value]) => ({
        label: key,
        value: value,
      })
    );
  }

  private updateDatetimeForTradingDate(tradingDate: Date): void {
    if (!tradingDate) return;

    const tradingDateObj = new Date(tradingDate);
    if (isNaN(tradingDateObj.getTime())) return;

    const startDate = new Date(tradingDateObj);
    startDate.setHours(0, 5);

    const endDate = new Date(tradingDateObj);
    endDate.setDate(endDate.getDate() + 1);
    endDate.setHours(0, 0);

    this.meterProcessForm.patchValue(
      {
        startDatetime: startDate,
        endDatetime: endDate,
      },
      { emitEvent: false }
    );
  }

  private handleProcessTypeChange(value: string): void {
    if (value === MeterProcessTypes.DAILY) {
      this.meterProcessForm.patchValue({
        billingPeriod: null,
        billingPeriodName: null,
        adjNo: null,
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
        endDatetime: null,
      });
      this.enableNonDailyFields();
    } else {
      this.meterProcessForm.patchValue({
        tradingDate: null,
        adjNo: null,
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

  private setupEffects(): void {
    // Effect to auto-set billing period when data changes
    effect(() => {
      const billingPeriods = this._meterProcessBillingPeriod();
      const isNotDaily = this.isNotDailyType();

      if (isNotDaily && billingPeriods.length > 0) {
        this.tryAutoSetBillingPeriod(billingPeriods);
      }
    });

    // Effect to handle configuration cleared state
    effect(() => {
      const isCleared = this.rjs.isConfigurationCleared();
      if (isCleared) {
        this.resetComponentState();
      }
    });
  }

  private resetComponentState(): void {
    this._nextPage.set(1);
    this._search.set('');
    this._mtnList.set([]);
    this._meterProcessBillingPeriod.set([]);
    this.resetForm();
  }

  private tryAutoSetBillingPeriod(billingPeriods: meterProcessBillingPeriod[]): void {
    if (billingPeriods.length > 0) {
      const selected = billingPeriods[0];
      this.updateBillingPeriodWithDatetime(selected);
      this.meterProcessForm.patchValue({
        billingPeriod: selected.billingPeriod,
      });
    }
  }

  public updateBillingPeriodWithDatetime(billingPeriod: any): void {
    if (billingPeriod) {
      const startDate = new Date(billingPeriod.startDate);
      const endDate = new Date(billingPeriod.endDate);
      startDate.setHours(0, 5);
      endDate.setHours(0, 0);

      this.meterProcessForm.patchValue({
        startDatetime: startDate,
        endDatetime: endDate,
        billingPeriodName: billingPeriod.supplyMonth,
      });
    }
  }

  public roundToNearestFiveMinutes(date: Date): Date {
    const minutes = date.getMinutes();
    const roundedMinutes = Math.round(minutes / 5) * 5;
    const newDate = new Date(date);
    newDate.setMinutes(roundedMinutes, 0, 0);
    return newDate;
  }

  public resetForm(): void {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setHours(0, 5);
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + 1);
    endDate.setHours(0, 0);

    this.meterProcessForm.reset({
      processType: MeterProcessTypes.DAILY,
      regionGroup: [],
      tradingDate: today,
      billingPeriod: null,
      billingPeriodName: null,
      startDatetime: startDate,
      endDatetime: endDate,
      mtn: [],
      adjNo: null,
    });

    this._processType.set(MeterProcessTypes.DAILY);
    this._formValid.set(false);
    this.rjs.updateFormValidity(false);
  }

  public getCurrentFormValue(): meterProcessParams {
    return this.processFormValue(this.meterProcessForm.value);
  }

  private getBillingPeriod(): void {
    this.mpa
      .getBillingPeriod()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          const billingPeriods: any = Array.isArray(data) ? data : Object.values(data);
          this._meterProcessBillingPeriod.set(billingPeriods);
        },
        error: (err) => console.error(err),
      });
  }

  private updateBillingPeriodForm(): void {
    this.meterProcessForm
      .get('billingPeriod')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((selectedValue) => {
        const billingPeriods = this._meterProcessBillingPeriod();
        const selectedBilling = billingPeriods.find(
          (item) => item.billingPeriod === selectedValue
        );

        if (selectedBilling) {
          this.updateBillingPeriodWithDatetime(selectedBilling);
        }
      });
  }

  private callMtnList(): void {
    this.mpa
      .getMtnList()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          let mtnData: mtnList[] = [];

          if (response && response.data && Array.isArray(response.data)) {
            mtnData = response.data;
          } else if (Array.isArray(response)) {
            mtnData = response;
          } else {
            console.warn(response);
            mtnData = [];
          }

          this._mtnList.set(mtnData);
        },
        error: (error) => {
          console.error('Error loading MTN list:', error);
          this._mtnList.set([]);
        },
      });
  }

  onDatetimeChange(controlName: string, date: Date): void {
    if (date) {
      const roundedDate = this.roundToNearestFiveMinutes(date);
      this.meterProcessForm
        .get(controlName)
        ?.setValue(roundedDate, { emitEvent: false });
    }
  }

  getNextMtnRecord(search?: string): void {
    this._mtnIsLoading.set(true);
    const currentPage = this._nextPage();

    this.mpa
      .getMtnList(currentPage, search)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: mtnListPage) => {
          if (response.hasMore) {
            this._nextPage.set(currentPage + 1);
            const currentMtnList = this._mtnList();
            const updatedMtnList: mtnList[] = response
              ? [...currentMtnList, ...response.data]
              : currentMtnList;
            this._mtnList.set(updatedMtnList);
          }
        },
        error: (error) => {
          console.error('Error loading MTN list:', error.message);
        },
      })
      .add(() => this._mtnIsLoading.set(false));
  }

  searchMtnRecord(search: string): void {
    this._nextPage.set(1);
    this._search.set(search);
    this._mtnList.set([]);
    this.getNextMtnRecord(search);
  }

  onSearchClear(): void {
    this._nextPage.set(1);
    this._search.set('');
    this._mtnList.set([]);
    this.getNextMtnRecord();
  }

  // Getter methods for template compatibility
  get nextPageValue(): number {
    return this._nextPage();
  }

  get searchValue(): string {
    return this._search();
  }

  get mtnIsLoadingValue(): boolean {
    return this._mtnIsLoading();
  }

  get meterProcessBillingPeriodValue(): meterProcessBillingPeriod[] {
    return this._meterProcessBillingPeriod();
  }

  get mtnListValue(): mtnList[] {
    return this._mtnList();
  }
}