import { Component, computed, effect, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Data } from '@angular/router';
import { settlementPipeline, settlementTableDate } from '@shared/enums/interfaces';
import { RunSettlementService, SearchFilterService } from '@shared/services/settlement';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';

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
export class TableComponent implements OnInit, OnDestroy {
  isLineRentalStatus: boolean = false;
  selectedAction: string = '';
  defaultTableData: settlementTableDate = {
    pipelineGroup: [],
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
  private sfs = inject(SearchFilterService);
  private router = inject(ActivatedRoute);
  private toast = inject(ToastrService);

  tableData = computed(() => this.sfs.jobs() || this.defaultTableData);
  isLoading = computed(() => this.sfs.isLoading());

  constructor(){
    effect(() => {
      const jobs = this.sfs.jobs();
      const error = this.sfs.error();
      const loading = this.sfs.isLoading();

      if (jobs && !loading) {
        this.toast.success('Jobs Loaded!');
      }

      if (error && !loading) {
        this.toast.error('Failed to load jobs', error);
      }
    });
  };

  ngOnInit(): void {
    this.router.data.subscribe((data: Data) => {
      this.isLineRentalStatus = data['isLineRentalStatus'] as boolean;
      this.searchName = data['searchName'] as string;
    });

    this.sfs.fetchJobs({}, this.searchName); // initial load
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getCellValue(data: settlementPipeline, column: tableColumn): string {
    switch (column.key) {
      case 'name':
        return data.name || '';
      case 'tradingDate':
        return data.billingPeriod
          ? `${data.billingStartDate} - ${data.billingEndDate}`
          : data.tradingDate || '';
      case 'pricingCondition':
        return '';
      case 'status':
        return data.status || '';
      case 'progress':
        return '';
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
