import { Component, inject, OnInit, signal } from '@angular/core';
import { FormGroup, FormBuilder, AbstractControl } from '@angular/forms';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { MDV_LABELS, METER_PROCESS_TYPE_OPTION } from '@shared/constants';
import { LABELS } from '@shared/constants/labels.const';
import { MESSAGES } from '@shared/constants/messages.const';
import { MeterProcessTypes } from '@shared/enums';
import { GenerateMetering, meterProcessBillingPeriod } from '@shared/interfaces';
import { MeterprocessService } from '@shared/services/api';
import { format, isAfter } from 'date-fns';
import { NzCheckboxOption } from 'ng-zorro-antd/checkbox';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzSelectOptionInterface } from 'ng-zorro-antd/select';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-generate-mdv',
  standalone: false,
  templateUrl: './generate-mdv.component.html'
})
export class GenerateMdvComponent implements OnInit {

  busy$: Subscription;
  LABELS = LABELS;
  form: FormGroup;
  MESSAGE = MESSAGES;
  checked = signal<boolean>(false);

  readonly formBuilder = inject(FormBuilder);
  readonly mps = inject(MeterprocessService);
  readonly modalRef = inject(NzModalRef);

  billingPeriods: meterProcessBillingPeriod[];
  billingPeriodOpts: NzSelectOptionInterface[] = [];
  processTypeOpts: NzSelectOptionInterface[] = [];
  options: NzCheckboxOption[] = [];

  constructor() {
  }

  ngOnInit(): void {
    this.buildForm();
    this.getBillingPeriods();

    this.processTypeOpts = METER_PROCESS_TYPE_OPTION;
  }

  onCheckedChange(): void {
    if (this.checked()) {
      const codes = this.options.map(d => d.value);
      this.reportCodes?.setValue(codes);
    } else {
      this.reportCodes?.setValue([]);
    }
  }

  buildForm(): void {
    this.form = this.formBuilder.group({
      processType: [null, RxwebValidators.required()],
      billingPeriod: [null],
      tradingDate: [null],
      reportCodes: [null, [RxwebValidators.required(), RxwebValidators.minLength({ value: 1 })]]
    });

    this.processType?.valueChanges
      .subscribe(() => {
        if (this.isDaily) {
          this.billingPeriod?.clearValidators();
          this.tradingDate?.addValidators([ RxwebValidators.required() ]);
          this.tradingDate?.updateValueAndValidity();
        } else {
          this.tradingDate?.clearValidators();
          this.billingPeriod?.addValidators([ RxwebValidators.required() ]);
          this.billingPeriod?.updateValueAndValidity();
        }
      });

    this.options = Object.keys(MDV_LABELS).map(key => (
      { label: MDV_LABELS[key as keyof typeof MDV_LABELS], value: key}
    )) as NzCheckboxOption[];
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
    const startDate = this.isDaily ? formValue?.tradingDate : selectedBp!.startDate
    const endDate = this.isDaily ? formValue?.tradingDate : selectedBp!.endDate;

    const payload: GenerateMetering = {
      pipelineName: 'runMDVReport',
      parameters: {
        processType: formValue.processType,
        startDate: format(new Date(startDate), 'yyyy-MM-dd'),
        endDate: format(new Date(endDate), 'yyyy-MM-dd')
      },
      reportCodes: this.reportCodes?.value
    };

    this.busy$ = this.mps.generateMeteringList(payload, 'mdv-generate')
      .subscribe(() => this.modalRef.destroy(true));
  }

  getBillingPeriods(): void {
    this.mps.getBillingPeriod()
      .subscribe({
        next: options => {
          this.billingPeriods = options as meterProcessBillingPeriod[];
          this.billingPeriodOpts = (options as meterProcessBillingPeriod[])
            .map(bp => ({ label: bp.supplyMonth, value: bp.billingPeriod }));
        }
      })
  }

  nzDisabledDate = (current: Date) => {
    return isAfter(current, new Date());
  };

  get isAllSelected(): boolean { return !!this.reportCodes?.value?.length && this.options?.length === this.reportCodes?.value?.length; }
  get processType(): AbstractControl | null { return this.form?.get('processType'); }
  get tradingDate(): AbstractControl | null { return this.form?.get('tradingDate'); }
  get billingPeriod(): AbstractControl | null { return this.form?.get('billingPeriod'); }

  get isDaily(): boolean { return this.processType?.value === MeterProcessTypes.DAILY; }

  get reportCodes(): AbstractControl | null { return this.form?.get('reportCodes') as AbstractControl; }
}
