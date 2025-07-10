import { Component, OnInit, TemplateRef, ViewChild, computed, effect, inject } from '@angular/core';
import { AuthorizationService } from '@core/services/authorization.service';
import { MeterDataPipelineName, MeterProcessStatus, ProcessType } from '@shared/constants';
import { MeterProcessTypes } from '@shared/enums';
import { meterProcessPipeline, meterProcessTable } from '@shared/interfaces';
import { MeterprocessService } from '@shared/services/api';
import { SearchFilterService } from '@shared/services/meterProcess';
import { DateFormatterUtilService } from '@shared/services/utils';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ToastrService } from 'ngx-toastr';

interface tableColumn {
  name: string;
}

interface ModalData {
  pipeline: meterProcessPipeline;
  jobType: string;
  actionType: MeterDataPipelineName;
  processType: string;
  billingPeriod?: string;
  tradingDate?: string;
  adjustmentNumber?: string;
}

@Component({
  selector: 'app-table',
  standalone: false,
  templateUrl: './table.component.html'
})
export class TableComponent implements OnInit {
  // Default table data structure
  private defaultTableData: meterProcessTable = {
    pipelineGroup: [],
    last: false,
    totalPages: 0,
    totalElements: 0,
    sortBy: null,
    sortDirection: null,
    first: true,
    numberOfElements: 0,
    size: 10,
    number: 0
  };

  @ViewChild('runJobs', { static: true }) runJobs!: TemplateRef<void>;

  meterProcessStatus = MeterProcessStatus;
  meterDataPipelines = MeterDataPipelineName;
  processTypes = MeterProcessTypes;
  tableData = computed(() => this.sfs.jobs() || this.defaultTableData);
  isLoading = computed(() => this.sfs.isLoading());

  // Add property to store current modal data
  currentModalData: ModalData | null = null;

  columnItem: tableColumn[] = [
    { name: 'Process Type' },
    { name: 'Billing Period / Trading Date' },
    { name: 'Jobs Count' }
  ];

  childColumnItem: tableColumn[] = [
    { name: 'Workspace ID' },
    { name: 'Last Activity Date Time' },
    { name: 'Last Activity By' },
    { name: 'Process Type' },
    { name: 'Start Date Time' },
    { name: 'End Date Time' },
    { name: 'MTN' },
    { name: 'Status' },
    { name: 'Progress' },
    { name: 'Actions' }
  ];

  pipelineColumnItem: tableColumn[] = [
    {name: 'Name'},
    {name: 'Run Id'},
    {name: 'Run Start'},
    {name: 'Run End'},
    {name: 'Duration'},
    {name: 'Run By'},
    {name: 'Status'},
  ]

  expandSet = new Set<number>();
  pipelineExpandSet = new Set<string>();
  public toast = inject(ToastrService);
  public sfs = inject(SearchFilterService);
  public modal = inject(NzModalService);
  public dfs = inject(DateFormatterUtilService);

  private mpa = inject(MeterprocessService);
  private as = inject(AuthorizationService);

  constructor() {
    effect(() => {
      this.sfs.jobs();
      const error = this.sfs.error();
      const loading = this.sfs.isLoading();
      if (error && !loading) {
        this.toast.error('Failed to load jobs', error);
      }
    });
  }

  ngOnInit(): void {
    this.sfs.refreshJobs({});
  }

  onExpandChange(checked: boolean, index: number): void {
    if (checked) {
      this.expandSet.add(index);
    } else {
      this.expandSet.delete(index);
    }
  }

  onPipelineExpandChange(checked: boolean, parentIndex: number, pipelineIndex: number): void {
    const uniqueKey = `${parentIndex}-${pipelineIndex}`;
    if (checked) {
      this.pipelineExpandSet.add(uniqueKey);
    } else {
      this.pipelineExpandSet.delete(uniqueKey);
    }
  }

  isPipelineExpanded(parentIndex: number, pipelineIndex: number): boolean {
    const uniqueKey = `${parentIndex}-${pipelineIndex}`;
    return this.pipelineExpandSet.has(uniqueKey);
  }

  refreshData(): void {
    this.sfs.refreshJobs({});
  }

  openJobModal(pipelineRunData: meterProcessPipeline,
    jobType: string,
    actionType: MeterDataPipelineName,
    parentData: any
  ): void {
    this.currentModalData = {
      pipeline: pipelineRunData,
      jobType: jobType,
      actionType: actionType,
      processType: parentData.processType,
      tradingDate: parentData.tradingDate,
      billingPeriod: parentData.billingPeriod,
      adjustmentNumber: parentData.adjNo
    };

    // console.log(this.currentModalData);
    this.modal.create({
      nzTitle: actionType,
      nzContent: this.runJobs,
      nzOkText: 'Run Job',
      nzCancelText: 'Cancel',
      nzOnOk: () => {
        return new Promise<void>((resolve, reject) => {
          this.mpa.runJob({}, this.currentModalData?.actionType, this.currentModalData?.pipeline.id)
            .subscribe({
              next: () => {
                this.modal.success({
                  nzCentered: true,
                  nzTitle: 'Jobs Successfully Triggered!'
                });
                this.sfs.refreshJobs({});
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
        })
      },
      nzOnCancel: () => {
        this.currentModalData = null;
      }
    });
  }

  getJobTypeFromStatus(status: string): string {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.endsWith(ProcessType.METER_DATA) ||
      lowerStatus.endsWith(ProcessType.SETTLEMENT_READY)) {
      return 'Settlement - Ready';
    } else if (lowerStatus.endsWith(ProcessType.GESQ)) {
      return 'Finalize - GESQ';
    }
    return 'Unknown';
  }


  downloadReport(pipeline: meterProcessPipeline): string {
    const baseUrl = 'meter-process/reports/download/zip';

    const processType = pipeline.parameters.processType ?? '';
    const isDaily = processType.toUpperCase?.() === 'DAILY';

    const tradingDate = isDaily
      ? this.dfs.formatDate(pipeline.parameters.tradingDate, 'yyyyMMdd')
      : this.dfs.formatDate(pipeline.parameters.endDatetime, 'yyyyMMdd');

    const runDate = this.dfs.formatDate(pipeline.lastModifiedDatetime, 'yyyyMMddHHmmss');
    const user = this.as.currentUser()?.principal.username ?? '';

    const params = new URLSearchParams({
      version: String(pipeline.id),
      isDaily: String(isDaily),
      tradingDate,
      runDate,
      processType,
      user,
    });

    // return `${window.location.origin}`;
    return `${window.location.origin}/${baseUrl}?${params.toString()}`;
  }
}
