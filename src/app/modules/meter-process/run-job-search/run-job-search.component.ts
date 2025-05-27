import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { METER_PROCESS_TYPE_OPTION } from '@shared/constants';
import { MeterProcessTypes } from '@shared/enums';
import { meterProcessBillingPeriod, meterProcessOptions, meterProcessParams } from '@shared/interfaces';
import { MeterprocessService } from '@shared/services/api';
import { RunJobService, SearchFilterService } from '@shared/services/meterProcess';
import { ProcessTypeUtilService } from '@shared/services/utils';
import { NzModalService } from 'ng-zorro-antd/modal';
import { filter, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-run-job-search',
  standalone: false,
  templateUrl: './run-job-search.component.html',
  styleUrl: './run-job-search.component.scss'
})
export class RunJobSearchComponent implements OnInit, OnDestroy {
  filterForm!: FormGroup;

  isFormValid: boolean = false;
  hasFilter: boolean = false;
  meterProcessTypeOptions: meterProcessOptions[] = METER_PROCESS_TYPE_OPTION;
  meterProcessBillingPeriod: meterProcessBillingPeriod[] = []; 

  @ViewChild('runWesmModal', { static: true }) runWesmModal!: TemplateRef<void>;
  
  isLoading: boolean = false;
  private destroy$ = new Subject<void>();
  protected meterProcessParams: Partial<meterProcessParams> | null = null;
  protected meterProcessFilterParams: Partial<meterProcessParams> | null = null;

  constructor(
    public meterProcessService: RunJobService,
    public modal: NzModalService,
    private mpa: MeterprocessService,
    private fb: FormBuilder,
    private ptc: ProcessTypeUtilService,
    private searchFilterService: SearchFilterService
  ) {}

  ngOnInit(): void {
    this.initFilterForm();
    this.getLatestRunJobParams();
    this.meterProcessService.formValid$.subscribe(valid => {
      this.isFormValid = valid;
    });

    this.mpa.getBillingPeriod().pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.meterProcessBillingPeriod = Array.isArray(data) ? data : Object.values(data); // Adjusted for object-of-objects
        this.tryAutoSetBillingPeriod();
      },
      error: (err) => console.error(err)
    });

    this.filterForm.get('billingPeriod')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((selectedValue) => {
        const selectedBilling = this.meterProcessBillingPeriod.find(
          (item) => item.billingPeriod === selectedValue
        );

        if (selectedBilling) {
          this.filterForm.patchValue({
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

  private initFilterForm(): void {
    this.filterForm = this.fb.group({
      processType: [null],
      billingPeriod: [{ value: '', disabled: true }],
      startDate: [{ value: '', disabled: true }],
      endDate: [{ value: '', disabled: true }],
      adjNo: [{ value: '', disabled: true }],
      tradingDate: [{ value: '', disabled: true }]
    });

    this.filterForm.get('processType')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        this.ptc.handleProcessTypeChange(value, this.filterForm);
      });

    this.filterForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        this.meterProcessFilterParams = {
          ...this.meterProcessFilterParams,
          ...value
        };
    });
  }

  private tryAutoSetBillingPeriod(): void {
    if (this.meterProcessBillingPeriod.length > 0) {
      const selected = this.meterProcessBillingPeriod[0];

      this.filterForm.patchValue({
        billingPeriod: selected.billingPeriod,
        startDate: new Date(selected.startDate),
        endDate: new Date(selected.endDate)
      });
    }
  }

  get isFinalType(): boolean {
    return this.meterProcessService.isFinalType;
  }

  private getLatestRunJobParams(): void {
    this.meterProcessService.formValue$
      .pipe(
        takeUntil(this.destroy$),
        filter((value): value is meterProcessParams => value !== null)
      )
      .subscribe((value) => {
        // Filter out falsy values
        const filtered = Object.entries(value)
          .filter(([key, val]) => val !== null && val !== undefined && val !== '' && key !== 'tradingDate')
          .reduce((obj, [k, v]) => {
            obj[k as keyof meterProcessParams] = v;
            return obj;
          }, {} as Partial<meterProcessParams>);

        this.meterProcessParams = filtered;
      });
  }

  applyFilter(): void {
    if (this.filterForm.valid) {
      const filterValues: meterProcessParams = this.filterForm.getRawValue();
      this.searchFilterService.refreshJobs(filterValues);
    }
  }

  resetFilter(): void {
    this.filterForm.reset();
    this.hasFilter = false;
    this.meterProcessParams = null;
    this.searchFilterService.refreshJobs({});
  }

  openRunWesmModal(): void {
    if (!this.meterProcessParams) {
      this.modal.warning({ nzTitle: 'Missing Parameters', nzContent: 'No job parameters found.' });
      return;
    }

    this.modal.create({
      nzTitle: 'Run WESM Job',
      nzContent: this.runWesmModal,
      nzOkText: 'Run Job',
      nzCancelText: 'Cancel',
      nzOnOk: () => {
        return new Promise<void>((resolve, reject) => {
          this.isLoading = true;
          this.mpa.runJob(this.meterProcessParams!)
            .subscribe({
              next: () => {
                this.modal.success({
                  nzTitle: 'Success',
                  nzContent: 'Job has been submitted successfully.'
                });
                resolve();
              },
              error: (err) => {
                this.modal.error({
                  nzTitle: 'Error',
                  nzContent: 'Failed to run the job.'
                });
                console.error('Run Job Error:', err);
                reject();
              }
            })
            .add(() => this.isLoading = false);
        });
      }
    });
  }

  toggleFilter() {
    this.hasFilter = !this.hasFilter;
  }

  get ifAdjustmentType(): boolean {
    return this.meterProcessFilterParams?.processType === MeterProcessTypes.ADJUSTMENT;
  }
}
