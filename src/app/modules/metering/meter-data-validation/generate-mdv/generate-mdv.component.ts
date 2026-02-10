import { Component, inject, OnInit, signal } from '@angular/core';
import { FormGroup, FormBuilder, AbstractControl } from '@angular/forms';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { MDV_LABELS, METER_PROCESS_TYPE_OPTION } from '@shared/constants';
import { LABELS } from '@shared/constants/labels.const';
import { MESSAGES } from '@shared/constants/messages.const';
import { MeterProcessTypes } from '@shared/enums';
import { GenerateMetering, meterProcessBillingPeriod } from '@shared/interfaces';
import { MeterprocessService } from '@shared/services/api';
import { format } from 'date-fns';
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

    this.processTypeOpts = METER_PROCESS_TYPE_OPTION
      .filter(opt => opt.id !== MeterProcessTypes.DAILY);
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
      billingPeriod: [null, RxwebValidators.required()],
      reportCodes: [null, [RxwebValidators.required(), RxwebValidators.minLength({ value: 1 })]]
    });

    this.options = Object.keys(MDV_LABELS).map(key => (
      { label: MDV_LABELS[key as keyof typeof MDV_LABELS], value: key}
    )) as NzCheckboxOption[];
  }

  triggerClose(): void {
    this.modalRef.destroy();
  }

  triggerOk(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();
    const selectedBp = this.billingPeriods.find(bp => bp.billingPeriod === formValue.billingPeriod);

    const payload: GenerateMetering = {
      pipelineName: 'runMDVReport',
      parameters: {
        processType: formValue.processType,
        startDate: format(new Date(selectedBp!.startDate), 'yyyy-MM-dd'),
        endDate: format(new Date(selectedBp!.endDate), 'yyyy-MM-dd')
      },
      reportCodes: this.reportCodes?.value
    };

    this.busy$ = this.mps.generateMetering(payload, 'mdv-generate')
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

  get isAllSelected(): boolean { return !!this.reportCodes?.value?.length && this.options?.length === this.reportCodes?.value?.length; }

  get reportCodes(): AbstractControl | null { return this.form?.get('reportCodes') as AbstractControl; }
}
