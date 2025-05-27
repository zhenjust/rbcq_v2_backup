import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { meterProcessParams, meterProcessRunJobPayload } from '@shared/interfaces';
import { MeterprocessService } from '@shared/services/api';
import { RunJobService } from '@shared/services/meterProcess';
import { NzModalService } from 'ng-zorro-antd/modal';
import { filter, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-run-job-search',
  standalone: false,
  templateUrl: './run-job-search.component.html',
  styleUrl: './run-job-search.component.scss'
})
export class RunJobSearchComponent implements OnInit, OnDestroy {
  isFormValid: boolean = false;

  @ViewChild('runWesmModal', { static: true }) runWesmModal!: TemplateRef<void>;
  
  isLoading: boolean = false;
  private destroy$ = new Subject<void>();
  protected meterProcessParams: Partial<meterProcessParams> | null = null;

  constructor(
    public meterProcessService: RunJobService,
    public modal: NzModalService,
    private mpa: MeterprocessService
  ) {}

  ngOnInit(): void {
    this.getLatestRunJobParams();
    this.meterProcessService.formValid$.subscribe(valid => {
      this.isFormValid = valid;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
}
