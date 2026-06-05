import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, FormBuilder, AbstractControl } from '@angular/forms';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { LABELS } from '@shared/constants/labels.const';
import { MESSAGES } from '@shared/constants/messages.const';
import { meterProcessBillingPeriod, PublishedBillingPeriods } from '@shared/interfaces';
import { MeterprocessService, SettlementService } from '@shared/services/api';
import { format } from 'date-fns';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { NzSelectOptionInterface } from 'ng-zorro-antd/select';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subscription, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-penalty-generate-iws',
  standalone: false,
  templateUrl: './penalty-generate-iws.component.html'
})
export class PenaltyGenerateIwsComponent implements OnInit {

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
  private readonly modalData = inject(NZ_MODAL_DATA);

  billingPeriods: meterProcessBillingPeriod[];
  billingPeriodOpts: NzSelectOptionInterface[] = [];
  selectedBp: meterProcessBillingPeriod | undefined | null;

  showError = signal<boolean>(false);

  constructor() { }

  ngOnInit(): void {
    this.buildForm();
    this.getReferences();
  }

  buildForm(): void {
    this.form = this.formBuilder.group({
      billingPeriod: [null, RxwebValidators.required()]
    });

    this.onBillingPeriodChange();
  }

  onBillingPeriodChange(): void {
    this.billingPeriod?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef$), distinctUntilChanged())
      .subscribe(res => {
        this.selectedBp = res ? this.billingPeriods.find(bp => bp.supplyMonth === res) : null;
      });
  }

  triggerClose(): void {
    this.modalRef.destroy();
  }

  triggerOk(): void {
    this.form.updateValueAndValidity();

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.showError.set(true);
      return;
    }

    this.showError.set(false);

    const payload = {
      pipelineName: `penalty-generateInputWorkspace${this.modalData?.isRefund ? 'Refund' : ''}`,
      isGroup: true,
      parameters: {
        billingStartDate: format(new Date(this.selectedBp!.startDate), 'yyyy-MM-dd'),
        billingEndDate: format(new Date(this.selectedBp!.endDate), 'yyyy-MM-dd'),
        billingPeriodName: this.selectedBp?.supplyMonth
      }
    };

    this.busy$ = this.settlementService.etaJobs(payload as any)
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe(() => {
        this.toaster.success(MESSAGES.SUCCESS_JOB_TRIGGER);
        this.modalRef.destroy(true);
      });
  }

  getReferences(): void {
    const api$: Observable<meterProcessBillingPeriod[] | PublishedBillingPeriods[]> = this.isRefund ? this.settlementService.getPenaltyBillingPeriods() : this.mps.getBillingPeriod();

    api$
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe({
        next: (options) => {
          this.billingPeriods = options as meterProcessBillingPeriod[];

          if (this.isRefund) {
            this.billingPeriods = this.billingPeriods.map(bp => ({
              supplyMonth: bp.name,
              startDate: bp.startDate,
              endDate: bp.endDate,
            })) as Partial<meterProcessBillingPeriod>[] as meterProcessBillingPeriod[];
          }

          this.billingPeriodOpts = (this.billingPeriods as meterProcessBillingPeriod[])
            .map(bp => ({ label: bp.supplyMonth, value: bp.supplyMonth }));
        }
      });
  }

  get billingPeriod(): AbstractControl | null { return this.form?.get('billingPeriod'); }
  get isRefund(): boolean { return this.modalData?.isRefund; }

}
