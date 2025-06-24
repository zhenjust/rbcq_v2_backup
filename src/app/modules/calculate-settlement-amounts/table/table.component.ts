import { Component, OnInit, OnDestroy, effect, computed, inject } from '@angular/core';
import { ActivatedRoute, Data } from '@angular/router';
import { Subject } from 'rxjs';
import { settlementPipeline, settlementTableDate } from '@shared/interfaces';
import { RunSettlementService, SearchFilterService } from '@shared/services/settlement';
import { ToastrService } from 'ngx-toastr';

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
  defaultTableData: settlementTableDate = {
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
    { name: 'GroupId', key: 'name' },
    { name: 'Run Date and Time', key: 'runStart' },
    { name: 'Process Type', key: 'processType' },
    { name: 'Trading Date', key: 'tradingDate' },
    { name: 'Region', key: 'regionGroup' },
    { name: 'Status', key: 'status' },
    { name: 'Line Rental Status', key: 'lineRentalStatus' },
    { name: 'Progress', key: 'progress' },
    { name: 'Actions', key: 'actions' }
  ];

  settlementJobActions: jobSelect[] = [
    { label: 'Select Action', value: '' },
    { label: 'Generate Input Workspace', value: 'generate' },
    { label: 'Finalize Trading Amounts', value: 'finalize' },
    { label: 'View Calculations', value: 'calculations' },
    { label: 'Validate Input', value: 'validate_input' },
    { label: 'View Validations', value: 'validations' }
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
  public toast = inject(ToastrService);
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

  trackByFn(index: number, item: settlementPipeline): any {
    return item.name || index;
  }

  getCellValue(data: settlementPipeline, column: tableColumn): string {
    switch (column.key) {
      case 'name':
        return data.name || '';
      case 'runStart':
        return data.runStart || '';
      case 'processType':
        return data.parameters?.processType || '';
      case 'tradingDate':
        return data.parameters?.billingPeriod 
          ? `${data.parameters.startDatetime} - ${data.parameters.endDatetime}`
          : data.parameters?.tradingDate || '';
      case 'regionGroup':
        return data.parameters?.regionGroup || '';
      case 'status':
        return data.status || '';
      case 'lineRentalStatus':
        return data?.lineRentalStatus || '';
      case 'progress':
        return data?.progress || '';
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
      case 'generate':
        this.runSettlements.generateInputWorkspace(rowData);
        break;
      case 'finalize':
        this.runSettlements.finalizeTradingAmounts(rowData);
        break;
      case 'calculations':
        this.runSettlements.viewCalculations(rowData);
        break;
      case 'validate_input':
        this.runSettlements.validateInput(rowData);
        break;
      case 'validations':
        this.runSettlements.viewValidations(rowData);
        break;
      default:
        console.warn('Unknown action:', actionValue);
    }
  }
}