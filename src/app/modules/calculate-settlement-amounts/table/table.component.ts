import { Component, OnInit, OnDestroy, effect, computed, inject, ViewChild, TemplateRef, signal, DestroyRef } from '@angular/core';
import { ActivatedRoute, Data } from '@angular/router';
import { Observable, Subject, Subscription } from 'rxjs';
import { JobSelect, PublishSettlement, settlementParams, settlementPipeline, TableColumn, TPL_TABLE_COLUMN } from '@shared/interfaces';
import { RunSettlementService } from '@shared/services/settlement';
import { ToastrService } from 'ngx-toastr';
import { ETA_JOBS, MeterProcessTypes } from '@shared/enums';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { isAfter, isBefore, startOfDay, subDays } from 'date-fns';
import { SettlementService } from '@shared/services/api';
import { LABELS } from '@shared/constants/labels.const';
import { ConfirmWithDescComponent } from '@shared/components/confirm-with-desc/confirm-with-desc.component';
import { MESSAGES } from '@shared/constants/messages.const';
import { DatePipe } from '@angular/common';
import { BaseTableItem, modalConfig, SettlementJobActions, SettlementJobSubActions, SettlementStatus } from '@shared/constants';
import { SearchListBase } from '@shared/services/utils/list.util.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConfirmWithContentComponent } from '@shared/components/confirm-with-content/confirm-with-content.component';

@Component({
  selector: 'app-table',
  standalone: false,
  templateUrl: './table.component.html',
  providers: [DatePipe],
  styleUrl: './table.component.scss',
})
export class TableComponent extends SearchListBase implements OnInit, OnDestroy {

  @ViewChild('runSettlementJobs', { static: true }) runSettlementJobs!: TemplateRef<void>;
  @ViewChild('statusTpl', { static: true }) statusTpl!: TemplateRef<HTMLElement>;
  @ViewChild('nameTpl', { static: true }) nameTpl!: TemplateRef<HTMLElement>;
  @ViewChild('dateTpl') dateTpl!: TemplateRef<HTMLElement>;

  private readonly destroy$ = new Subject<void>();
  private readonly runSettlements = inject(RunSettlementService);
  private readonly router = inject(ActivatedRoute);
  private readonly toast = inject(ToastrService);
  private readonly modal = inject(NzModalService);
  private readonly ss = inject(SettlementService);
  private readonly dp = inject(DatePipe);

  destroyRef$ = inject(DestroyRef);

  isLineRentalStatus = false;
  SettlementStatus = SettlementStatus;
  LABELS = LABELS;
  MESSAGES = MESSAGES;
  settlementJobActions = SettlementJobActions;
  SettlementJobSubActions = SettlementJobSubActions;
  baseTableItem = BaseTableItem;
  searchName = '';
  expandSet = new Set<number>();
  expandableTableCols: TPL_TABLE_COLUMN[] = [];

  private selectedActionsSignal = signal<Map<number, string>>(new Map());
  selectedActions = computed(() => this.selectedActionsSignal());

  public minDate = signal<Date | null>(null);
  public maxDate = signal<Date | null>(null);
  public selectedRange = signal<Date[] | null>(null);

  currentModalData: any | null = null;
  processTypes = MeterProcessTypes;

  override busy$: Subscription;
  override resultsProp = 'pipelineGroup';
  filters: Partial<settlementParams>;

  jobNameRecord: Record<string, ETA_JOBS> = {
    ['generateReserveInputWorkspace']: ETA_JOBS.RTA_GENERATE_INPUT_WORKSPACE,
    ['generateInputWorkspace']: ETA_JOBS.GEN_INPUT_WORKSPACE,
    ['calculateEnergyTradingAmount']: ETA_JOBS.CAL_TRADING_AMOUNTS,
    ['calculateReserveTradingAmount']: ETA_JOBS.CALC_RESERVE_TRADING_AMOUNTS,
    ['generate_reserve_files']: ETA_JOBS.RTA_GENERATE_FILES,
    ['generate_energy_files']: ETA_JOBS.ETA_GENERATE_FILES,
  };

  constructor() {
    super();

    effect(() => {
      const currentJobs = this.tableData || [];
      const currentSelectedActions = this.selectedActions();

      if (currentJobs?.length > 0) {
        const existingIds = new Set(currentJobs?.map(job => job.id));
        const outdatedSelections = Array.from(currentSelectedActions.keys())
          .filter(id => !existingIds.has(id));

        if (outdatedSelections.length > 0) {
          this.selectedActionsSignal.update(actions => {
            const newActions = new Map(actions);
            outdatedSelections.forEach(id => newActions.delete(id));
            return newActions;
          });
        }
      }
    });
  }

  override getListUrl(): Observable<any> {
    return this.ss.search(this.filters, this.searchName, this.tableParams);
  }

  ngOnInit(): void {
    this.router.data.subscribe((data: Data) => {
      this.isLineRentalStatus = data['isLineRentalStatus'] as boolean;
      this.searchName = data['searchName'] as string;
    });

    expandedTableCols[LABELS.NAME].template = this.nameTpl;
    expandedTableCols[LABELS.STATUS].template = this.statusTpl;
    this.expandableTableCols = Object.values(expandedTableCols);
  }

  resetActionSelection(rowData: settlementPipeline): void {
    this.selectedActionsSignal.update(actions => {
      const newActions = new Map(actions);
      newActions.set(rowData.id, '');
      return newActions;
    });
  }

  setActionSelection(rowData: settlementPipeline, value: string): void {
    this.selectedActionsSignal.update(actions => {
      const newActions = new Map(actions);
      newActions.set(rowData.id, value);
      return newActions;
    });
  }

  onActionSelect(selectedValue: string | any, rowData: settlementPipeline): void {
    const actionValue = typeof selectedValue === 'string' ? selectedValue : selectedValue?.toString();
    const label = this.settlementJobActions.find(act => act.value === actionValue)?.label.toString() as string;
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
      // case 'generateInputWorkspace':
      //   this.handleGenerateInputWorkspace(rowData, label);
      //   break;

      // case 'calculateTradingAmount':
      //   this.handleDateRangeAction(
      //     rowData,
      //     ETA_JOBS.CAL_TRADING_AMOUNTS,
      //     'Calculate Energy Trading Amount for the following dates:',
      //     'calculateTradingAmount'
      //   );
      //   break;

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
        this.handleAction(label, rowData, message, null, () => this.runSettlements.finalizeTradingAmounts(rowData))
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
    const okAction$ = () => {
      if (job) {
        this.busy$ = this.runSettlements.etaStlJobs(rowData, job)
          .subscribe(res => {
            const message = res?.message || MESSAGES.SUCCESS_JOB_TRIGGER;
            this.toast.success(message);

            this.search();
          });
      }

      if (api$) {
        api$();
      }
    }

    this.modal.confirm({
      ...modalConfig,
      nzTitle: label,
      nzContent: msg as any,
      nzOnOk: okAction$
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
        .subscribe((res => {
          this.toast.success(res.message);
          this.search();
        }
        ));
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
          value: `${value} to ${value}`
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

  // for 'generateInputWorkspace' action
  handleGenerateInputWorkspace(rowData: settlementPipeline, label: string, action: string): void {
    const { processType, tradingDate, billingStartDate, billingEndDate } = rowData;
    const isDaily = processType === MeterProcessTypes.DAILY;
    const msg = MESSAGES.GENERATE_INPUT_WORKSPACE_TD(isDaily ? tradingDate : `${billingStartDate} to ${billingEndDate}`);
    const jobName = this.jobNameRecord[action];

    this.handleAction(label, rowData, msg, jobName);
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

  clearDateRange(): void {
    this.minDate.set(null);
    this.maxDate.set(null);
    this.selectedRange.set(null);
  }

  handleModalAction(rowData: settlementPipeline, serviceCall: () => void, modalData: any): void {
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
            this.search();
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

  handleDateRangeAction(rowData: settlementPipeline, jobName: ETA_JOBS, actionMessage: string, actionType: string): void {
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
      () => this.runSettlements.etaStlJobs(rowData, jobName),
      {
        ...baseModalData,
        actionMessage,
        actionType
      }
    );
  }

  onExpandChange(id: number, value: boolean): void {
    if (value) {
      this.expandSet.clear();
      this.expandSet.add(id);
    } else {
      this.expandSet.delete(id);
    }

    setTimeout(() => window.dispatchEvent(new Event('resize')), 10);
  }

  /**
   * NEW IMPLEMENTATION FOR ACTIONS
   */

  triggerActionNames = [
    'cancelRun',
    'calculateEnergyTradingAmount',
    'calculateReserveTradingAmount',
    'generate_energy_files',
    'generate_reserve_files',
    'generateInputWorkspace',
    'generateReserveInputWorkspace'
  ];

  triggerAction(action: string, row: any): void {
    const actions: Record<string, () => unknown> = {
      ['cancelRun']: () => this.cancelRun(action, row.id),

      ['calculateEnergyTradingAmount']: () => this.generateInputWorkspace(action, row),
      ['calculateReserveTradingAmount']: () => this.generateInputWorkspace(action, row),
      ['generateInputWorkspace']: () => this.generateInputWorkspace(action, row),
      ['generateReserveInputWorkspace']: () => this.generateInputWorkspace(action, row),

      ['generate_energy_files']: () => this.generateFiles(action, row),
      ['generate_reserve_files']: () => this.generateFiles(action, row),
    };

    actions[action]();
  }

  confirmAction(action: string, message?: string): NzModalRef {
    return this.modal.confirm({
      ...modalConfig,
      nzTitle: this.getActionDetails(action).label,
      nzContent: message || MESSAGES.CONFIRM_ACTION,
    });
  }

  generateInputWorkspace(action: string, row: any): void {
    const isDaily = row.processType === MeterProcessTypes.DAILY;
    const isCalc = ['calculateEnergyTradingAmount', 'calculateReserveTradingAmount'].includes(action);

    if (isDaily) {
      if (isCalc) {
        this.calculate(action, row);
        return;
      }

      this.handleGenerateInputWorkspace(row, LABELS.GENERATE_INPUT_WORKSPACE, action);
      return;
    }

    const dates: Date[] = [new Date(row.billingStartDate), new Date(row.billingEndDate)];

    this.modal.create({
      ...modalConfig,
      nzTitle: this.getActionDetails(action).label,
      nzContent: ConfirmWithContentComponent,
      nzData: { template: this.dateTpl, rowData: row, otherData: {dates} },
      nzOnOk: (comp: ConfirmWithContentComponent) => {
        const dates = comp.nzDataRef?.otherData?.dates;
        if (dates?.length) {
          const [billingStartDate, billingEndDate] = dates;
          row.billingStartDate = billingStartDate;
          row.billingEndDate = billingEndDate;
          const job = this.jobNameRecord[action];

          this.runEtaStlJobs(row, job);
        }
      }
    });
  }

  calculate(action: string, row: any): void {
    const { processType, tradingDate, billingStartDate, billingEndDate } = row;

    const isDaily = processType === MeterProcessTypes.DAILY;
    const msg = MESSAGES.CALCULATE_STL(isDaily ? tradingDate : `${billingStartDate} to ${billingEndDate}`);
    const modal = this.confirmAction(action, msg);
    const job = this.jobNameRecord[action];

    modal.updateConfig({
      nzOnOk: () => this.runEtaStlJobs(row, job)
    });
  }

  generateFiles(action: string, row: any): void {
    const modal = this.confirmAction(action);
    const job = this.jobNameRecord[action];

    modal.updateConfig({
      nzOnOk: () => this.runEtaStlJobs(row, job)
    });
  }

  runEtaStlJobs(row: any, job: ETA_JOBS): void {
    this.busy$ = this.runSettlements.etaStlJobs(row, job)
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe(res => {
        const message = res?.message || MESSAGES.SUCCESS_JOB_TRIGGER;
        this.toast.success(message);
        this.search();
      });
  }

  cancelRun(action: string, id: number): void {
    const modal = this.confirmAction(action);

    modal.updateConfig({
      nzOnOk: () => {
        this.busy$ = this.ss.cancelRun(id)
          .subscribe(() => {
            this.search();
            this.toast.success(MESSAGES.SUCCESS_CANCEL_ITEM('run'));
          });
      }
    });
  }

  getActionDetails(action: string): JobSelect {
    const stlActions = [...SettlementJobActions, ...SettlementJobSubActions];
    const index = stlActions.findIndex(act => act.value === action);

    return stlActions[index];
  }

  /**
   *
   * End of New Implementation for Actions
   *
   * */


  get disabledDateFn() {
    return (date: Date) => this.setDisabledDateRange(date);
  }

  get tableItem(): TableColumn[] {
    return this.baseTableItem.filter(column =>
      column.name !== LABELS.LINE_RENTAL_STATUS || this.isLineRentalStatus
    );
  }

  get nzWidthConfig(): string[] {
    return [
      ...['25px', '100px', '140px', '100px', '180px', '200px'],
      ...(this.isLineRentalStatus ? ['200px'] : []),
      ...['100px', '100px']
    ];
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.selectedActionsSignal.set(new Map());
  }

  createDisabledDate = (rowData: any) => {
    return (current: Date) => {
      return !(isBefore(current, rowData.billingEndDate) && isAfter(current, subDays(rowData.billingStartDate, 1)))
    };
  }

}

const expandedTableCols: Record<string, TPL_TABLE_COLUMN> = {
  [LABELS.NAME]: { label: LABELS.NAME, propName: 'description', type: 'template', width: '180px' },
  [LABELS.RUN_ID]: { label: LABELS.RUN_ID, propName: 'runId', type: 'string', width: '110px' },
  [LABELS.RUN_START]: { label: LABELS.RUN_START, propName: 'runStart', type: 'date', width: '140px', align: 'center' },
  [LABELS.RUN_END]: { label: LABELS.RUN_END, propName: 'runEnd', type: 'date', width: '140px', align: 'center' },
  [LABELS.DURATION]: { label: LABELS.DURATION, propName: 'duration', type: 'string', width: '60px' },
  [LABELS.RUN_BY]: { label: LABELS.RUN_BY, propName: 'runBy', type: 'string', width: '100px' },
  [LABELS.STATUS]: { label: LABELS.STATUS, propName: 'status', type: 'template', width: '100px', align: 'center' }
}
