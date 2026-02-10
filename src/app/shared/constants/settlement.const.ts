import { pricingConditions, settlementProcessTypes, settlementSearchNames } from "@shared/enums";
import { JobSelect, settlementJobInstanceOptions, TableColumn } from "@shared/interfaces";
import { LABELS } from './labels.const';

export const FULL_SETTLEMENT_OPTIONS: settlementJobInstanceOptions[] = [
  { id: 'ALL', label: 'All', value: null },
  { id: 'ALL_MONTHLY', label: 'All Monthly', value: settlementProcessTypes.ALL_MONTHLY },
  { id: 'DAILY', label: 'Daily', value: settlementProcessTypes.DAILY },
  { id: 'PRELIM', label: 'Preliminary', value: settlementProcessTypes.PRELIM },
  { id: 'FINAL', label: 'Final', value: settlementProcessTypes.FINAL },
  { id: 'ADJUSTED', label: 'Adjustment', value: settlementProcessTypes.ADJUSTED }
];

export const MARKET_FEE_SETTLEMENT_OPTIONS_NO_ALL: settlementJobInstanceOptions[] = [
  { id: 'PRELIM', label: 'Preliminary', value: settlementProcessTypes.PRELIM },
  { id: 'FINAL', label: 'Final', value: settlementProcessTypes.FINAL },
  { id: 'ADJUSTED', label: 'Adjustment', value: settlementProcessTypes.ADJUSTED }
];

export const MARKET_FEE_SETTLEMENT_OPTIONS: settlementJobInstanceOptions[] = [
  { id: 'ALL_MONTHLY', label: 'All', value: settlementProcessTypes.ALL_MONTHLY },
  ...MARKET_FEE_SETTLEMENT_OPTIONS_NO_ALL
];


export const PRICING_CONDITIONS: settlementJobInstanceOptions[] = [
  { id: pricingConditions.AP, label: pricingConditions.AP, value: pricingConditions.AP },
  { id: pricingConditions.MOT, label: pricingConditions.MOT, value: pricingConditions.MOT },
  { id: pricingConditions.MRU, label: pricingConditions.MRU, value: pricingConditions.MRU },
  { id: pricingConditions.PSM, label: pricingConditions.PSM, value: pricingConditions.PSM },
  { id: pricingConditions.SEC, label: pricingConditions.SEC, value: pricingConditions.SEC }
]

// finalize: APP_PERMISSION.TA_FINALIZE

export const SettlementJobActions: JobSelect[] = [
  /** DONE WITH IMPLEMENTATION */
  { label: LABELS.GENERATE_ENERGY_INPUT_WORKSPACE, value: 'generateInputWorkspace' },
  { label: LABELS.GENERATE_RESERVE_INPUT_WORKSPACE, value: 'generateReserveInputWorkspace' },
  { label: LABELS.CALCULATE_ENERGY_TRADING_AMOUNT, value: 'calculateEnergyTradingAmount' },
  { label: LABELS.CALCULATE_RESERVE_TRADING_AMOUNT, value: 'calculateReserveTradingAmount' },
  { label: `${LABELS.PUBLISH} ${LABELS.TRANSACTION_REPORT}`, value: 'publish' },
  { label: LABELS.GENERATE_RESERVE_FILES, value: 'generate_reserve_files' },
  { label: LABELS.GENERATE_ENERGY_FILES, value: 'generate_energy_files' },

  /**
   * IN_PROGRESS
   */


  /**
   * NOT YET STARTED
   */
  { label: LABELS.CALCULATE_GMR_VAT, value: 'calculate_gmr_vat' }, // TA_CALCULATE_GMRVAT, !vm.hideCalcButtons(item.parentStlJobGroupDto.groupId), vm.resource === 'trading-amounts', not daily, ((item.parentStlJobGroupDto.genMonthlySummaryIsLatestJob && item.parentStlJobGroupDto.genMonthlySummaryStatus === 'COMPLETED') || item.parentStlJobGroupDto.calculateGmrIsLatestJob), !item.parentStlJobGroupDto.locked
  { label: LABELS.CALCULATE_LINE_RENTAL, value: 'calculate_line_rental' }, // TA_CALCULATE_LR, !vm.hideCalcLrButtons(item.parentStlJobGroupDto.groupId), vm.resource === 'trading-amounts', item.parentStlJobGroupDto.hasCompletedGenInputWs, !item.parentStlJobGroupDto.lockedLr
  { label: LABELS.CALCULATE_RESERVE_GMR_VAT, value: 'calculate_reserve_gmr_vat' }, // vm.resource === 'reserve-trading-amounts', processType is not daily, TA_CALCULATE_GMRVAT, !parentStlJobGroupDto.locked, ((item.parentStlJobGroupDto.genMonthlyRsvSummaryIsLatestJob && item.parentStlJobGroupDto.genRsvMonthlySummaryStatus === 'COMPLETED') || item.parentStlJobGroupDto.calculateRgmrIsLatestJob)
  { label: LABELS.CALCULATE_RESERVE_TRANSACTION_ALLOCATION, value: 'calculate_reserve_transaction_allocation' }, // vm.resource === 'reserve-trading-amounts', perm: PROCESS_TRANSACTION_ALLOCATION, item.parentStlJobGroupDto.taggingStatus === 'COMPLETED', condition: (item.processType == 'FINAL' || item.processType == 'PRELIM' || item.processType == 'ADJUSTED')"
  { label: LABELS.CALCULATE_SETTLEMENT, value: 'calculate_settlement' },
  { label: LABELS.CALCULATE_ENERGY_TRANSACTION_ALLOCATION, value: 'calculate_transactions' },

  { label: LABELS.FINALIZE_LINE_RENTAL, value: 'finalize_line_rental' }, // TA_FINALIZE_LR, vm.showTaggingLrButton(item), vm.hideCalcLrButtons(item.parentStlJobGroupDto.groupId)
  { label: LABELS.FINALIZE_SETTLEMENT, value: 'finalize_settlement' }, // TA_FINALIZE, vm.showParentTaggingButton(item), !vm.hideCalcButtons(item.parentStlJobGroupDto.groupId), vm.finalizeAction

  { label: LABELS.GENERATE_ENERGY_BILLING_STATEMENT, value: 'generate_energy_billing_statement' },
  { label: LABELS.GENERATE_LINE_RENTAL_FILES, value: 'generate_line_rental_files' },
  { label: LABELS.GENERATE_MONTHLY_SUMMARY, value: 'generate_monthly_summary' }, // TA_GEN_MONTHLY_SUMMARY, !vm.hideCalcButtons(item.parentStlJobGroupDto.groupId), vm.resource === 'trading-amounts', processType is not daily, item.parentStlJobGroupDto.hasCompletedCalc, !item.parentStlJobGroupDto.locked
  { label: LABELS.GENERATE_RESERVE_BILLING_STATEMENT, value: 'generate_reserve_billing_statement' },
  { label: LABELS.GENERATE_RESERVE_MONTHLY_SUMMARY, value: 'generate_reserve_monthly_summary' }, // TA_GEN_MONTHLY_SUMMARY, processType is not daily, for 'reserve-trading-amounts', ask for statuses
  { label: LABELS.GENERATE_RESERVE_TRANSACTION_REPORT, value: 'generate_reserve_transaction_report' },
  { label: LABELS.GENERATE_TRANSACTION_REPORT, value: 'generate_transac_reports' },

  { label: LABELS.VALIDATE_INPUT, value: 'validate_input' }, // perm: VALIDATE_INPUT, vm.resource === 'trading-amounts'

  { label: LABELS.VIEW_CALCULATIONS, value: 'calculations' }, // always show
  { label: LABELS.VIEW_DAILY_STATUS, value: 'view_daily_status' }, // not daily, vm.resource === 'trading-amounts', TA_VIEW_DAILY_STATUS
  { label: LABELS.VIEW_VALIDATIONS, value: 'validations' }, // perm: VALIDATE_INPUT, vm.resource === 'trading-amounts'
];

export const SettlementJobSubActions:  JobSelect[] = [
  { label: LABELS.CANCEL_RUN, value: 'cancelRun' }, // implemented
]

export const BaseTableItem: TableColumn[] = [
  { name: 'Workspace ID', key: 'workspaceId' },
  { name: 'Run Date and Time', key: 'runDatetime' },
  { name: 'Process Type', key: 'processType' },
  { name: 'Trading Date', key: 'tradingDate' },
  { name: 'Status', key: 'status' },
  { name: 'Line Rental Status', key: 'lineRentalStatus' },
  { name: 'Progress', key: 'progress' },
  { name: 'Actions', key: 'actions' }
];

export const RunProcessBtnLabel: Record<string, string> = {
  [settlementSearchNames.RESERVE_TRADING_AMOUNTS]: 'Run Reserve Settlement Ready',
}
