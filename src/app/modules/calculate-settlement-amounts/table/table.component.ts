import { Component, OnInit, OnDestroy, effect, computed, inject, ViewChild, TemplateRef, signal } from '@angular/core';
import { ActivatedRoute, Data } from '@angular/router';
import { Subject } from 'rxjs';
import { PublishSettlement, settlementPipeline, TableColumn, TPL_TABLE_COLUMN } from '@shared/interfaces';
import { RunSettlementService, SearchFilterService } from '@shared/services/settlement';
import { ToastrService } from 'ngx-toastr';
import { ETA_JOBS, MeterProcessTypes } from '@shared/enums';
import { NzModalService } from 'ng-zorro-antd/modal';
import { isAfter, isBefore, startOfDay } from 'date-fns';
import { SettlementService } from '@shared/services/api';
import { LABELS } from '@shared/constants/labels.const';
import { ConfirmWithDescComponent } from '@shared/components/confirm-with-desc/confirm-with-desc.component';
import { MESSAGES } from '@shared/constants/messages.const';
import { DatePipe } from '@angular/common';
import { BaseTableItem, DefaultTableData, modalConfig, SettlementJobActions, SettlementStatus } from '@shared/constants';

@Component({
  selector: 'app-table',
  standalone: false,
  templateUrl: './table.component.html',
  providers: [ DatePipe ]
})
export class TableComponent implements OnInit, OnDestroy {

  @ViewChild('runSettlementJobs', { static: true }) runSettlementJobs!: TemplateRef<void>;
  @ViewChild('statusTpl', { static: true }) statusTpl!: TemplateRef<HTMLElement>;

  isLineRentalStatus: boolean = false;
  LABELS = LABELS;
  settlementJobActions = SettlementJobActions;
  baseTableItem = BaseTableItem;
  defaultTableData = DefaultTableData;
  searchName: string = '';
  expandSet = new Set<number>();
  expandableTableCols: TPL_TABLE_COLUMN[] = [];

  private selectedActionsSignal = signal<Map<string, string>>(new Map());
  selectedActions = computed(() => this.selectedActionsSignal());

  tableData = computed(() => this.sfs.jobs() || this.defaultTableData);
  isLoading = computed(() => this.sfs.isLoading());


  private destroy$ = new Subject<void>();
  private runSettlements = inject(RunSettlementService);
  private sfs = inject(SearchFilterService);
  private router = inject(ActivatedRoute);
  public toast = inject(ToastrService);
  public modal = inject(NzModalService);
  private ss = inject(SettlementService);
  private dp = inject(DatePipe);

  public minDate = signal<Date | null>(null);
  public maxDate = signal<Date | null>(null);
  public selectedRange = signal<Date[] | null>(null);

  currentModalData: any | null = null;
  processTypes = MeterProcessTypes;
  SettlementStatus = SettlementStatus;

  constructor() {
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

    expandedTableCols[LABELS.STATUS].template = this.statusTpl;
    this.expandableTableCols = Object.values(expandedTableCols);
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

  onActionSelect(selectedValue: string | any, rowData: settlementPipeline): void {
    const actionValue = typeof selectedValue === 'string' ? selectedValue : selectedValue?.toString();
    const label = this.settlementJobActions.find(act => act.value === actionValue)?.label.toString();
    const processType = rowData.processType;

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
      processType
    };

    switch (actionValue) {
      case 'generate':
        this.handleGenerate(rowData, label as string);
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

      case 'finalize': {
        const message = MESSAGES.CONFIRM_SETTLEMENT_MSG(label?.toLowerCase() as string);
        this.handleAction(label as string, rowData, message, null, () => this.runSettlements.finalizeTradingAmounts(rowData))
        break;
      }

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

  // for handling of actions; new implementation of modal
  handleAction(label: string, rowData: settlementPipeline, msg: string | TemplateRef<HTMLElement>, job?: ETA_JOBS | null, api$?: () => any): void {
    this.modal.confirm({
      ...modalConfig,
      nzTitle: label,
      nzContent: msg as any,
      nzOnOk: () => {
        if (job) {
          this.runSettlements.etaStlJobs(rowData, null, job);
        }

        if (api$) {
          api$();
        }

        this.sfs.fetchJobs({}, this.searchName);
        this.toast.success(MESSAGES.SUCCESS_JOB_TRIGGER);
      }
    });
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

  // for 'generate' action
  handleGenerate(rowData: settlementPipeline, label: string): void {
    const { processType, tradingDate, billingStartDate, billingEndDate } = rowData;
    const isDaily = processType === MeterProcessTypes.DAILY;
    const msg = MESSAGES.GENERATE_INPUT_WORKSPACE_TD(isDaily ? tradingDate : `${billingStartDate} to ${billingEndDate}`);

    this.handleAction(label, rowData, msg, ETA_JOBS.GEN_INPUT_WORKSPACE);
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

  confirmAction(nzTitle: string, nzContent: string): void {
    this.modal.confirm({
      nzTitle,
      nzContent,

    })
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

  onExpandChange(id: number, value: boolean): void {
    if (value) {
      this.expandSet.add(id);
    } else {
      this.expandSet.delete(id);
    }

    setTimeout(() => window.dispatchEvent(new Event('resize')), 10);
  }

  get tableItem(): TableColumn[] {
    return this.baseTableItem.filter(column =>
      column.name !== 'Line Rental Status' || this.isLineRentalStatus
    );
  }

  get nzWidthConfig(): string[] { return ['25px', '120px', '160px', '150px', '200px', '200px', '200px', '100px', '150px']; }
}

const expandedTableCols: Record<string, TPL_TABLE_COLUMN> = {
  [LABELS.NAME]: { label: LABELS.NAME, propName: 'name', width: '240px' },
  [LABELS.RUN_ID]: { label: LABELS.RUN_ID, propName: 'runId', type: 'string', width: '180px' },
  [LABELS.RUN_START]: { label: LABELS.RUN_START, propName: 'runStart', type: 'date', width: '100px' },
  [LABELS.RUN_END]: { label: LABELS.RUN_END, propName: 'runEnd', type: 'date', width: '100px' },
  [LABELS.DURATION]: { label: LABELS.DURATION, propName: 'duration', type: 'string', width: '60px' },
  [LABELS.RUN_BY]: { label: LABELS.RUN_BY, propName: 'runBy', type: 'string', width: '100px'},
  [LABELS.STATUS]: { label: LABELS.STATUS, propName: 'status', type: 'template', width: '100px' }
}
