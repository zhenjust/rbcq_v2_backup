import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { STATUS_OPTIONS } from '@shared/constants';
import { FUEL_TYPE } from '@shared/constants/fuel-type.const';
import { LABELS } from '@shared/constants/labels.const';
import { MESSAGES } from '@shared/constants/messages.const';
import { SecParamsService } from '@shared/services/api';
import { format } from 'date-fns';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzSelectOptionInterface } from 'ng-zorro-antd/select';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-create-sec-param',
  standalone: false,
  templateUrl: './create-sec-param.component.html'
})
export class CreateSecParamComponent implements OnInit {

  private formBuilder = inject(FormBuilder);
  private secService = inject(SecParamsService);
  private modalRef = inject(NzModalRef);

  paramForm: FormGroup;
  busy$: Subscription;
  MESSAGE = MESSAGES;
  LABELS = LABELS;
  fuelTypeOptions: NzSelectOptionInterface[] = [];
  statusOptions: NzSelectOptionInterface[] = [];

  ngOnInit(): void {
    this.buildForm();
    this.fuelTypeOptions = FUEL_TYPE;
    this.statusOptions = STATUS_OPTIONS;
  }

  buildForm(): void {
    this.paramForm = this.formBuilder.group({
      effectiveDate: [null, [RxwebValidators.required(), RxwebValidators.minLength({ value: 1})]],
      fuelType: [null, [RxwebValidators.required()]],
      active: [null, [RxwebValidators.required()]],
    });
  }

  save(): void {
    const payload = this.paramForm.getRawValue();

    if (this.paramForm.invalid) {
      this.paramForm.markAllAsTouched();
      return;
    }

    payload.effectiveStart = format(payload.effectiveDate[0], 'yyyy-MM-dd hh:mm');
    payload.effectiveEnd = format(payload.effectiveDate[1], 'yyyy-MM-dd hh:mm');

    delete payload.effectiveDate;

    this.busy$ = this.secService.createSecParameters(payload)
      .pipe()
      .subscribe(() => {
        this.modalRef.close();
      });
  }

  triggerClose = () => this.modalRef.close();

}
