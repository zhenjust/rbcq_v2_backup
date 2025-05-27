import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MeterProcessTypes } from '@shared/enums';
import { Subject, takeUntil } from 'rxjs';
import { RunJobService } from '@shared/services/meterProcess';
import { meterProcessParams } from '@shared/interfaces';

@Component({
  selector: 'app-meter-process-config',
  standalone: false,
  templateUrl: './meter-process-config.component.html',
  styleUrl: './meter-process-config.component.scss'
})
export class MeterProcessConfigComponent implements OnInit, OnDestroy {
  meterProcessForm!: FormGroup;
  MeterProcessTypes = MeterProcessTypes;
  
  private destroy$ = new Subject<void>();
  
  constructor(public meterProcessService: RunJobService) {}
  
  ngOnInit(): void {
    this.meterProcessForm = this.meterProcessService.getForm();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  
  // Getters (existing)
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