import { Component, OnInit } from '@angular/core';
import { meterProcessParams, meterProcessSearch, meterProcessTableData } from '@shared/interfaces';
import { MeterprocessService } from '@shared/services/api';
import { SearchFilterService } from '@shared/services/meterProcess';
import { ToastrService } from 'ngx-toastr';

interface tableColumn {
  name: string,
} 
@Component({
  selector: 'app-table',
  standalone: false,
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss'
})
export class TableComponent implements OnInit {
  tableData: meterProcessSearch | any = {};
  meterProcessParams: meterProcessParams = {};
  isLoading: boolean = false;
  columnItem: tableColumn[] = [
    {
      name: 'Process Type'
    },
    {
      name: 'Billing Period / Trading Date'
    },
    {
      name: 'Actions'
    },
  ]
  childColumnItem: tableColumn[] = [
    {
      name: 'Job ID'
    },
    {
      name: 'Job ID'
    },
    {
      name: 'Run Date and Time'
    },
    {
      name: 'Process Type'
    },
    {
      name: 'Trading Date'
    },
    {
      name: 'Region Group'
    },
    {
      name: 'MTN'
    },
    {
      name: 'Status'
    },
    {
      name: 'Progress'
    },
    {
      name: 'Action'
    }
  ];
  expandSet = new Set<number>();

  onExpandChange(id: number, checked: boolean): void {
    if (checked) {
      this.expandSet.add(id);
    } else {
      this.expandSet.delete(id);
    }
  }

  trackByBillingPeriod(index: number, item: meterProcessTableData): number {
    return item.billingPeriod;
  }

  constructor(
    private mp: MeterprocessService,
    public toast: ToastrService,
    private searchFilterService: SearchFilterService
  ) {}

  fetchJobs(params: meterProcessParams): void {
    this.isLoading = true
    return this.mp.search(params ? params : this.meterProcessParams).subscribe({
      next: (data) => [this.tableData = data, this.toast.success('Jobs Loaded!')],
      error: (error) => this.toast.error(error.message)
    }).add(() => {this.isLoading = false});
  }

  ngOnInit(): void {
    this.fetchJobs({}); 

    this.searchFilterService.jobs$.subscribe({
      next: (data) => {
        if (data) {
          this.tableData = data;
          this.toast.success('Filtered Jobs Loaded!');
        }
      },
      error: (error) => {
        this.toast.error('Failed to load filtered jobs');
      }
    });
  }

  formatBillingDate(dateString: string): string {
      const yearSuffix = dateString.substring(0, 2);
      const month = dateString.substring(2, 4);
      const day = dateString.substring(4, 6);
      const year = `20${yearSuffix}`;
      const formattedDate = `${year}-${month}-${day}`;
      return formattedDate;
  }
}