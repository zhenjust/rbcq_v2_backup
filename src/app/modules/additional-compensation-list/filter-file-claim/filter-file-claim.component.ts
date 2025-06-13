import {
  Component,
  inject,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Data } from '@angular/router';
import { PRICING_CONDITIONS } from '@shared/constants';
import { settlementSearchNames } from '@shared/enums';
import { meterProcessBillingPeriod, settlementJobInstanceOptions } from '@shared/interfaces';
import { MeterprocessService } from '@shared/services/api';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Subject, Subscription, takeUntil } from 'rxjs';

@Component({
  selector: 'app-filter-file-claim',
  standalone: false,
  templateUrl: './filter-file-claim.component.html',
  styleUrl: './filter-file-claim.component.scss'
})
export class FilterFileClaimComponent implements OnInit, OnDestroy {
  searchName: string = '';
  protected fileClaimForm!: FormGroup;
  billingPeriodDateRange: { startDate: Date; endDate: Date }[] = [];
  meterProcessBillingPeriod: meterProcessBillingPeriod[] = [];
  selectedBillingPeriod: meterProcessBillingPeriod[] | null = null;
  @ViewChild('fileClaim', { static: true }) fileClaim!: TemplateRef<void>;

  protected pricingConditions: settlementJobInstanceOptions[] = PRICING_CONDITIONS;

  selectedBillingPeriodId: number | null = null;

  private destroy$ = new Subject<void>();
  private billingPeriodSub!: Subscription;

  private mpa = inject(MeterprocessService);
  private fb = inject(FormBuilder);

  constructor(public modal: NzModalService, private router: ActivatedRoute) {}

  get isFileClaimPage(): boolean {
    return this.searchName === settlementSearchNames.MANAGE_ADD_COM_CLAIMS;
  }

  private getBillingperiod(): void {
    this.mpa
      .getBillingPeriod()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.meterProcessBillingPeriod = Array.isArray(data)
            ? data
            : Object.values(data);
        },
        error: (err) => console.error(err),
      });
  }

  ngOnInit(): void {
    this.router.data.subscribe((data: Data) => {
      this.searchName = data['searchName'] as string;
    });
    this.initializeBillingPeriodChangeHandler();
    this.isFileClaimPage;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.billingPeriodSub) this.billingPeriodSub.unsubscribe();
  }

  private initializeBillingPeriodChangeHandler(): void {
    this.billingPeriodSub = this.fb.control(null).valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        const billingId = this.fileClaimForm.get('billingPeriod')?.value;
        const selected = this.meterProcessBillingPeriod.find(
          (period) => period.id === billingId
        );
        if (selected) {
          this.selectedBillingPeriodId = selected.id;
          this.selectedBillingPeriod = [selected];
          this.fileClaimForm.patchValue({
            startDate: new Date(selected.startDate),
            endDate: new Date(selected.endDate),
          });
        }
      });
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
    });
  }

  private initializeFileClaimForm(): void {
    this.fileClaimForm = this.fb.group({
      billingPeriod: [null],
      startDate: [{ value: null, disabled: true }],
      endDate: [{ value: null, disabled: true }],
    });

    this.billingPeriodSub = this.fileClaimForm.get('billingPeriod')!.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((billingId) => {
        const selected = this.meterProcessBillingPeriod.find(
          (period) => period.id === billingId
        );
        if (selected) {
          this.selectedBillingPeriod = [selected];
          this.fileClaimForm.patchValue({
            startDate: new Date(selected.startDate),
            endDate: new Date(selected.endDate),
          });
        }
      });
  }


  addDateRange(): void {
    const startDate = this.fileClaimForm.get('startDate')?.value;
    const endDate = this.fileClaimForm.get('endDate')?.value;
    console.log(startDate, endDate)
    if (startDate && endDate) {
      this.billingPeriodDateRange.push({
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });
    }
  }

  deleteDateRange(index: number): void {
    this.billingPeriodDateRange.splice(index, 1);
  }

  addClaimant(): void {

  }

  get hasBillingPeriod(): boolean {
    return (
      this.selectedBillingPeriod !== null &&
      this.fileClaimForm.get('startDate')?.value !== null &&
      this.fileClaimForm.get('endDate')?.value !== null
    );
  }
}
