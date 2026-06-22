import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { METER_PROCESS_TYPE_OPTION } from '@shared/constants';
import { LABELS } from '@shared/constants/labels.const';
import { MESSAGES } from '@shared/constants/messages.const';
import { MeterProcessTypes } from '@shared/enums';
import { GenerateMetering, meterProcessBillingPeriod } from '@shared/interfaces';
import { MeterprocessService } from '@shared/services/api';
import { format } from 'date-fns';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzSelectOptionInterface } from 'ng-zorro-antd/select';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-generate-mmf',
  standalone: false,
  templateUrl: './generate-mmf.component.html'
})
export class GenerateMmfComponent implements OnInit {

  busy$: Subscription;
  LABELS = LABELS;
  form: FormGroup;
  MESSAGE = MESSAGES;

  readonly formBuilder = inject(FormBuilder);
  readonly mps = inject(MeterprocessService);
  readonly modalRef = inject(NzModalRef);
  readonly toastr = inject(ToastrService);

  billingPeriods: meterProcessBillingPeriod[];
  billingPeriodOpts: NzSelectOptionInterface[] = [];
  processTypeOpts: NzSelectOptionInterface[] = [];
  showError: boolean;

  constructor() { }

  ngOnInit(): void {
    this.buildForm();
    this.getBillingPeriods();

    this.processTypeOpts = METER_PROCESS_TYPE_OPTION
      .filter(opt => opt.id !== MeterProcessTypes.DAILY);
  }

  buildForm(): void {
    this.form = this.formBuilder.group({
      processType: [null, RxwebValidators.required()],
      billingPeriod: [null, RxwebValidators.required()]
    });
  }

  triggerClose(): void {
    this.modalRef.destroy();
  }

  triggerOk(): void {
    if (this.form.invalid) {
      this.showError = true;
      this.form.markAllAsTouched();
      return;
    }

    this.showError = false;

    const formValue = this.form.getRawValue();
    const selectedBp = this.billingPeriods.find(bp => bp.billingPeriod === formValue.billingPeriod);

    const payload: GenerateMetering = {
      pipelineName: 'runMMFReport',
      parameters: {
        processType: formValue.processType,
        startDate: format(new Date(selectedBp!.startDate), 'yyyy-MM-dd'),
        endDate: format(new Date(selectedBp!.endDate), 'yyyy-MM-dd')
      }
    };

    this.busy$ = this.mps.generateMeteringList(payload, 'mmf-generate')
      .subscribe({
        next: () => this.modalRef.destroy(true),
        error: (error) => {
          if (error.status === 422) {
            this.toastr.error(MESSAGES.MMF_DUPLICATE);
          }
        }
      });
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


}
