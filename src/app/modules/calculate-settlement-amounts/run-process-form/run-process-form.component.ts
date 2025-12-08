import { Component, inject, Input, OnInit, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { ConfirmWithDescComponent } from '@shared/components/confirm-with-desc/confirm-with-desc.component';
import { FULL_SETTLEMENT_OPTIONS, MARKET_FEE_SETTLEMENT_OPTIONS, RunProcessBtnLabel } from '@shared/constants';
import { LABELS } from '@shared/constants/labels.const';
import { MESSAGES } from '@shared/constants/messages.const';
import { settlementSearchNames } from '@shared/enums';
import { meterProcessBillingPeriod } from '@shared/interfaces';
import { MeterprocessService, SettlementService } from '@shared/services/api';
import { format } from 'date-fns';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectOptionInterface } from 'ng-zorro-antd/select';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-run-process-form',
  standalone: false,
  templateUrl: './run-process-form.component.html',
  styleUrl: './run-process-form.component.scss'
})
export class RunProcessFormComponent implements OnInit {

  @Input({ required: true }) module: settlementSearchNames;

  emitJob = output<boolean>();

  readonly mps = inject(MeterprocessService);
  readonly ms = inject(NzModalService);
  readonly ss = inject(SettlementService);
  readonly fb = inject(FormBuilder);
  readonly ts = inject(ToastrService);
  readonly untilDestroy$ = takeUntilDestroyed();

  LABELS = LABELS;
  RunProcessBtnLabel = RunProcessBtnLabel;
  processTypeOpts: NzSelectOptionInterface[] = [];
  billingPeriodOpts: NzSelectOptionInterface[] = [];
  form: FormGroup;
  billingPeriods: meterProcessBillingPeriod[];

  ngOnInit(): void {
    this.getReferences();
    this.buildForm();
  }

  getReferences(): void {
    this.getSettlementOptions();
    this.getBillingPeriods();
  }

  buildForm(): void {
    this.form = this.fb.group({
      processType: [null, RxwebValidators.required()],
      billingPeriod: [null, RxwebValidators.required()],
      selectedDate: [{ value: [], disabled: true }],
    });

    this.onBillingPeriodChange();
  }

  getSettlementOptions(): void {
    const noDailyFilter = [ settlementSearchNames.RESERVE_TRADING_AMOUNTS ];
    this.processTypeOpts = noDailyFilter.includes(this.module) ? MARKET_FEE_SETTLEMENT_OPTIONS : FULL_SETTLEMENT_OPTIONS;
  }

  getBillingPeriods(): void {
    this.mps.getBillingPeriod()
      .pipe(this.untilDestroy$)
      .subscribe({
        next: options => {
          this.billingPeriods = options as meterProcessBillingPeriod[];
          this.billingPeriodOpts = (options as meterProcessBillingPeriod[])
            .map(bp => ({ label: bp.supplyMonth, value: bp.billingPeriod }) );
        }
      })
  }

  onBillingPeriodChange(): void {
    this.billingPeriod?.valueChanges
      .pipe(this.untilDestroy$)
      .subscribe(id => {
        if (id) {
          const selectedBp = this.billingPeriods.find(bp => bp.billingPeriod === id);
          this.selectedDate?.setValue([selectedBp!.startDate, selectedBp!.endDate]);
        }
      });
  }

  runProcess(): void {
    const pipelineName = 'reserveTradingAmounts-generateInputWorkspace';
    const formValue = this.form.getRawValue();

    const filteredBp = this.billingPeriods.filter(d => d.billingPeriod === this.billingPeriod?.value)[0];

    const data = {
      processType: formValue.processType,
      billingStartDate: format(new Date(filteredBp.startDate), 'yyyy-MM-dd'),
      billingEndDate: format(new Date(filteredBp.endDate), 'yyyy-MM-dd'),
      billingPeriodName: filteredBp.supplyMonth,
    };

    const api$ = () => this.ss.runJob(data, pipelineName)
      .subscribe(() => {
        this.ts.success(MESSAGES.SUCCESS_JOB_TRIGGER);
        this.emitJob.emit(true);
      });

    const nzData = {
      message: MESSAGES.CONFIRM_RUN_JOB('Settlement Job'),
      okAction: LABELS.RUN_JOB,
      descriptions: [
        {
          label: LABELS.PROCESS_TYPE,
          value: data.processType
        },
        {
          label: LABELS.BILLING_PERIOD,
          value: data.billingPeriodName
        },
        {
          label: LABELS.START_DATE,
          value: data.billingStartDate
        },
        {
          label: LABELS.END_DATE,
          value: data.billingEndDate
        },
      ]
    };

    this.ms.create({
      nzTitle: `${LABELS.RUN_JOB}`,
      nzContent: ConfirmWithDescComponent,
      nzCentered: true,
      nzFooter: null,
      nzData,
      nzWidth: '600px',
      nzOnOk: () => api$()
    });
  }

  get billingPeriod(): AbstractControl | null { return this.form.get('billingPeriod'); }
  get selectedDate(): AbstractControl | null { return this.form.get('selectedDate'); }

}
