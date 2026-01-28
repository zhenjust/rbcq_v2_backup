import { Component, computed, inject, OnDestroy, OnInit, signal, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Data } from '@angular/router';
import { PRICING_CONDITIONS } from '@shared/constants';
import { settlementSearchNames } from '@shared/enums';
import { addtlCompensationRunDtos, meterProcessBillingPeriod, settlementJobInstanceOptions } from '@shared/interfaces';
import { MeterprocessService, SettlementService } from '@shared/services/api';
import { DateFormatterUtilService } from '@shared/services/utils';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-filter-file-claim',
  standalone: false,
  templateUrl: './filter-file-claim.component.html',
  styleUrl: './filter-file-claim.component.scss'
})
export class FilterFileClaimComponent implements OnInit, OnDestroy {
  searchName: string = '';

  // Signals
  meterProcessBillingPeriod = signal<meterProcessBillingPeriod[]>([]);
  billingIdList = signal<[]>([]);
  billingPeriodDateRange = signal<{ startDate: string; endDate: string }[]>([]);
  selectedBillingPeriod = signal<meterProcessBillingPeriod | null>(null);

  @ViewChild('fileClaim', { static: true }) fileClaim!: TemplateRef<void>;

  protected fileClaimForm!: FormGroup;

  //Private Signal
  private readonly _addtnlCompList = signal<addtlCompensationRunDtos | null>(null);

  public pricingConditions: settlementJobInstanceOptions[] = PRICING_CONDITIONS;

  private destroy$ = new Subject<void>();
  private mpa = inject(MeterprocessService);
  private sta = inject(SettlementService);
  private fb = inject(FormBuilder);
  private dfs = inject(DateFormatterUtilService);
  private modal = inject(NzModalService);
  private router = inject(ActivatedRoute);

  // Computed signals
  isFileClaimPage = computed(() => this.searchName === settlementSearchNames.MANAGE_ADD_COM_CLAIMS);

  hasBillingPeriod = computed(() => {
    return this.selectedBillingPeriod() !== null &&
           this.fileClaimForm?.get('startDate')?.value !== null &&
           this.fileClaimForm?.get('endDate')?.value !== null;
  });

  hasClaimant = computed(() => {
    return this.fileClaimForm?.get('pricingCondition')?.value !== null;
  });

  private getBillingperiod(): void {
    this.mpa
      .getBillingPeriod()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          const billingPeriods: meterProcessBillingPeriod[] = Array.isArray(data) ? data : Object.values(data);
          this.meterProcessBillingPeriod.set(billingPeriods);
        },
        error: (err) => console.error(err),
      });
  }

  ngOnInit(): void {
    this.router.data.subscribe((data: Data) => {
      this.searchName = data['searchName'] as string;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fileClaimModal(): void {
    this.getBillingperiod();
    this.initializeFileClaimForm();
    this.modal.create({
      nzWidth: 800,
      nzTitle: 'File a Claim',
      nzContent: this.fileClaim,
      nzOkText: 'Run Job',
      nzCancelText: 'Cancel',
      nzOnOk: () => this.runAddntlCompJob(),
    });
  }

  private runAddntlCompJob():void {
    //call api from this method
    this.sta.addtnlCompensationClaim(this._addtnlCompList).subscribe({
      next: () => {

      },
      error: (error) => {
        console.warn(error.message);
      }
    }).add(() => this.initializeFileClaimForm());
  }

  private initializeFileClaimForm(): void {
    this.fileClaimForm = this.fb.group({
      billingPeriod: [null],
      startDate: [{ value: null, disabled: true }],
      endDate: [{ value: null, disabled: true }],
      pricingCondition: [null]
    });

    // Listen for billing period changes
    this.fileClaimForm.get('billingPeriod')?.valueChanges.subscribe(billingPeriodId => {
      this.onBillingPeriodChange(billingPeriodId);
    });
  }

  private onBillingPeriodChange(billingPeriodId: number): void {
    if (billingPeriodId) {
      const selectedPeriod = this.meterProcessBillingPeriod().find(bp => bp.id === billingPeriodId);
      if (selectedPeriod) {
        this.selectedBillingPeriod.set(selectedPeriod);
        this.fileClaimForm.patchValue({
          startDate: selectedPeriod.startDate,
          endDate: selectedPeriod.endDate
        });
      }
    } else {
      this.selectedBillingPeriod.set(null);
      this.fileClaimForm.patchValue({
        startDate: null,
        endDate: null
      });
    }
  }

  addDateRange(): void {
    const startDate = this.fileClaimForm.get('startDate')?.value;
    const endDate = this.fileClaimForm.get('endDate')?.value;

    if (startDate && endDate) {
      const currentRanges = this.billingPeriodDateRange();
      this.billingPeriodDateRange.set([
        ...currentRanges,
        {
          startDate: startDate,
          endDate: endDate,
        }
      ]);
    }
  }

  deleteDateRange(index: number): void {
    const currentRanges = this.billingPeriodDateRange();
    const updatedRanges = [...currentRanges];
    updatedRanges.splice(index, 1);
    this.billingPeriodDateRange.set(updatedRanges);
  }

  addClaimant(): void {
    const acPc = this.fileClaimForm.get('pricingCondition')?.value;
    const startDate = this.fileClaimForm.get('startDate')?.value;
    const endDate = this.fileClaimForm.get('endDate')?.value;

    this.sta.getBillingId(acPc, this.dfs.formatDateOnly(startDate), this.dfs.formatDateOnly(endDate)).subscribe({
      next: (data: []) => {
        this.billingIdList.set(data);
        console.log(this.billingIdList());
      },
      error: (error) => {
        console.error(error.message)
      }
    })
  }

  updateDateRange(index: number, field: 'startDate' | 'endDate', value: string): void {
    const currentRanges = this.billingPeriodDateRange();
    const updatedRanges = [...currentRanges];
    updatedRanges[index][field] = value;
    this.billingPeriodDateRange.set(updatedRanges);
  }
}
