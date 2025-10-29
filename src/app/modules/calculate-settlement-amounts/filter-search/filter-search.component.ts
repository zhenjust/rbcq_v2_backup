import { Component, EventEmitter, inject, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Data } from '@angular/router';
import { FULL_SETTLEMENT_OPTIONS, MARKET_FEE_SETTLEMENT_OPTIONS } from '@shared/constants';
import { settlementSearchNames } from '@shared/enums';
import { meterProcessBillingPeriod, settlementJobInstanceOptions, settlementParams } from '@shared/interfaces';
import { MeterprocessService } from '@shared/services/api';
import { SearchFilterService } from '@shared/services/settlement';
import { DateFormatterUtilService, ProcessTypeUtilService } from '@shared/services/utils';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-filter-search',
  standalone: false,
  templateUrl: './filter-search.component.html',
  styleUrl: './filter-search.component.scss'
})
export class FilterSearchComponent implements OnInit, OnDestroy {

  @Output() filtersEvent = new EventEmitter<Partial<settlementParams>>();
  hasFilter: boolean = false;
  filterSettlementForm!: FormGroup;
  searchName:string = ''
  settlementOptions: settlementJobInstanceOptions[] = [];
  meterProcessBillingPeriod: meterProcessBillingPeriod[] = [];
  private destroy$ = new Subject<void>();
  protected settlementFilterParams: Partial<settlementParams> | null = null;

  private ptc = inject(ProcessTypeUtilService);
  private fb = inject(FormBuilder);
  private fdp = inject(DateFormatterUtilService);
  private mpa = inject(MeterprocessService);
  private searchFilterService = inject(SearchFilterService);
  private router = inject(ActivatedRoute);

  private setSettlementOptions(): void {
    if (this.searchName === settlementSearchNames.RESERVE_MARKET_FEE ||
        this.searchName === settlementSearchNames.ENERGY_MARKET_FEE) {
      this.settlementOptions = MARKET_FEE_SETTLEMENT_OPTIONS;
    } else {
      this.settlementOptions = FULL_SETTLEMENT_OPTIONS;
    }
  }

  ngOnInit(): void {
    this.initFilterForm();
    this.router.data.subscribe((data: Data) => {
      this.searchName = data['searchName'] as string;
    });
    this.setSettlementOptions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleFilter(): void {
    this.hasFilter = !this.hasFilter;
    this.mpa.getBillingPeriod().pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.meterProcessBillingPeriod = Array.isArray(data) ? data : Object.values(data); // Adjusted for object-of-objects
        this.tryAutoSetBillingPeriod();
      },
      error: (err) => console.error(err)
    });

    this.filterSettlementForm.get('billingPeriod')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((selectedValue) => {
        const selectedBilling = this.meterProcessBillingPeriod.find(
          (item) => item.billingPeriod === selectedValue
        );

        if (selectedBilling) {
          this.filterSettlementForm.patchValue({
            startDate: new Date(selectedBilling.startDate),
            endDate: new Date(selectedBilling.endDate)
          });
        }
    });
  }

  private initFilterForm(): void {
    this.filterSettlementForm = this.fb.group({
      processType: [null],
      billingPeriod: [{ value: '', disabled: true }],
      startDate: [{ value: '', disabled: true }],
      endDate: [{ value: '', disabled: true }],
      tradingStartDate: [{value: '', disabled: true}],
      tradingEndDate: [{value: '', disabled: true}]
    });

    this.filterSettlementForm.get('processType')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        this.ptc.handleSettlementProcessTypeChange(value, this.filterSettlementForm);
      });

    this.filterSettlementForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        this.settlementFilterParams = {
          ...this.settlementFilterParams,
          ...value
        };
    });
  }

  private tryAutoSetBillingPeriod(): void {
    if (this.meterProcessBillingPeriod.length > 0) {
      const selected = this.meterProcessBillingPeriod[0];

      this.filterSettlementForm.patchValue({
        billingPeriod: selected.billingPeriod,
        startDate: new Date(selected.startDate),
        endDate: new Date(selected.endDate)
      });
    }
  }

  resetFilter(): void {
    this.filterSettlementForm.reset();
    this.hasFilter = false;
    this.settlementFilterParams = null;

    this.filtersEvent.emit();
  }

  applyFilter(): void {
    if (this.filterSettlementForm.valid) {
      const rawValues: settlementParams = this.filterSettlementForm.getRawValue();

      const formattedValues: Partial<settlementParams> = {
        ...rawValues,
        startDate: rawValues.startDate ? this.fdp.transformDate(rawValues.startDate) : undefined,
        endDate: rawValues.endDate ? this.fdp.transformDate(rawValues.endDate) : undefined,
        tradingStartDate: rawValues.tradingStartDate ? this.fdp.transformDate(rawValues.tradingStartDate) : undefined,
        tradingEndDate: rawValues.tradingEndDate ? this.fdp.transformDate(rawValues.tradingEndDate) : undefined
      };
      // this.searchFilterService.fetchJobs(formattedValues, this.searchName);
      this.settlementFilterParams = null;

      this.filtersEvent.emit(formattedValues);
    }
  }
}
