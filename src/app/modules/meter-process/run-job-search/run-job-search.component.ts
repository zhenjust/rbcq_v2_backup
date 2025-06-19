import { Component, inject, OnDestroy, OnInit, TemplateRef, ViewChild, effect } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { METER_PROCESS_TYPE_OPTION } from '@shared/constants';
import { MeterProcessTypes } from '@shared/enums';
import { meterProcessBillingPeriod, meterProcessJobSearchGroupParams, meterProcessOptions, meterProcessParams } from '@shared/interfaces';
import { MeterprocessService } from '@shared/services/api';
import { RunJobService, SearchFilterService } from '@shared/services/meterProcess';
import { DateFormatterUtilService, ProcessTypeUtilService } from '@shared/services/utils';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Subject, takeUntil } from 'rxjs';

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
  protected meterProcessParams: Partial<meterProcessJobSearchGroupParams> | null = null;
  protected meterProcessFilterParams: Partial<meterProcessJobSearchGroupParams> | null = null;

  private ptc = inject(ProcessTypeUtilService);
  private fdp = inject(DateFormatterUtilService)

  constructor(
    public rjs: RunJobService,
    public modal: NzModalService,
    private mpa: MeterprocessService,
    private fb: FormBuilder,
    private sfs: SearchFilterService
  ) {
    this.setupServiceEffects();
  }

  ngOnInit(): void {
    this.initFilterForm();

    this.mpa.getBillingPeriod().pipe(takeUntil(this.destroy$)).subscribe({
        next: (data) => {
        this.meterProcessBillingPeriod = Array.isArray(data) ? data : Object.values(data);
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

  private setupServiceEffects(): void {
    effect(() => {
      const configuration = this.rjs.latestConfiguration();

      if (configuration) {
        this.isFormValid = this.rjs.hasValidConfiguration();
        
        this.processConfigurationForSearch(configuration);
      } else {
        this.isFormValid = false;
        this.meterProcessParams = null;
      }
    });

    effect(() => {
      const isCleared = this.rjs.isConfigurationCleared();
      if (isCleared) {
        this.meterProcessParams = null;
        this.isFormValid = false;
        this.resetFilter();
      }
    });
  }

  private processConfigurationForSearch(configuration: meterProcessParams): void {
    const filtered = Object.entries(configuration)
      .filter(([key, val]) => val !== null && val !== undefined && val !== '' && key !== 'tradingDate')
      .reduce((obj, [k, v]) => {
        obj[k as keyof meterProcessJobSearchGroupParams] = v;
        return obj;
      }, {} as Partial<meterProcessJobSearchGroupParams>);

    this.meterProcessParams = filtered;
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

  get isAdjustmentType(): boolean {
    const configuration = this.rjs.getLatestConfiguration();
    return configuration?.processType === MeterProcessTypes.ADJUSTMENT;
  }

  applyFilter(): void {
    if (this.filterForm.valid) {
      const rawValues: Partial<meterProcessJobSearchGroupParams> = this.filterForm.getRawValue();

      const formattedValues: Partial<meterProcessJobSearchGroupParams> = {
        ...rawValues,
        startDatetime: rawValues.startDatetime ? this.fdp.formatDateTime(rawValues.startDatetime) : undefined,
        endDatetime: rawValues.endDatetime ? this.fdp.formatDateTime(rawValues.endDatetime) : undefined,
        tradingDate: rawValues.tradingDate ? this.fdp.formatDateTime(rawValues.tradingDate) : undefined
      };

      this.sfs.refreshJobs(formattedValues);
    }
  }

  resetFilter(): void {
    this.filterForm.reset();
    this.hasFilter = false;
    this.meterProcessParams = null;
    this.sfs.refreshJobs({});
  }

  openRunWesmModal(): void {
    if (!this.meterProcessParams || !this.rjs.hasValidConfiguration()) {
      this.modal.warning({
        nzTitle: 'Invalid Configuration',
        nzContent: 'Please ensure all required fields are filled correctly.',
      });
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
                this.sfs.refreshJobs({});
                this.rjs.clearConfiguration();
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
            .add(() => (this.isLoading = false));
        });
      }
    });
  }

  toggleFilter() {
    this.hasFilter = !this.hasFilter;
  }
}