import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, FormBuilder, AbstractControl, FormArray } from '@angular/forms';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { LABELS } from '@shared/constants/labels.const';
import { MESSAGES } from '@shared/constants/messages.const';
import { meterProcessBillingPeriod } from '@shared/interfaces';
import { AdminService, MeterprocessService, SettlementService } from '@shared/services/api';
import { format, isSameDay, isWithinInterval, set } from 'date-fns';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzSelectOptionInterface } from 'ng-zorro-antd/select';
import { ToastrService } from 'ngx-toastr';
import { distinctUntilChanged, Subscription } from 'rxjs';

@Component({
  selector: 'app-file-a-claim',
  standalone: false,
  templateUrl: './file-a-claim.component.html'
})
export class FileAClaimComponent implements OnInit {

  busy$: Subscription;
  LABELS = LABELS;
  form: FormGroup;
  MESSAGE = MESSAGES;
  checked = signal<boolean>(false);
  billingIdOpts: NzSelectOptionInterface[] = [];

  readonly formBuilder = inject(FormBuilder);
  readonly mps = inject(MeterprocessService);
  readonly modalRef = inject(NzModalRef);
  private readonly destroyRef$ = inject(DestroyRef);
  private readonly adminService = inject(AdminService);
  private readonly settlementService = inject(SettlementService);
  private readonly toaster = inject(ToastrService);

  billingPeriods: meterProcessBillingPeriod[];
  billingPeriodOpts: NzSelectOptionInterface[] = [];
  selectedBp: meterProcessBillingPeriod | undefined | null;
  pricingConditionOpts: NzSelectOptionInterface[] = [];
  billingIdOptions: NzSelectOptionInterface[] = [];
  mtnOptions: Record<string, NzSelectOptionInterface[]> = {};

  CLAIM_MSG = MESSAGES.MIN_REQUIRED_LENGTH(1, 'claim');
  startOfSelectedDate: Date;

  constructor() { }

  ngOnInit(): void {
    this.buildForm();
    this.getReferences();
  }

  buildForm(): void {
    this.form = this.formBuilder.group({
      billingPeriod: [null, RxwebValidators.required()],
      pricingCondition: [{value: null, disabled: true}, RxwebValidators.required()],
      startEndDateRanges: this.formBuilder.array([]),
      claims: this.formBuilder.array([], RxwebValidators.minLength({ value: 1 })),
    });

    this.onBillingPeriodChange();
    this.onPricingConditionChange();
  }

  onBillingPeriodChange(): void {
    this.billingPeriod?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef$), distinctUntilChanged())
      .subscribe(res => {
        if (res) {
          this.pricingCondition?.enable();
          this.selectedBp = res ? this.billingPeriods.find(bp => bp.billingPeriod === res) : null;
          this.startOfSelectedDate = new Date(this.selectedBp!.startDate!);
        } else {
          this.form.reset();
          this.dateRanges?.clear();
          this.claims?.clear();
          this.selectedBp = null;
          this.pricingCondition?.disable();
        }
      });
  }

  onPricingConditionChange(): void {
    this.pricingCondition?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef$), distinctUntilChanged())
      .subscribe(res => {
        if (res) {
          this.claims?.clear();
          const filters = {
            acPc: res,
            startDate: format(new Date(this.selectedBp!.startDate), 'yyyy-MM-dd') ,
            endDate: format(new Date(this.selectedBp!.endDate), 'yyyy-MM-dd') ,
            search: null
          };

          this.busy$ = this.settlementService.getBillingIdViaPricingCond(filters)
            .pipe(takeUntilDestroyed(this.destroyRef$))
            .subscribe(billingIds => {
              this.billingIdOptions = billingIds.map((opt: string) => ({ label: opt, value: opt, disabled: false }));
            });
        } else {
          this.billingIdOpts = [];
          this.claims?.clear();
        }
      });
  }

  addDateRange(): void {
    const formGroup = this.formBuilder.group({
      startDate: [null, RxwebValidators.required()],
      endDate: [null, [RxwebValidators.required(), RxwebValidators.minDate({ fieldName: 'startDate' })]]
    });

    this.dateRanges?.push(formGroup);
    this.dateRanges?.updateValueAndValidity();
  }

  removeDateRange(i: number): void {
    this.dateRanges?.removeAt(i);
    this.dateRanges?.updateValueAndValidity();
  }

  addClaims(): void {
    const formGroup = this.formBuilder.group({
      billingId: [null, RxwebValidators.required()],
      mtn: [null, RxwebValidators.required()],
      approveRate: [null, RxwebValidators.required()],
    });

    this.claims?.push(formGroup);
    this.pricingCondition?.disable();

    const mtn = formGroup.get('mtn');
    const approveRate = formGroup.get('approveRate');

    formGroup.get('billingId')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef$), distinctUntilChanged())
      .subscribe(billingId => {
          if (billingId) {
            mtn?.reset();
            approveRate?.reset();

            if (billingId) {
              const filters = {
                acPc: this.pricingCondition?.value,
                startDate: format(new Date(this.selectedBp!.startDate), 'yyyy-MM-dd') ,
                endDate: format(new Date(this.selectedBp!.endDate), 'yyyy-MM-dd'),
                billingId
              };

              this.busy$ = this.settlementService.getMtnsByBillingId(filters)
                .pipe(takeUntilDestroyed(this.destroyRef$))
                .subscribe(mtn => {
                  this.mtnOptions[billingId] = mtn.map((m: string) => ({ label: m, value: m, disabled: this.selectedMtns?.includes(m) }));
                });
            }
          } else {
            mtn?.reset();
            approveRate?.reset();
          }
        });
  }

  get selectedMtns(): string[] { return this.claims?.value?.map((c: any) => c.mtn); }

  removeClaim(i: number): void {
    this.claims?.removeAt(i);

    if (!this.claims?.length) {
      this.pricingCondition?.enable();
    }
  }

  triggerClose(): void {
    this.modalRef.destroy();
  }

  triggerOk(): void {
    this.form.updateValueAndValidity();

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();
    const selectedBp = this.billingPeriods.find(bp => bp.billingPeriod === formValue.billingPeriod);

    const payload = {
      pipelineName: 'additionalCompensation-calculateAdditionalCompensation',
      isGroup: true,
      parameters: {
        pricingCondition: formValue.pricingCondition,
        billingPeriodName: selectedBp!.supplyMonth,
        billingStartDate: format(new Date(selectedBp!.startDate), 'yyyy-MM-dd'),
        billingEndDate: format(new Date(selectedBp!.endDate), 'yyyy-MM-dd')
      },
      startEndDateRanges: this.dateRanges?.value.map((d: any) => ({
        startDate: format(set(new Date(d.startDate), { seconds: 0}), 'yyyy-MM-dd HH:mm:ss'),
        endDate: format(set(new Date(d.endDate), { seconds: 0}), 'yyyy-MM-dd HH:mm:ss'),
      })),
      claims: this.claims?.value
    };

    this.busy$ = this.settlementService.etaJobs(payload as any)
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe(() => {
        this.toaster.success(MESSAGES.SUCCESS_FILE_ITEM('claim'));
        this.modalRef.destroy(true);
      });
  }

  getReferences(): void {
    this.mps.getBillingPeriod()
      .subscribe({
        next: options => {
          this.billingPeriods = options as meterProcessBillingPeriod[];
          this.billingPeriodOpts = (options as meterProcessBillingPeriod[])
            .map(bp => ({ label: bp.supplyMonth, value: bp.billingPeriod }));
        }
      });

    this.adminService.getRefByType('AC_PRICING_CONDITION')
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe(res => this.pricingConditionOpts = res.map(({ label }) => ({ label, value: label })));
  }

  disableRange = (curr: Date) => {
    const filtered = this.dateRanges?.value?.filter((d: {startDate: Date[] | null, endDate: Date[] | null}) => d.startDate && d.endDate) || [];
    const isWithinBp = isWithinInterval(curr, {start: new Date(this.selectedBp?.startDate!), end: new Date(this.selectedBp?.endDate!)}); // eslint-disable-line
    const selectedDates = filtered?.some((d: any) => isSameDay(d.startDate, curr) || isSameDay(d.endDate, curr) || isWithinInterval(curr, { start: new Date(d.startDate), end: new Date(d.endDate) }));
    return !isWithinBp || selectedDates;
  }

  get dateRanges(): FormArray | null { return this.form.get('startEndDateRanges') as FormArray; }
  get claims(): FormArray | null { return this.form.get('claims') as FormArray; }
  get pricingCondition(): AbstractControl | null { return this.form.get('pricingCondition'); }
  get billingPeriod(): AbstractControl | null { return this.form?.get('billingPeriod'); }

}
