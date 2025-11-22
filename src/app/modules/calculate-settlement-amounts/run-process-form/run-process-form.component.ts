import { Component, inject, Input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { FULL_SETTLEMENT_OPTIONS, MARKET_FEE_SETTLEMENT_OPTIONS, RunProcessBtnLabel } from '@shared/constants';
import { LABELS } from '@shared/constants/labels.const';
import { settlementSearchNames } from '@shared/enums';
import { meterProcessBillingPeriod } from '@shared/interfaces';
import { MeterprocessService } from '@shared/services/api';
import { NzSelectOptionInterface } from 'ng-zorro-antd/select';

@Component({
  selector: 'app-run-process-form',
  standalone: false,
  templateUrl: './run-process-form.component.html',
  styleUrl: './run-process-form.component.scss'
})
export class RunProcessFormComponent implements OnInit {

  @Input({ required: true }) module: settlementSearchNames;

  readonly mps = inject(MeterprocessService);
  readonly fb = inject(FormBuilder);
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
      processType: [null],
      billingPeriod: [null],
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

  }

  get billingPeriod(): AbstractControl | null { return this.form.get('billingPeriod'); }
  get selectedDate(): AbstractControl | null { return this.form.get('selectedDate'); }


}
