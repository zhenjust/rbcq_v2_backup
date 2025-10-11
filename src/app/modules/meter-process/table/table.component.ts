import { Component, OnInit, TemplateRef, ViewChild, computed, effect, inject } from '@angular/core';
import { AuthorizationService } from '@core/services/authorization.service';
import { MeterDataPipelineName, MeterProcessStatus, MeterDataPipelineProcess } from '@shared/constants';
import { LABELS } from '@shared/constants/labels.const';
import { MeterProcessTypes } from '@shared/enums';
import { meterProcessPipeline, meterProcessPipelineGroup, meterProcessTable } from '@shared/interfaces';
import { MeterprocessService } from '@shared/services/api';
import { SearchFilterService } from '@shared/services/meterProcess';
import { DateFormatterUtilService } from '@shared/services/utils';
import { saveAs } from 'file-saver';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ToastrService } from 'ngx-toastr';
import { ConsolidateComponent } from '../consolidate/consolidate.component';

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
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
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

  downloadingReports = new Set<number>();

  meterProcessStatus = MeterProcessStatus;
  meterDataPipelines = MeterDataPipelineName;
  meterDataPipelineProcess = MeterDataPipelineProcess;
  processTypes = MeterProcessTypes;
  labels = LABELS;
  // tableData = computed(() => this.sfs.jobs() || this.defaultTableData);
  tableData = computed(() => {
    const data = this.sfs.jobs() || this.defaultTableData;
    return {
      ...data,
      pipelineGroup: data.pipelineGroup
    };
  });
  isLoading = computed(() => this.sfs.isLoading());

  // Add property to store current modal data
  currentModalData: ModalData | null = null;

  columnItem: tableColumn[] = [
    { name: 'Process Type' },
    { name: 'Billing Period / Trading Date' },
    { name: 'Jobs Count' }
  ];

  childColumnItem: tableColumn[] = [
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

  onPageChange(newPageIndex: number): void {
    const currentSize = this.tableData().size || 10;
    this.sfs.refreshJobs({
      page: newPageIndex - 1,
      size: currentSize
    });
  }

  onPageSizeChange(newSize: number): void {
    this.sfs.refreshJobs({
      page: 0,
      size: newSize
    });
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

  //for row color functions
  getParentRowClass(parentIndex: number): string {
    return parentIndex % 2 === 0 ? 'parent-even' : 'parent-odd';
  }

  getChildRowClass(parentIndex: number, childIndex: number): string {
    const parentClass = this.getParentRowClass(parentIndex);
    const childClass = childIndex % 2 === 0 ? 'child-even' : 'child-odd';
    return `${parentClass} ${childClass}`;
  }

  getGrandchildRowClass(parentIndex: number, childIndex: number, grandchildIndex: number): string {
    const parentClass = this.getParentRowClass(parentIndex);
    const childClass = childIndex % 2 === 0 ? 'child-even' : 'child-odd';
    const grandchildClass = grandchildIndex % 2 === 0 ? 'grandchild-even' : 'grandchild-odd';
    return `${parentClass} ${childClass} ${grandchildClass}`;
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

    this.modal.create({
      nzTitle: actionType,
      nzContent: this.runJobs,
      nzOkText: 'Run Job',
      nzCancelText: 'Cancel',
      nzOnOk: () => {
        return new Promise<void>((resolve) => {
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
                const { error } = err;
                this.toast.error(error.message, error.error);
                resolve();
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
    if (lowerStatus.endsWith(MeterDataPipelineProcess.METER_DATA) ||
      lowerStatus.endsWith(MeterDataPipelineProcess.SETTLEMENT_READY)) {
      return 'Settlement - Ready';
    } else if (lowerStatus.endsWith(MeterDataPipelineProcess.GESQ)) {
      return 'Finalize - GESQ';
    }
    return 'Unknown';
  }

  downloadReport(pipeline: meterProcessPipeline): void {
    const pipelineId = pipeline.id;
    this.downloadingReports.add(pipelineId);

    const processType = pipeline.parameters.processType ?? '';
    const isDaily = processType.toUpperCase?.() === 'DAILY';

    const tradingDate = isDaily
      ? this.dfs.formatDate(pipeline.parameters.tradingDate, 'yyyyMMdd')
      : this.dfs.formatDate(pipeline.parameters.endDatetime, 'yyyyMMdd');

    const runDate = this.dfs.formatDate(pipeline.lastModifiedDatetime, 'yyyyMMddHHmmss');
    const user = this.as.currentUser()?.principal.username ?? '';

    const params = {
      version: String(pipeline.id),
      isDaily: String(isDaily),
      status: pipeline.status.replace(/\s/g, ''),
      tradingDate,
      runDate,
      processType,
      user
    };

    this.mpa.downloadReport(params).subscribe({
      next: (response) => {
        const blob = response.body as Blob;
        let fileName = `${processType}_MeteringData_${tradingDate}_${runDate}.zip`; //enforcing default filename base from previous files
        const contentDisposition = response.headers.get('Content-Disposition');
        if (contentDisposition) {
          const match = /filename="?([^"]+)"?/.exec(contentDisposition);
          if (match?.[1]) {
            fileName = match[1];
          }
        }
        saveAs(blob, fileName);
        this.downloadingReports.delete(pipelineId);
      },
      error: (err) => {
        console.error('Download Error:', err);
        this.downloadingReports.delete(pipelineId);
      }
    });
  }

  isDownloadingReport(pipelineId: number): boolean {
    return this.downloadingReports.has(pipelineId);
  }

  consolidate(baseTableData: meterProcessPipeline, pipeline: meterProcessPipelineGroup): void {
    const isAdjustment = pipeline.processType === MeterProcessTypes.ADJUSTMENT;
    const isRerunOptional = [MeterProcessTypes.PRELIMINARY, MeterProcessTypes.FINAL]
      .includes(pipeline.processType) && pipeline?.published;

    const modal = this.modal.create({
      nzTitle: LABELS.CONSOLIDATE,
      nzCentered: true,
      nzContent: ConsolidateComponent,
      nzData: {
        baseTableData: [baseTableData],
        isRerunOptional,
        isAdjustment
      },
      nzWidth: 1500
    });

    modal.afterClose.subscribe(res => {
      if (res) {
        this.sfs.refreshJobs({});
      }
    });

  }
}
