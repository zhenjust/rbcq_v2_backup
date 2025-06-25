import { Component, OnInit, TemplateRef, ViewChild, computed, effect, inject } from '@angular/core';
import { MeterProcessStatus } from '@shared/constants';
import { meterProcessPipelineRuns, meterProcessTable } from '@shared/interfaces';
import { SearchFilterService } from '@shared/services/meterProcess';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ToastrService } from 'ngx-toastr';

interface tableColumn {
  name: string;
}

@Component({
  selector: 'app-table',
  standalone: false,
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss'
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
  tableData = computed(() => this.sfs.jobs() || this.defaultTableData);
  isLoading = computed(() => this.sfs.isLoading());

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
    {name: 'Status'}
  ]

  expandSet = new Set<number>();
  pipelineExpandSet = new Set<string>(); // Changed to string for unique identifiers
  public toast = inject(ToastrService);
  public sfs = inject(SearchFilterService);
  public modal = inject(NzModalService);

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

  // Helper method to check if pipeline is expanded
  isPipelineExpanded(parentIndex: number, pipelineIndex: number): boolean {
    const uniqueKey = `${parentIndex}-${pipelineIndex}`;
    return this.pipelineExpandSet.has(uniqueKey);
  }

  refreshData(): void {
    this.sfs.refreshJobs({});
  }

  openJobModal(pipelineRunData: meterProcessPipelineRuns, refId: number): void {
    console.log(pipelineRunData, refId); 
    this.modal.create({
      nzTitle: 'Run Job',
      nzContent: this.runJobs,
      nzFooter: null
    });
  }
}
