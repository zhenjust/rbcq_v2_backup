import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Data } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { settlementPipeline, settlementTableDate } from '@shared/interfaces';
import { SearchFilterService } from '@shared/services/settlement';
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
  isLoading: boolean = false;
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
        this.generateInputWorkspace(rowData);
        break;
      case 'finalize':
        this.finalizeTradingAmounts(rowData);
        break;
      case 'calculations':
        this.viewCalculations(rowData);
        break;
      case 'validate_input':
        this.validateInput(rowData);
        break;
      case 'validations':
        this.viewValidations(rowData);
        break;
      default:
        console.warn('Unknown action:', actionValue);
    }
  }

  private generateInputWorkspace(data: settlementPipeline): void {
    console.log('Generate Input Workspace - Full row data:', data);
  }

  private finalizeTradingAmounts(data: settlementPipeline): void {
    console.log('Finalize Trading Amounts - Full row data:', data);
  }

  private viewCalculations(data: settlementPipeline): void {
    console.log('View Calculations - Full row data:', data);
  }

  private validateInput(data: settlementPipeline): void {
    console.log('Validate Input - Full row data:', data);
  }

  private viewValidations(data: settlementPipeline): void {
    console.log('View Validations - Full row data:', data);
  }
}