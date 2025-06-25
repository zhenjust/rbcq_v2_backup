import { Component, inject, OnDestroy, OnInit, TemplateRef, ViewChild, effect } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { METER_PROCESS_TYPE_OPTION, MeterDataPipelineName } from '@shared/constants';
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

  @ViewChild('runMeterDataModal', { static: true }) runMeterDataModal!: TemplateRef<void>;

  isLoading: boolean = false;
  private destroy$ = new Subject<void>();
  private meterDataName = MeterDataPipelineName;
  protected meterProcessParams: Partial<meterProcessParams> | null = null;
  protected meterProcessFilterParams: Partial<meterProcessJobSearchGroupParams> | null = null;

  private ptc = inject(ProcessTypeUtilService);
  private fdp = inject(DateFormatterUtilService);
  public rjs = inject(RunJobService);
  public modal = inject(NzModalService);
  private mpa = inject(MeterprocessService);
  private fb = inject(FormBuilder);
  private sfs = inject(SearchFilterService);

  constructor() {
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
    this.meterProcessParams = Object.fromEntries(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Object.entries(configuration).filter(([_key, val]) => 
        val !== null && val !== undefined && val !== "" && _key !== 'regionGroup'
      )
    ) as Partial<meterProcessParams>;
  }

  private initFilterForm(): void {
    this.filterForm = this.fb.group({
      processType: [null],
      billingPeriod: [{ value: '', disabled: true }],
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
        billingPeriod: selected.name
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
        tradingDate: rawValues.tradingDate ? this.fdp.formatDateOnly(rawValues.tradingDate) : undefined
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
    // console.log(this.rjs.latestConfiguration());
    this.modal.create({
      nzTitle: 'Run Meter Data Job',
      nzContent: this.runMeterDataModal,
      nzOkText: 'Run Job',
      nzCancelText: 'Cancel',
      nzOnOk: () => {
        return new Promise<void>((resolve, reject) => {
          this.isLoading = true;
          this.mpa.runJob(this.meterProcessParams!, this.meterDataName.INITIALIZE)
            .subscribe({
              next: () => {
                this.modal.success({
                  nzCentered: true,
                  nzTitle: 'Jobs Successfully Triggered!',
                });
                this.sfs.refreshJobs({});
                // this.rjs.clearConfiguration();
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
