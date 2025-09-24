import { Component, OnInit, OnDestroy, effect, computed, inject, ViewChild, TemplateRef, signal } from '@angular/core';
import { ActivatedRoute, Data } from '@angular/router';
import { Subject } from 'rxjs';
import { settlementPipeline, settlementTableDate } from '@shared/interfaces';
import { RunSettlementService, SearchFilterService } from '@shared/services/settlement';
import { ToastrService } from 'ngx-toastr';
import { MeterProcessTypes } from '@shared/enums';
import { DateFormatterUtilService } from '@shared/services/utils';
import { NzModalService } from 'ng-zorro-antd/modal';

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
    { name: 'Workspace ID', key: 'workspaceId' },
    { name: 'Run Date and Time', key: 'runDatetime' },
    { name: 'Process Type', key: 'processType' },
    { name: 'Trading Date', key: 'tradingDate' },
    { name: 'Status', key: 'status' },
    { name: 'Line Rental Status', key: 'lineRentalStatus' },
    { name: 'Progress', key: 'progress' },
    { name: 'Actions', key: 'actions' }
  ];

  settlementJobActions: jobSelect[] = [
    { label: 'Select Action', value: '' },
    { label: 'Generate Input Workspace', value: 'generate' },
    { label: 'Finalize Energy Trading Amounts', value: 'finalize' },
    { label: 'View Calculations', value: 'calculations' },
    { label: 'Validate Input', value: 'validate_input' },
    { label: 'View Validations', value: 'validations' },
    { label: 'Calculate Energy Transaction Allocation', value: 'calculate_transactions'},
    { label: 'Generate Transaction Report', value: 'generate_transac_reports'},
    { label: 'Generate Energy Files', value: 'generate_energy_files'}
  ];

  private selectedActionsSignal = signal<Map<string, string>>(new Map());
  selectedActions = computed(() => this.selectedActionsSignal());

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
  public modal = inject(NzModalService);
  private dfs = inject(DateFormatterUtilService);
  tableData = computed(() => this.sfs.jobs() || this.defaultTableData);
  isLoading = computed(() => this.sfs.isLoading());

  @ViewChild('runSettlementJobs', { static: true }) runSettlementJobs!: TemplateRef<void>;
  currentModalData: any | null = null;

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

    effect(() => {
      const currentJobs = this.tableData().pipelineGroup;
      const currentSelectedActions = this.selectedActions();
      
      if (currentJobs.length > 0) {
        const existingWorkspaceIds = new Set(currentJobs.map(job => job.workspaceId));
        const outdatedSelections = Array.from(currentSelectedActions.keys())
          .filter(workspaceId => !existingWorkspaceIds.has(workspaceId));
        
        if (outdatedSelections.length > 0) {
          this.selectedActionsSignal.update(actions => {
            const newActions = new Map(actions);
            outdatedSelections.forEach(workspaceId => newActions.delete(workspaceId));
            return newActions;
          });
        }
      }
    });
  }

  ngOnInit(): void {
    this.router.data.subscribe((data: Data) => {
      this.isLineRentalStatus = data['isLineRentalStatus'] as boolean;
      this.searchName = data['searchName'] as string;
    });
    this.sfs.fetchJobs({}, this.searchName);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.selectedActionsSignal.set(new Map());
  }

  trackByFn(index: number, item: settlementPipeline): any {
    return item.workspaceId || item.name || index;
  }

  getSelectedAction(rowData: settlementPipeline): string {
    return this.selectedActions().get(rowData.workspaceId) || '';
  }

  private resetActionSelection(rowData: settlementPipeline): void {
    this.selectedActionsSignal.update(actions => {
      const newActions = new Map(actions);
      newActions.set(rowData.workspaceId, '');
      return newActions;
    });
  }

  private setActionSelection(rowData: settlementPipeline, value: string): void {
    this.selectedActionsSignal.update(actions => {
      const newActions = new Map(actions);
      newActions.set(rowData.workspaceId, value);
      return newActions;
    });
  }

  clearAllActionSelections(): void {
    this.selectedActionsSignal.set(new Map());
  }

  getCellValue(data: settlementPipeline, column: tableColumn): string {
    switch (column.key) {
      case 'workspaceId':
        return data.workspaceId;
      case 'runDatetime':
        return this.dfs.formatDateTime(data.runDatetime);
      case 'processType':
        return data.processType === MeterProcessTypes.ADJUSTMENT ? `${data.processType} ${data.adjNo}` : data.processType;
      case 'tradingDate':
        return data.billingPeriod 
          ? `${data.billingStartDate} - ${data.billingEndDate}`
          : data.tradingDate || '';
      case 'status':
        return data.status;
      case 'lineRentalStatus':
        return data?.lineRentalStatus || '';
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

  private handleModalAction(rowData: settlementPipeline, serviceCall: () => void, modalData: any): void {
    this.currentModalData = modalData;
    
    const modalRef = this.modal.create({
      nzContent: this.runSettlementJobs,
      nzOkText: 'Proceed',
      nzCancelText: 'Cancel',
      nzOnOk: () => {
        return new Promise((resolve, reject) => {
          try {
            serviceCall();
            this.resetActionSelection(rowData);
            resolve(true);
          } catch (error) {
            this.toast.error('Action failed', 'Please try again');
            this.resetActionSelection(rowData);
            reject(error);
          }
        });
      },
      nzOnCancel: () => {
        this.currentModalData = null;
        this.resetActionSelection(rowData);
      },
      nzMaskClosable: false
    });

    modalRef.afterClose.subscribe(() => {
      this.currentModalData = null;
      this.resetActionSelection(rowData);
    });
  }

  private handleDirectAction(rowData: settlementPipeline, serviceCall: () => void): void {
    try {
      serviceCall();
      this.resetActionSelection(rowData);
    } catch (error) {
      this.toast.error('Action failed', 'Please try again');
      this.resetActionSelection(rowData);
      console.error('Direct action error:', error);
    }
  }

  onActionSelect(selectedValue: string | any, rowData: settlementPipeline): void {
    const actionValue = typeof selectedValue === 'string' ? selectedValue : selectedValue?.toString();
    
    if (!actionValue || actionValue === '') {
      this.resetActionSelection(rowData);
      return;
    }
    
    this.setActionSelection(rowData, actionValue);

    switch (actionValue) {
      case 'generate':
        this.handleModalAction(
          rowData,
          () => this.runSettlements.generateInputWorkspace(rowData),
          {
            pipeline: rowData,
            actionType: 'You are going to generate input workspace for the following dates:',
            tradingDate: rowData.tradingDate,
            billingPeriod: rowData.billingPeriod,
            startDate: rowData.billingStartDate,
            endDate: rowData.billingEndDate
          }
        );
        break;

      case 'finalize':
        this.handleDirectAction(rowData, () => this.runSettlements.finalizeTradingAmounts(rowData));
        break;

      case 'calculations':
        this.handleDirectAction(rowData, () => this.runSettlements.viewCalculations(rowData));
        break;

      case 'validate_input':
        this.handleDirectAction(rowData, () => this.runSettlements.validateInput(rowData));
        break;

      case 'validations':
        this.handleDirectAction(rowData, () => this.runSettlements.viewValidations(rowData));
        break;

      case 'calculate_transactions':
        this.handleDirectAction(rowData, () => this.runSettlements.calculateEnergyTransactionAllocation(rowData));
        break;

      case 'generate_transac_reports':
        this.handleDirectAction(rowData, () => this.runSettlements.generateTransactionReport(rowData));
        break;

      case 'generate_energy_files':
        this.handleDirectAction(rowData, () => this.runSettlements.generateEnergyFiles(rowData));
        break;

      default:
        console.warn('Unknown action:', actionValue);
        this.resetActionSelection(rowData);
        this.toast.warning('Unknown action selected', 'Please select a valid action');
    }
  }
}