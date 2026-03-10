import { Component, EventEmitter, inject, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Data } from '@angular/router';
import { FULL_SETTLEMENT_OPTIONS, MARKET_FEE_SETTLEMENT_OPTIONS } from '@shared/constants';
import { LABELS } from '@shared/constants/labels.const';
import { settlementProcessTypes, settlementSearchNames } from '@shared/enums';
import { meterProcessBillingPeriod, settlementJobInstanceOptions, settlementParams } from '@shared/interfaces';
import { MeterprocessService } from '@shared/services/api';
import { DateFormatterUtilService } from '@shared/services/utils';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-filter-search',
  standalone: false,
  templateUrl: './filter-search.component.html',
  styleUrl: './filter-search.component.scss'
})
export class FilterSearchComponent implements OnInit, OnDestroy {

  @Output() filtersEvent = new EventEmitter<Partial<settlementParams>>();

  private readonly destroy$ = new Subject<void>();
  private readonly fb = inject(FormBuilder);
  private readonly fdp = inject(DateFormatterUtilService);
  private readonly mpa = inject(MeterprocessService);
  private readonly router = inject(ActivatedRoute);

  LABELS = LABELS;

  hasFilter: boolean = false;
  filterSettlementForm!: FormGroup;
  searchName: string;
  settlementOptions: settlementJobInstanceOptions[] = [];
  meterProcessBillingPeriod: meterProcessBillingPeriod[] = [];

  private setSettlementOptions(): void {
    const noDailyFilter = [
      settlementSearchNames.RESERVE_MARKET_FEE,
      settlementSearchNames.ENERGY_MARKET_FEE,
      settlementSearchNames.RESERVE_TRADING_AMOUNTS
    ];

    if (noDailyFilter.includes(this.searchName as settlementSearchNames)) {
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

  toggleFilter(): void {
    this.hasFilter = !this.hasFilter;
    this.getBillingPeriods();
  }

  getBillingPeriods(): void {
    this.mpa.getBillingPeriod().pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.meterProcessBillingPeriod = Array.isArray(data) ? data : Object.values(data);
      },
    });
  }

  private initFilterForm(): void {
    this.filterSettlementForm = this.fb.group({
      processType: [null],
      billingPeriod: [null],
      date: [null]
    });
  }

  resetFilter(): void {
    this.filterSettlementForm.reset();
    this.hasFilter = false;
    this.filtersEvent.emit();
  }

  applyFilter(): void {
    if (this.filterSettlementForm.valid) {
      const { processType, billingPeriod, date }: settlementParams = this.filterSettlementForm.getRawValue();

      const formattedValues: Partial<settlementParams> = {
        processType,
        billingPeriod: this.notDaily ? billingPeriod : undefined,
        tradingStartDate: this.isDaily && date?.length ? this.fdp.transformDate(date[0]) : undefined,
        tradingEndDate: this.isDaily && date?.length ? this.fdp.transformDate(date[1]) : undefined,
      };

      this.filtersEvent.emit(formattedValues);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get billingPeriod(): AbstractControl | null { return this.filterSettlementForm?.get('billingPeriod'); }
  get processType(): AbstractControl | null { return this.filterSettlementForm?.get('processType'); }

  get isDaily(): boolean { return this.processType?.value && this.processType?.value === settlementProcessTypes.DAILY; }
  get notDaily(): boolean { return this.processType?.value && this.processType?.value !== settlementProcessTypes.DAILY; }


}
