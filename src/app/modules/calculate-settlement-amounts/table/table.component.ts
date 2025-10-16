import { Component, OnInit, OnDestroy, effect, computed, inject, ViewChild, TemplateRef, signal } from '@angular/core';
import { ActivatedRoute, Data } from '@angular/router';
import { Subject } from 'rxjs';
import { PublishSettlement, settlementPipeline, settlementTableDate } from '@shared/interfaces';
import { RunSettlementService, SearchFilterService } from '@shared/services/settlement';
import { ToastrService } from 'ngx-toastr';
import { ETA_JOBS, MeterProcessTypes } from '@shared/enums';
import { DateFormatterUtilService } from '@shared/services/utils';
import { NzModalService } from 'ng-zorro-antd/modal';
import { isAfter, isBefore, startOfDay } from 'date-fns';
import { SettlementService } from '@shared/services/api';
import { LABELS } from '@shared/constants/labels.const';
import { ConfirmWithDescComponent } from '@shared/components/confirm-with-desc/confirm-with-desc.component';
import { MESSAGES } from '@shared/constants/messages.const';
import { DatePipe } from '@angular/common';

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
  templateUrl: './table.component.html',
  providers: [ DatePipe ]
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
    { label: LABELS.CALCULATE_ENERGY_TRADING_AMOUNT, value: 'calculateEnergyTradingAmount'},
    { label: LABELS.GENERATE_MONTHLY_SUMMARY, value: 'generateMonthlySummary'},
    { label: 'View Calculations', value: 'calculations' },
    { label: 'Validate Input', value: 'validate_input' },
    { label: 'View Validations', value: 'validations' },
    { label: 'Calculate Energy Transaction Allocation', value: 'calculate_transactions'},
    { label: 'Generate Transaction Report', value: 'generate_transac_reports'},
    { label: 'Generate Energy Files', value: 'generate_energy_files'},
    { label: `${LABELS.PUBLISH} ${LABELS.TRANSACTION_REPORT}`, value: 'publish' }
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
  private ss = inject(SettlementService);
  private dp = inject(DatePipe);

  tableData = computed(() => this.sfs.jobs() || this.defaultTableData);
  isLoading = computed(() => this.sfs.isLoading());

  public minDate = signal<Date | null>(null);
  public maxDate = signal<Date | null>(null);
  public selectedRange = signal<Date[] | null>(null);

  @ViewChild('runSettlementJobs', { static: true }) runSettlementJobs!: TemplateRef<void>;
  currentModalData: any | null = null;
  processTypes = MeterProcessTypes;

  constructor(){
    effect(() => {
      const error = this.sfs.error();
      const loading = this.sfs.isLoading();

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

  onActionSelect(selectedValue: string | any, rowData: settlementPipeline): void {
    const actionValue = typeof selectedValue === 'string' ? selectedValue : selectedValue?.toString();

    if (!actionValue || actionValue === '') {
      this.resetActionSelection(rowData);
      return;
    }

    this.setActionSelection(rowData, actionValue);

    const baseModalData = {
      pipeline: rowData,
      tradingDate: rowData.tradingDate,
      billingPeriod: rowData.billingPeriod,
      startDate: rowData.billingStartDate,
      endDate: rowData.billingEndDate,
      processType: rowData.processType
    };

    switch (actionValue) {
      case 'generate':
        this.handleDateRangeAction(
          rowData,
          ETA_JOBS.GEN_INPUT_WORKSPACE,
          'You are going to generate input workspace for the following dates:',
          'generate'
        );
        break;

      case 'calculateEnergyTradingAmount':
        this.handleDateRangeAction(
          rowData,
          ETA_JOBS.CAL_TRADING_AMOUNTS,
          'Calculate Energy Trading Amount for the following dates:',
          'calculateEnergyTradingAmount'
        );
        break;

      case 'generateMonthlySummary':
        this.handleDateRangeAction(
          rowData,
          ETA_JOBS.GEN_MONTHLY_SUMMARY,
          'Generate Monthly Summary for the following dates:',
          'generateMonthlySummary'
        );
        break;

      case 'finalize':
        this.handleModalAction(
          rowData,
          () => this.runSettlements.finalizeTradingAmounts(rowData),
          {
            ...baseModalData,
            actionMessage: 'Finalize Energy Trading Amounts',
            actionType: 'finalize'
          }
        );
        break;

      case 'calculations':
        this.handleModalAction(
          rowData,
          () => this.runSettlements.viewCalculations(rowData),
          {
            ...baseModalData,
            actionMessage: 'View Calculations',
            actionType: 'calculations'
          }
        );
        break;

      case 'validate_input':
        this.handleModalAction(
          rowData,
          () => this.runSettlements.validateInput(rowData),
          {
            ...baseModalData,
            actionMessage: 'Validate Input',
            actionType: 'validate_input'
          }
        );
        break;

      case 'validations':
        this.handleModalAction(
          rowData,
          () => this.runSettlements.viewValidations(rowData),
          {
            ...baseModalData,
            actionMessage: 'View Validations',
            actionType: 'validations'
          }
        );
        break;

      case 'calculate_transactions':
        this.handleModalAction(
          rowData,
          () => this.runSettlements.calculateEnergyTransactionAllocation(rowData),
          {
            ...baseModalData,
            actionMessage: 'Calculate Energy Transaction Allocation',
            actionType: 'calculate_transactions'
          }
        );
        break;

      case 'generate_transac_reports':
        this.handleModalAction(
          rowData,
          () => this.runSettlements.generateTransactionReport(rowData),
          {
            ...baseModalData,
            actionMessage: 'Generate Transaction Report',
            actionType: 'generate_transac_reports'
          }
        );
        break;

      case 'generate_energy_files':
        this.handleModalAction(
          rowData,
          () => this.runSettlements.generateEnergyFiles(rowData),
          {
            ...baseModalData,
            actionMessage: 'Generate Energy Files',
            actionType: 'generate_energy_files'
          }
        );
        break;

      case 'publish':
        this.handlePublishAction(rowData);
        break;
      default:
        this.clearDateRange();
        this.resetActionSelection(rowData);
    }
  }

  handlePublishAction(rowData: settlementPipeline): void {
    const payload: PublishSettlement = {
      stlGroupId: +rowData.workspaceId,
      processType: rowData.processType,
      stlSource: 'ENERGY'
    };

    const api$ = () => {
      this.ss.publish(payload)
        .subscribe((res => this.toast.success(res.message)));
    };

    // test data
    const value = this.dp.transform(new Date(), 'yyyy-MM-dd');

    const nzData = {
      message: MESSAGES.CONFIRM_PUBLISH_ITEM(LABELS.TRANSACTION_REPORT.toLowerCase()),
      okAction: LABELS.PUBLISH,
      descriptions: [
        {
          label: LABELS.DUE_DATE,
          value
        },
        {
          label: `${LABELS.TRADING_DATE}/${LABELS.BILLING_PERIOD}`,
          value:`${value} to ${value}`
        },
      ]
    };

    this.modal.create({
      nzTitle: `${LABELS.PUBLISH} ${LABELS.TRANSACTION_REPORT}`,
      nzContent: ConfirmWithDescComponent,
      nzCentered: true,
      nzFooter: null,
      nzData,
      nzWidth: '600px',
      nzOnOk: () => api$()
    });
  }

  // helper functions
  setDisabledDateRange = (date: Date): boolean => {
    const min = this.minDate();
    const max = this.maxDate();

    if (!min || !max) {
      return false;
    }
    const dateOnly = startOfDay(date);
    const minOnly = startOfDay(min);
    const maxOnly = startOfDay(max);
    return isBefore(dateOnly, minOnly) || isAfter(dateOnly, maxOnly);
  };

  get disabledDateFn() {
    return (date: Date) => this.setDisabledDateRange(date);
  }

  onRangeChange(value: Date[] | null): void {
    if (!value || value.length !== 2) {
      this.selectedRange.set(value);
      return;
    }

    const [start, end] = value;
    if (start && end && isAfter(start, end)) {
      this.selectedRange.set(null);
      return;
    }

    this.selectedRange.set(value);
  }

  private clearDateRange(): void {
    this.minDate.set(null);
    this.maxDate.set(null);
    this.selectedRange.set(null);
  }


  private handleModalAction(rowData: settlementPipeline, serviceCall: () => void, modalData: any): void {
    this.currentModalData = modalData;

    const modalRef = this.modal.create({
      nzContent: this.runSettlementJobs,
      nzCentered: true,
      nzOkText: 'Proceed',
      nzCancelText: 'Cancel',
      nzOnOk: () => {
        return new Promise((resolve, reject) => {
          try {
            serviceCall();
            this.resetActionSelection(rowData);
            this.clearDateRange();
            this.sfs.fetchJobs({}, this.searchName);
            this.toast.success("Jobs Successfully Triggered!");
            resolve(true);
          } catch (error) {
            this.resetActionSelection(rowData);
            this.clearDateRange();
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
      this.clearDateRange();
    });
  }

  private handleDateRangeAction(rowData: settlementPipeline, jobName: ETA_JOBS, actionMessage: string, actionType: string ): void {
    this.clearDateRange();
    
    if (rowData.processType !== MeterProcessTypes.DAILY) {
      const startDate = new Date(rowData.billingStartDate);
      const endDate = new Date(rowData.billingEndDate);

      this.minDate.set(startDate);
      this.maxDate.set(endDate);
      this.selectedRange.set([startDate, endDate]);
    }

    const baseModalData = {
      pipeline: rowData,
      tradingDate: rowData.tradingDate,
      billingPeriod: rowData.billingPeriod,
      startDate: rowData.billingStartDate,
      endDate: rowData.billingEndDate,
      processType: rowData.processType
    };

    this.handleModalAction(
      rowData,
      () => this.runSettlements.etaStlJobs(rowData, this.selectedRange(), jobName),
      {
        ...baseModalData,
        actionMessage,
        actionType
      }
    );
  }
}