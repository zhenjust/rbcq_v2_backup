import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MeterProcessTypes } from '@shared/enums';
import { Subject, takeUntil } from 'rxjs';
import { RunJobService } from '@shared/services/meterProcess';
import { meterProcessBillingPeriod, mtnList, mtnListPage } from '@shared/interfaces';
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
  nextPage: number = 1;
  search: string = '';
  mtnIsLoading: boolean = false;
  meterProcessBillingPeriod: meterProcessBillingPeriod[] = []; 
  mtnList: mtnList[] = [];
  
  // Default time values for date pickers
  defaultStartTime: Date;
  defaultEndTime: Date;
  
  private destroy$ = new Subject<void>();
  
  constructor(
    public meterProcessService: RunJobService,
    public mpa: MeterprocessService
  ) {
    // Initialize default time values
    this.defaultStartTime = new Date();
    this.defaultStartTime.setHours(0, 0);
    
    this.defaultEndTime = new Date();
    this.defaultEndTime.setHours(23, 59);
  }
  
  ngOnInit(): void {
    this.meterProcessForm = this.meterProcessService.getForm();
    this.populateMtnList();
    this.getBillingPeriod();
    this.updateBillingPeriodForm();
    this.callMtnList();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  private tryAutoSetBillingPeriod(): void {
    if (this.isNotDailyType && this.meterProcessBillingPeriod.length > 0) {
      const selected = this.meterProcessBillingPeriod[0];
      this.meterProcessService.updateBillingPeriodWithDatetime(selected);
      this.meterProcessForm.patchValue({
        billingPeriod: selected.billingPeriod
      });
    }
  }

  private populateMtnList(): void {
    this.meterProcessService.mtnList$
      .pipe(takeUntil(this.destroy$))
      .subscribe(mtnList => {
        this.mtnList = mtnList;
    });
  }

  private getBillingPeriod(): void {
    this.mpa.getBillingPeriod().pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.meterProcessBillingPeriod = Array.isArray(data) ? data : Object.values(data);
        this.tryAutoSetBillingPeriod();
      },
      error: (err) => console.error(err)
    });
  }

  private updateBillingPeriodForm(): void {
    this.meterProcessForm.get('billingPeriod')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((selectedValue) => {
        const selectedBilling = this.meterProcessBillingPeriod.find(
          (item) => item.billingPeriod === selectedValue
        );

        if (selectedBilling) {
          this.meterProcessService.updateBillingPeriodWithDatetime(selectedBilling);
        }
    });
  }

  private callMtnList(): void {
    this.mpa.getMtnList().pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        let mtnData: mtnList[] = [];
        
        if (response && response.data && Array.isArray(response.data)) {
          mtnData = response.data;
        } else if (Array.isArray(response)) {
          mtnData = response;
        } else {
          console.warn(response);
          mtnData = [];
        }
        
        this.meterProcessService.updateMtnList(mtnData);
      },
      error: (error) => {
        console.error('Error loading MTN list:', error);
        this.meterProcessService.updateMtnList([]);
      }
    });
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
  
  get selectedRegionNames(): string[] {
    return this.meterProcessService.selectedRegionNames;
  }

  get meterProcessRegionGroup() {
    return this.meterProcessService.meterProcessRegionGroup;
  }
  
  // Handle datetime change with 5-minute rounding
  onDatetimeChange(controlName: string, date: Date): void {
    if (date) {
      const roundedDate = this.meterProcessService.roundToNearestFiveMinutes(date);
      this.meterProcessForm.get(controlName)?.setValue(roundedDate, { emitEvent: false });
    }
  }

  getNextMtnRecord(search?: string): void {
    this.mpa.getMtnList(this.nextPage, search).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: mtnListPage) => {
        if(response.hasMore){
          this.nextPage = this.nextPage + 1;
          const mtn: mtnList[] = response ? [...this.mtnList,...response.data] : this.mtnList;
          this.meterProcessService.updateMtnList(mtn);
        }
        this.meterProcessService.getSelectedMtnNames();
        this.populateMtnList();
      },
      error: (error) => {
        console.error('Error loading MTN list:', error.message);
      }
    }).add(() => this.mtnIsLoading = false);
  }

  searchMtnRecord(search: string): void {
    // reset list
    this.nextPage = 0;
    this.mtnList = []; // clear list
    this.meterProcessService.updateMtnList([]); // Clear service data
    this.getNextMtnRecord(search);
  }
  
  // Reset dropdown data upon clear
  onSearchClear(): void {
    this.nextPage = 0;
    this.mtnList = [];
    this.meterProcessService.updateMtnList([]);
    this.getNextMtnRecord();
  }
}