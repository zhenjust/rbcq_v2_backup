import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  OnDestroy,
  OnInit,
  signal,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { ActivatedRoute, Data } from '@angular/router';
import { BehaviorSubject, finalize, exhaustMap, merge, Observable, Subject, Subscription, switchMap, timer } from 'rxjs';
import {
  JobSelect,
  PublishSettlement,
  settlementParams,
  settlementPipeline,
  TableColumn,
  TPL_TABLE_COLUMN
} from '@shared/interfaces';
import { RunSettlementService } from '@shared/services/settlement';
import { ToastrService } from 'ngx-toastr';
import { MeterProcessTypes } from '@shared/enums';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { isAfter, isBefore, setHours, startOfDay, subDays } from 'date-fns';
import { SettlementService } from '@shared/services/api';
import { LABELS } from '@shared/constants/labels.const';
import { MESSAGES } from '@shared/constants/messages.const';
import { DatePipe } from '@angular/common';
import {
  BaseTableItem,
  modalConfig,
  SettlementJobActions,
  SettlementJobSubActions
} from '@shared/constants';
import { SearchListBase } from '@shared/services/utils/list.util.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConfirmWithContentComponent } from '@shared/components/confirm-with-content/confirm-with-content.component';
import { StlUtilitiesService } from '@shared/services/utils/stl-actions.util.service';

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
  private readonly stlUtil = inject(StlUtilitiesService);
  destroyRef$ = inject(DestroyRef);

  isLineRentalStatus = false;
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

  pollingTime = signal<number>(60000);
  private reload$ = new Subject<void>();
  private pollingTime$ = new BehaviorSubject<number>(this.pollingTime());
  url$: Observable<any>;
  loadingTable = signal<boolean>(false);
  isFirstLoad = true;

  constructor() {
    super();

    this.pollingTime$.next(this.pollingTime());
    effect(() => {
      this.pollingTime$.next(this.pollingTime());
    });

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

    this.url$ = this.getListUrl();
  }

  override getListUrl(): Observable<any> {
    const polling$ = this.pollingTime$.pipe(
      switchMap(interval => {
        return timer(0, interval)
      })
    );

    return merge(polling$, this.reload$)
      .pipe(exhaustMap(() => {
        if (this.isFirstLoad) {
          this.loadingTable.set(true);
        }

        return this.ss.search(this.filters, this.searchName, this.tableParams)
          .pipe(
            takeUntilDestroyed(this.destroyRef$),
            finalize(() => {
              this.loadingTable.set(false);
              this.isFirstLoad = false;
            })
          )
      }
      ),
      // shareReplay(1)
    );
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

  // for handling of actions; new implementation of modal
  handleAction(label: string, rowData: settlementPipeline, msg: string | TemplateRef<HTMLElement>, action: string, api$?: () => any): void {
    const okAction$ = () => {
      this.loadingTable.set(true);
      this.runSettlements.etaStlJobs(rowData, action)
        .pipe(finalize(() => this.loadingTable.set(false)))
        .subscribe(res => {
          const message = res?.message || MESSAGES.SUCCESS_JOB_TRIGGER;
          this.toast.success(message);

          this.reload$.next();
        });

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
  triggerAction(action: string, row: any): void {
    const actions: Record<string, () => unknown> = {
      ['cancelRun']: () => this.cancelRun(action, row.id),

      ['energyTradingAmounts-generateInputWorkspace']: () => this.runJobWithDateSelection(action, row),
      ['reserveTradingAmounts-generateInputWorkspace']: () => this.runJobWithDateSelection(action, row),

      ['energyTradingAmounts-calculateTradingAmount']: () => this.runJobWithDateSelection(action, row),
      ['reserveTradingAmounts-calculateTradingAmount']: () => this.runJobWithDateSelection(action, row),

      ['energyTradingAmounts-calculateMSummary']: () => this.runJobWithConfirmation(action, row),
      ['reserveTradingAmounts-calculateMSummary']: () => this.runJobWithConfirmation(action, row),

      ['reserveTradingAmounts-calculateGmrVat']: () => this.runJobWithConfirmation(action, row),
      ['energyTradingAmounts-calculateGmrVat']: () => this.runJobWithConfirmation(action, row),

      ['reserveTradingAmounts-finalize']: () => this.runJobWithConfirmation(action, row),
      ['energyTradingAmounts-finalize']: () => this.runJobWithConfirmation(action, row),

      /**
       *
       * Temporarily commented; always use trigger alloc modal
       */
      // ['energyTradingAmounts-calculateTransAlloc']: () => row.processType === MeterProcessTypes.PRELIM ? this.runJobWithConfirmation(action, row) : this.stlUtil.triggerAllocModal(action, row, () => this.reload$.next()),
      // ['reserveTradingAmounts-calculateTransAlloc']: () => row.processType === MeterProcessTypes.PRELIM ? this.runJobWithConfirmation(action, row) : this.stlUtil.triggerAllocModal(action, row, () => this.reload$.next()),

      ['energyTradingAmounts-calculateTransAlloc']: () => this.stlUtil.triggerAllocModal(action, row, () => this.reload$.next()),
      ['reserveTradingAmounts-calculateTransAlloc']: () => this.stlUtil.triggerAllocModal(action, row, () => this.reload$.next()),

      ['energyTradingAmounts-generateTransactionReport']: () => this.generateFiles(action, row),
      ['reserveTradingAmounts-generateTransactionReport']: () => this.generateFiles(action, row),

      ['energyTradingAmounts-generateFiles']: () => this.generateFiles(action, row),
      ['reserveTradingAmounts-generateFiles']: () => this.generateFiles(action, row),

      ['energyTradingAmounts-publish']: () => this.handlePublishAction('Energy Trading Amounts Calculation', row),
      ['reserveTradingAmounts-publish']: () => this.handlePublishAction('Reserve Trading Amounts Calculation', row),
      ['sendNotification']: () => this.stlUtil.sendNotification(row)

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

  runJobWithDateSelection(action: string, row: any): void {
    const isDaily = row.processType === MeterProcessTypes.DAILY;
    const isCalc = ['energyTradingAmounts-calculateTradingAmount', 'reserveTradingAmounts-calculateTradingAmount'].includes(action);

    if (isDaily) {
      const { processType, tradingDate, billingStartDate, billingEndDate } = row;
      const isDaily = processType === MeterProcessTypes.DAILY;
      if (isCalc) {
        const msg = MESSAGES.CALCULATE_STL(isDaily ? tradingDate : `${billingStartDate} to ${billingEndDate}`);
        const modal = this.confirmAction(action, msg);
        modal.updateConfig({
          nzOnOk: () => this.runEtaStlJobs(row, action)
        });
      } else {
        const msg = MESSAGES.GENERATE_INPUT_WORKSPACE_TD(isDaily ? tradingDate : `${billingStartDate} to ${billingEndDate}`);
        this.handleAction(LABELS.GENERATE_INPUT_WORKSPACE, row, msg, action);
      }
      return;
    }

    const dates: Date[] = [new Date(row.billingStartDate), new Date(row.billingEndDate)];

    this.modal.create({
      ...modalConfig,
      nzTitle: this.getActionDetails(action).label,
      nzContent: ConfirmWithContentComponent,
      nzData: { template: this.dateTpl, rowData: row, otherData: {dates}, okAction: LABELS.PROCEED },
      nzOnOk: (comp: ConfirmWithContentComponent) => {
        const dates = comp.nzDataRef?.otherData?.dates;

        if (dates?.length) {
          const [billingStartDate, billingEndDate] = dates;
          row.billingStartDate = billingStartDate;
          row.billingEndDate = billingEndDate;

          this.runEtaStlJobs(row, action);
          return true;
        } else {
          return false;
        }
      }
    });
  }

  generateFiles(action: string, row: any): void {
    const modal = this.confirmAction(action);

    modal.updateConfig({
      nzOnOk: () => this.runEtaStlJobs(row, action)
    });
  }

  runJobWithConfirmation(action: string, row: any): void {
    const modal = this.confirmAction(action);

    modal.updateConfig({
      nzOnOk: () => this.runEtaStlJobs(row, action)
    });
  }

  runEtaStlJobs(row: any, action: string): void {
    this.loadingTable.set(true);
    this.runSettlements.etaStlJobs(row, action)
      .pipe(takeUntilDestroyed(this.destroyRef$), finalize(() => this.loadingTable.set(false)))
      .subscribe(res => {
        const message = res?.message || MESSAGES.SUCCESS_JOB_TRIGGER;
        this.toast.success(message);
        this.reload$.next();
      });
  }

  cancelRun(action: string, id: number): void {
    const modal = this.confirmAction(action);

    modal.updateConfig({
      nzOnOk: () => {
        this.loadingTable.set(true);
        this.ss.cancelRun(id)
          .pipe(finalize(() => this.loadingTable.set(false)))
          .subscribe(() => {
            this.reload$.next();
            this.toast.success(MESSAGES.SUCCESS_CANCEL_ITEM('run'));
          });
      }
    });
  }

  handlePublishAction(functionName: string, data: any): void {
    const payload: PublishSettlement = {
      workspaceId: +data.workspaceId,
      pipelineGroupId: +data.id,
      stlGroupId: +data.id,
      functionName: functionName,
      processType: data.processType,
      billingPeriod: data.billingPeriod,
    };

    const title = LABELS.PUBLISH_TRANSACTION_REPORT;
    const message = MESSAGES.CONFIRM_PUBLISH_ITEM(LABELS.TRANSACTION_REPORT.toLowerCase());
    const descriptions = [
      {
        label: `${LABELS.TRADING_DATE}/${LABELS.BILLING_PERIOD}`,
        value: data.tradingDate
          ? data.tradingDate
          : `${data.billingStartDate} to ${data.billingEndDate}`
      },
    ];

    this.stlUtil.publish(payload, title, message, descriptions, () => this.reload$.next());
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
      const endDate = setHours(rowData?.billingEndDate, 23).setMinutes(59);
      return !(isBefore(current, endDate) && isAfter(current, subDays(rowData.billingStartDate, 1)))
    };
  }

}

const expandedTableCols: Record<string, TPL_TABLE_COLUMN> = {
  [LABELS.NAME]: { label: LABELS.NAME, propName: 'description', type: 'template', width: '200px' },
  [LABELS.RUN_START]: { label: LABELS.RUN_START, propName: 'runStart', type: 'date', width: '100px', align: 'center' },
  [LABELS.RUN_END]: { label: LABELS.RUN_END, propName: 'runEnd', type: 'date', width: '100px', align: 'center' },
  [LABELS.DURATION]: { label: LABELS.DURATION, propName: 'duration', type: 'string', width: '100px' },
  [LABELS.RUN_BY]: { label: LABELS.RUN_BY, propName: 'runBy', type: 'string', width: '100px' },
  [LABELS.STATUS]: { label: LABELS.STATUS, propName: 'status', type: 'template', width: '100px', align: 'center' }
}
