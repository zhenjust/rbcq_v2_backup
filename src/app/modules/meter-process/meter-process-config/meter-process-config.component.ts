import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MeterProcessTypes } from '@shared/enums';
import { Subject, takeUntil } from 'rxjs';
import { RunJobService } from '@shared/services/meterProcess';
import { meterProcessBillingPeriod } from '@shared/interfaces';
import { MeterprocessService } from '@shared/services/api';

@Component({
  selector: 'app-meter-process-config',
  standalone: false,
  templateUrl: './meter-process-config.component.html',
  styleUrl: './meter-process-config.component.scss'
})
export class MeterProcessConfigComponent implements OnInit, OnDestroy {
  meterProcessForm!: FormGroup;
  MeterProcessTypes = MeterProcessTypes;
  meterProcessBillingPeriod: meterProcessBillingPeriod[] = []; 
  
  private destroy$ = new Subject<void>();
  
  constructor(
    public meterProcessService: RunJobService,
    public mpa: MeterprocessService
  ) {}
  
  ngOnInit(): void {
    this.meterProcessForm = this.meterProcessService.getForm();

    this.mpa.getBillingPeriod().pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.meterProcessBillingPeriod = Array.isArray(data) ? data : Object.values(data); // Adjusted for object-of-objects
        this.tryAutoSetBillingPeriod();
      },
      error: (err) => console.error(err)
    });

    this.meterProcessForm.get('billingPeriod')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((selectedValue) => {
        const selectedBilling = this.meterProcessBillingPeriod.find(
          (item) => item.billingPeriod === selectedValue
        );

        if (selectedBilling) {
          this.meterProcessForm.patchValue({
            startDate: new Date(selectedBilling.startDate),
            endDate: new Date(selectedBilling.endDate)
          });
        }
      });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  private tryAutoSetBillingPeriod(): void {
    const processType = this.meterProcessForm.get('processType')?.value;

    if (this.isNotDailyType && this.meterProcessBillingPeriod.length > 0) {
      const selected = this.meterProcessBillingPeriod[0];
      this.meterProcessForm.patchValue({
        billingPeriod: selected.billingPeriod,
        startDate: new Date(selected.startDate),
        endDate: new Date(selected.endDate)
      });
    }
  }
  
  get isAdjustmentType(): boolean {
    return this.meterProcessService.isAdjustmentType;
  }
  
  get isDailyType(): boolean {
    return this.meterProcessService.isDailyType;
  }
  
  get isNotDailyType(): boolean {
    return this.meterProcessService.isNotDailyType;
  }
  
  get currentProcessType(): string {
    return this.meterProcessService.currentProcessType;
  }
  
  get meterProcessTypeOptions() {
    return this.meterProcessService.meterProcessTypeOptions;
  }
  
  get meterProcessRegionGroup() {
    return this.meterProcessService.meterProcessRegionGroup;
  }
}