import { Component, OnInit, computed, effect, inject } from '@angular/core';
import { meterProcessTable } from '@shared/interfaces';
import { SearchFilterService } from '@shared/services/meterProcess';
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

  tableData = computed(() => this.sfs.jobs() || this.defaultTableData);
  isLoading = computed(() => this.sfs.isLoading());

  columnItem: tableColumn[] = [
    { name: 'Process Type' },
    { name: 'Billing Period / Trading Date' },
    { name: 'Jobs Count' }
  ];

  childColumnItem: tableColumn[] = [
    { name: 'Workspace ID' },
    { name: 'Last Activity Datetime' },
    { name: 'Last Activity By' },
    { name: 'Process Type' },
    { name: 'Start Date Time' },
    { name: 'End Date Time' },
    { name: 'MTN' },
    { name: 'Status' },
    { name: 'Progress' },
    { name: 'Actions' }
  ];

  expandSet = new Set<number>();
  public toast = inject(ToastrService);
  public sfs = inject(SearchFilterService);

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

  refreshData(): void {
    this.sfs.refreshJobs({});
  }

  formatDateTime(dateString: string): string {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  }

  //addtnl methods
  getStatusColor(status: string): string {
    const statusColors: { [key: string]: string } = {
      'RUNNING': 'processing',
      'COMPLETED': 'success',
      'FAILED': 'error',
      'PENDING': 'default',
      'CANCELLED': 'warning'
    };
    return statusColors[status?.toUpperCase()] || 'default';
  }

  getProgressStatus(status: string): 'success' | 'exception' | 'active' | 'normal' {
    const statusMap: { [key: string]: 'success' | 'exception' | 'active' | 'normal' } = {
      'COMPLETED': 'success',
      'FAILED': 'exception',
      'RUNNING': 'active',
      'PENDING': 'normal',
      'CANCELLED': 'exception'
    };
    return statusMap[status?.toUpperCase()] || 'normal';
  }
}
