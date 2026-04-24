import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, FormBuilder, AbstractControl } from '@angular/forms';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { LABELS } from '@shared/constants/labels.const';
import { MESSAGES } from '@shared/constants/messages.const';
import { MeterProcessTypes } from '@shared/enums';
import { meterProcessBillingPeriod } from '@shared/interfaces';
import { MeterprocessService, SettlementService } from '@shared/services/api';
import { format } from 'date-fns';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzSelectOptionInterface } from 'ng-zorro-antd/select';
import { ToastrService } from 'ngx-toastr';
import { Subscription, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-run-market-fee',
  standalone: false,
  templateUrl: './run-market-fee.component.html'
})
export class RunMarketFeeComponent implements OnInit {

  busy$: Subscription;
  LABELS = LABELS;
  form: FormGroup;
  MESSAGE = MESSAGES;

  readonly formBuilder = inject(FormBuilder);
  readonly mps = inject(MeterprocessService);
  readonly modalRef = inject(NzModalRef);
  private readonly destroyRef$ = inject(DestroyRef);
  private readonly settlementService = inject(SettlementService);
  private readonly toaster = inject(ToastrService);

  billingPeriods: meterProcessBillingPeriod[];
  billingPeriodOpts: NzSelectOptionInterface[] = [];
  selectedBp: meterProcessBillingPeriod | undefined | null;
  processTypeOptions: NzSelectOptionInterface[] = [];

  constructor() { }

  ngOnInit(): void {
    this.buildForm();
    this.getReferences();
  }

  buildForm(): void {
    this.form = this.formBuilder.group({
      billingPeriod: [null, RxwebValidators.required()],
      processType: [null, RxwebValidators.required()]
    });

    this.onBillingPeriodChange();
  }

  onBillingPeriodChange(): void {
    this.billingPeriod?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef$), distinctUntilChanged())
      .subscribe(res => {
        this.selectedBp = res ? this.billingPeriods.find(bp => bp.billingPeriod === res) : null;
      });
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

    const payload = {
      pipelineName: 'energyMarketFee',
      isGroup: true,
      parameters: {
        processType: this.form.getRawValue()?.processType,
        billingStartDate: format(new Date(this.selectedBp!.startDate), 'yyyy-MM-dd'),
        billingEndDate: format(new Date(this.selectedBp!.endDate), 'yyyy-MM-dd'),
        billingPeriodName: this.selectedBp?.supplyMonth
      }
    };

    this.busy$ = this.settlementService.etaJobs(payload as any, true)
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe(() => {
        this.toaster.success(MESSAGES.SUCCESS_JOB_TRIGGER);
        this.modalRef.destroy(true);
      });
  }

  getReferences(): void {
    this.processTypeOptions = Object.keys(MeterProcessTypes)
      .filter(key => key !== MeterProcessTypes.DAILY)
      .map(opt => ({ label: LABELS[opt as keyof typeof LABELS], value: opt }));

    this.mps.getBillingPeriod()
      .subscribe({
        next: options => {
          this.billingPeriods = options as meterProcessBillingPeriod[];
          this.billingPeriodOpts = (options as meterProcessBillingPeriod[])
            .map(bp => ({ label: bp.supplyMonth, value: bp.billingPeriod }));
        }
      });
  }

  get billingPeriod(): AbstractControl | null { return this.form?.get('billingPeriod'); }

}
