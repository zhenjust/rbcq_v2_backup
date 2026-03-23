import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { STATUS_OPTIONS } from '@shared/constants';
import { LABELS } from '@shared/constants/labels.const';
import { MESSAGES } from '@shared/constants/messages.const';
import { AdminService, SecParamsService } from '@shared/services/api';
import { format } from 'date-fns';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzSelectOptionInterface } from 'ng-zorro-antd/select';
import { ToastrService } from 'ngx-toastr';
import { distinctUntilChanged, Subscription } from 'rxjs';

@Component({
  selector: 'app-create-sec-param',
  standalone: false,
  templateUrl: './create-sec-param.component.html'
})
export class CreateSecParamComponent implements OnInit {

  private formBuilder = inject(FormBuilder);
  private secService = inject(SecParamsService);
  private modalRef = inject(NzModalRef);
  private adminService = inject(AdminService);
  private destroyRef$ = inject(DestroyRef);
  private toastService = inject(ToastrService);

  paramForm: FormGroup;
  busy$: Subscription;
  MESSAGE = MESSAGES;
  LABELS = LABELS;
  fuelTypeOptions: NzSelectOptionInterface[] = [];
  statusOptions: NzSelectOptionInterface[] = [];

  ngOnInit(): void {
    this.buildForm();
    this.getFuelTypes();
    this.statusOptions = STATUS_OPTIONS;
  }

  buildForm(): void {
    this.paramForm = this.formBuilder.group({
      effectiveDate: [null, [RxwebValidators.required(), RxwebValidators.minLength({ value: 1})]],
      fuelType: [null, [RxwebValidators.required(), RxwebValidators.minLength({ value: 1})]],
      active: [null, [RxwebValidators.required()]],
    });
  }

  getFuelTypes(): void {
    this.adminService.getReferences('FACILITY_GENERATOR_TYPE')
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe(res => {
        const allOptions = res.data.map(d => d.code);
        this.fuelTypeOptions = res.data.map(d => ({ label: d.label, value: d.code }));
        this.fuelTypeOptions.unshift({ label: LABELS.ALL, value: 'all' });

        this.fuelType
          ?.valueChanges
          ?.pipe(distinctUntilChanged())
          ?.subscribe(val => {
            if (val.includes('all')) {
              this.fuelType?.setValue(allOptions,
                { emitEvent: false, onlySelf: true });
            }
          })
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
        this.toastService.success(MESSAGES.SUCCESS_SAVE_ITEM(LABELS.SEC_PARAMETER));
        this.modalRef.close(true);
      });
  }

  triggerClose = () => this.modalRef.close();

  get fuelType(): AbstractControl | null { return this.paramForm.get('fuelType'); }

}
