import { MESSAGES } from '@shared/constants/messages.const';
import { Component, signal, inject, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { LABELS } from '@shared/constants/labels.const';
import { SettlementService } from '@shared/services/api';
import { addDays, format, isBefore, subDays } from 'date-fns';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { Subscription } from 'rxjs';
import { MeterProcessTypes } from '@shared/enums';

@Component({
  selector: 'app-ams',
  standalone: false,
  templateUrl: './ams.component.html'
})
export class AmsComponent implements OnInit {

  private readonly formBuilder = inject(FormBuilder);
  private readonly modalData = inject(NZ_MODAL_DATA);
  private readonly settlementService = inject(SettlementService);
  private readonly destroyRef$ = inject(DestroyRef);
  private readonly modalRef$ = inject(NzModalRef);

  form: FormGroup;
  busy$: Subscription;
  MESSAGE = MESSAGES;
  LABELS = LABELS;

  rowData = signal<any | null>(null);
  action = signal<string>('');
  isPenaltyMarketFee = signal<boolean>(false);
  startDate: Date;
  endDate: Date;

  ngOnInit(): void {
    this.rowData.set(this.modalData?.rowData);
    this.action.set(this.modalData?.action);
    this.isPenaltyMarketFee.set(this.modalData?.isPenaltyMarketFee);

    this.buildForm();
  }

  buildForm(): void {
    this.startDate = subDays(this.rowData()?.billingStartDate, 1);
    this.endDate = addDays(this.rowData()?.billingEndDate, 1);

    this.form = this.formBuilder.group({
      allocDate: [new Date(), RxwebValidators.required()],
      dueDate: [addDays(new Date(), 1), RxwebValidators.required({ conditionalExpression: () => !this.isPrelim })],
      remarks: [null],
    });

    this.onAllocDateChange();
  }

  onAllocDateChange(): void {
    this.allocDate.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe(allocDate => {
        if (allocDate) {
          this.dueDate.enable();
          this.dueDate.setValue(addDays(allocDate, 1));
        } else {
          this.dueDate.disable();
          this.dueDate.reset();
        }
      });
  }

  submit(): void {
    const row = this.rowData();
    const form = this.form.getRawValue();

    const payload = {
      pipelineName: this.modalData?.action,
      isGroup: true,
      refId: row?.id,
      parameters: {
        billingStartDate: row?.billingStartDate,
        billingEndDate: row?.billingEndDate,
        processType: row?.processType,
        allocDate: form.allocDate ? format(form.allocDate, 'yyyy-MM-dd') : null,
        billingPeriodName: row?.billingPeriod ? row?.billingPeriod : null,
        remarks: form.remarks,
        dueDate: form.dueDate && !this.isPrelim ? format(form.dueDate, 'yyyy-MM-dd') : null
      },
    };

    this.busy$ = this.settlementService.etaJobs(payload)
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe(() => {
        this.modalRef$?.destroy(true);
      });
  }

  triggerClose(): void {
    this.modalRef$.destroy();
  }

  disabledAllocDate = (current: Date) => isBefore(current, new Date());
  disabledDueDate = (current: Date) => isBefore(current, this.allocDate?.value);

  get allocDate(): AbstractControl { return this.form.get('allocDate') as AbstractControl; }
  get dueDate(): AbstractControl { return this.form.get('dueDate') as AbstractControl; }
  get isPrelim(): boolean { return this.rowData()?.processType === MeterProcessTypes.PRELIM; }

}
