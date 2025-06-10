import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Data } from '@angular/router';
import { settlementPipeline, settlementTableDate } from '@shared/interfaces';
import { RunSettlementService, SearchFilterService } from '@shared/services/settlement';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';

interface tableColumn {
  name: string;
  key: string;
}

interface jobSelect {
  label: string,
  value: string
}

@Component({
  selector: 'app-table',
  standalone: false,
  templateUrl: './table.component.html'
})
export class TableComponent implements OnInit {
  isLineRentalStatus: boolean = false;
  isLoading: boolean = false;
  selectedAction: string = '';
  tableData: settlementTableDate = {
    pipelines: [],
    first: true,
    last: false,
    number: 0,
    numberOfElements: 0,
    size: 0,
    totalElements: 0,
    totalPages: 0
  };
  searchName: string = '';
  private baseTableItem: tableColumn[] = [
    { name: 'Trading Date', key: 'tradingDate' },
    { name: 'GroupId', key: 'name' },
    { name: 'Pricing Condition', key: 'pricingCondition'},
    { name: 'Status', key: 'status' },
    { name: 'Progress', key: 'progress' },
    { name: 'Actions', key: 'actions' }
  ];

  settlementJobActions: jobSelect[] = [
    { label: 'Select Action', value: '' },
    { label: 'Generate Run Summary', value: 'run_summary' },
    { label: 'Generate File', value: 'generate_files' },
    { label: 'Publish Transaction Report', value: 'publish_transaction_report' }
  ]

  get tableItem(): tableColumn[] {
    return this.baseTableItem.filter(column => 
      column.name !== 'Line Rental Status' || this.isLineRentalStatus
    );
  }
  private destroy$ = new Subject<void>();

  private runSettlements = inject(RunSettlementService);

  constructor(
    private router: ActivatedRoute,
    public toast: ToastrService,
    private sfs: SearchFilterService
  ){};

  ngOnInit(): void {
    this.router.data.subscribe((data: Data) => {
      this.isLineRentalStatus = data['isLineRentalStatus'] as boolean;
      this.searchName = data['searchName'] as string;
    });

    this.sfs.fetchJobs({}, this.searchName); // initial load

    this.sfs.jobs$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          if (data) {
            this.tableData = data;
          }
        },
        error: (error) => {
          this.toast.error(error.message);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackByFn(index: number, item: any): any {
    return item.id || item.name || index;
  }

  getCellValue(data: settlementPipeline, column: tableColumn): string {
    switch (column.key) {
      case 'name':
        return data.name || '';
      case 'tradingDate':
        return data.parameters?.billingPeriod 
          ? `${data.parameters.startDatetime} - ${data.parameters.endDatetime}`
          : data.parameters?.tradingDate || '';
      case 'pricingCondition':
        return data.parameters?.pricingCondition ? data.parameters?.pricingCondition : ''; 
      case 'status':
        return data.status || '';
      case 'progress':
        return data.progress || '';
      case 'actions':
        return '';
      default:
        return '';
    }
  }

  isActionColumn(column: tableColumn): boolean {
    return column.key === 'actions';
  }

  onActionSelect(selectedValue: string | any, rowData: settlementPipeline): void {
    const actionValue = typeof selectedValue === 'string' ? selectedValue : selectedValue?.toString();
    if (!actionValue || actionValue === '') {
      return;
    }
    
    switch (actionValue) {
      case 'run_summary':
        this.runSettlements.runSummary(rowData);
        break;
      case 'generate_files':
        this.runSettlements.generateFiles(rowData);
        break;
      case 'publish_transaction_report':
        this.runSettlements.publishTransactionReports(rowData);
        break;
      default:
        console.warn('Unknown action:', actionValue);
    }
  }
}
