import { Component, inject, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { METER_PROCESS_TYPE_OPTION } from '@shared/constants';
import { MeterProcessTypes } from '@shared/enums';
import { meterProcessBillingPeriod, meterProcessJobSearchGroupParams, meterProcessOptions, meterProcessParams } from '@shared/interfaces';
import { FormatDatePipe } from '@shared/pipes';
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
  private fdp = new FormatDatePipe();
  private destroy$ = new Subject<void>();
  protected meterProcessParams: Partial<meterProcessJobSearchGroupParams> | null = null;
  protected meterProcessFilterParams: Partial<meterProcessJobSearchGroupParams> | null = null;

  private ptc = inject(ProcessTypeUtilService);

  constructor(
    public meterProcessService: RunJobService,
    public modal: NzModalService,
    private mpa: MeterprocessService,
    private fb: FormBuilder,
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
            startDatetime: new Date(selectedBilling.startDate),
            endDatetime: new Date(selectedBilling.endDate)
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
      startDatetime: [{ value: '', disabled: true }],
      endDatetime: [{ value: '', disabled: true }],
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
        startDatetime: new Date(selected.startDate),
        endDatetime: new Date(selected.endDate)
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
        filter((value): value is meterProcessJobSearchGroupParams => value !== null)
      )
      .subscribe((value) => {
        // Filter out falsy values
        const filtered = Object.entries(value)
          .filter(([key, val]) => val !== null && val !== undefined && val !== '' && key !== 'tradingDate')
          .reduce((obj, [k, v]) => {
            obj[k as keyof meterProcessJobSearchGroupParams] = v;
            return obj;
          }, {} as Partial<meterProcessJobSearchGroupParams>);

        this.meterProcessParams = filtered;
      });

    // console.log(this.meterProcessParams)
  }

  applyFilter(): void {
    if (this.filterForm.valid) {
      const rawValues: meterProcessJobSearchGroupParams = this.filterForm.getRawValue();

      const formattedValues: meterProcessJobSearchGroupParams = {
        ...rawValues,
        startDatetime: rawValues.startDatetime ? this.fdp.formatDateTime(rawValues.startDatetime) : undefined,
        endDatetime: rawValues.endDatetime ? this.fdp.formatDateTime(rawValues.endDatetime) : undefined,
        tradingDate: rawValues.tradingDate ? this.fdp.formatDateTime(rawValues.tradingDate) : undefined
      };
      
      this.searchFilterService.refreshJobs(formattedValues);
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
              next: (response: any) => {
                this.modal.success({
                  nzTitle: response.message,
                  nzContent: `RunId: ${response.runId}`
                });
                this.searchFilterService.refreshJobs({});
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
