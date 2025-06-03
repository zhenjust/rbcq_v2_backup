import { Component, OnInit } from '@angular/core';
import { meterProcessTable, meterProcessPipeline } from '@shared/interfaces';
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
  tableData: meterProcessTable = {
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
  
  isLoading: boolean = false;
  
  columnItem: tableColumn[] = [
    { name: 'Process Type' },
    { name: 'Billing Period / Trading Date' },
    { name: 'Jobs Count' }
  ];
  
  childColumnItem: tableColumn[] = [
    { name: 'Job Name' },
    { name: 'Run ID' },
    { name: 'Run Date and Time' },
    { name: 'Process Type' },
    { name: 'Trading Date' },
    { name: 'Region Group' },
    { name: 'MTN' },
    { name: 'Status' },
    { name: 'Progress' },
    { name: 'Actions' }
  ];
  
  expandSet = new Set<number>();

  onExpandChange(checked: boolean, index: number): void {
    if (checked) {
      this.expandSet.add(index);
    } else {
      this.expandSet.delete(index);
    }
  }

  formatDateTime(dateString: string): string {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  }

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

  // Helper method to get progress status
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

  // Method to refresh data
  refreshData(): void {
    this.isLoading = true;
    this.searchFilterService.refreshJobs({});
  }

  constructor(
    public toast: ToastrService,
    private searchFilterService: SearchFilterService
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.searchFilterService.refreshJobs({});

    this.searchFilterService.jobs$.subscribe({
      next: (data) => {
        if (data) {
          this.tableData = data;
          this.isLoading = false
          this.toast.success('Jobs Loaded!');
        }
      },
      error: (error) => {
        this.isLoading = false
        this.toast.error('Failed to load jobs');
      }
    });
  }
}