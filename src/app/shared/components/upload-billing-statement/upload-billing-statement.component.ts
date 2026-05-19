import { LABELS } from '@shared/constants/labels.const';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { FormBuilder, FormGroup } from '@angular/forms';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { ToastrService } from 'ngx-toastr';
import { MESSAGES } from '@shared/constants/messages.const';
import { Subscription } from 'rxjs';
import { SettlementService } from '@shared/services/api';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { format } from 'date-fns';

@Component({
  selector: 'app-upload-billing-statement',
  standalone: false,
  templateUrl: './upload-billing-statement.component.html',
  styleUrl: './upload-billing-statement.component.scss'
})
export class UploadBillingStatementComponent implements OnInit {

  public readonly modalData = inject(NZ_MODAL_DATA);
  private readonly formBuilder = inject(FormBuilder);
  private readonly toaster = inject(ToastrService);
  private readonly modalRef = inject(NzModalRef);
  private readonly settlementService = inject(SettlementService);
  private readonly destroyRef$ = inject(DestroyRef);

  LABELS = LABELS;
  formGroup: FormGroup;
  fileList: NzUploadFile[] = [];
  busy$: Subscription;

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    console.log(this.modalData)
    this.formGroup = this.formBuilder.group({
      billingPeriod: [null, RxwebValidators.required()],
      // billingPeriodId: [null, RxwebValidators.required()],
      startDate: [null, RxwebValidators.required()],
      endDate: [null, RxwebValidators.required()],
      marketFeeType: [null, RxwebValidators.required()],
      type: [null, RxwebValidators.required()],
      category: ['MARKET_FEE', RxwebValidators.required()],
      dueDate: [null, RxwebValidators.required()],
    });

    const params = this.modalData?.parameters;

    this.formGroup.patchValue({
      billingPeriod: params?.billingPeriodName,
      billingPeriodId: params?.billingPeriodId,
      type: params?.processType,
      marketFeeType: params?.marketFeeType,
      startDate: params?.billingStartDate,
      endDate: params?.billingEndDate
    });
  }

  beforeUpload = (file: NzUploadFile) => {
    const isPdf = file.name.split('.').pop() === 'pdf';
    const isDuplicateFile = this.fileList.some(item => item.name === file.name);
    if (file.name?.length > 100) {
      this.toaster.error(MESSAGES.LONG_FILE_NAME);
      return false;
    }

    if (isDuplicateFile) {
      this.toaster.error(MESSAGES.DUPLICATE_FILES);
      return false;
    }

    if (!isPdf) {
      this.toaster.error(MESSAGES.INVALID_FILE_TYPE);
      return false;
    }

    this.fileList.push(file);
    return false;
  }

  deleteFile(index: number): void {
    this.fileList.splice(index, 1);
    this.fileList = [...this.fileList];
  }

  triggerOk(): void {
    const formData = new FormData();

    this.fileList.forEach(file => formData.append('files', file as any));

    const values = this.formGroup.getRawValue();

    Object.entries({
      ...values,
      dueDate: format(values.dueDate, 'yyyy-MM-dd')
    }).forEach(([key, value]) => {
      formData.append(key, value as string);
    });

    this.busy$ = this.settlementService.uploadBillingStatement(formData)
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe(res => {
        console.log({res});
        this.triggerClose();
      });
  }

  triggerClose(): void {
    this.modalRef.destroy();
  }

}
