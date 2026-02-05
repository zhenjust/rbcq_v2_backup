import { pricingConditions, settlementProcessTypes, settlementSearchNames } from "@shared/enums";
import { JobSelect, settlementJobInstanceOptions, settlementTableDate, TableColumn } from "@shared/interfaces";
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


// ask when to hide calc buttons

// genIw: APP_PERMISSION.TA_GENERATE_IW
// calc: APP_PERMISSION.TA_CALCULATE_TA
// finalize: APP_PERMISSION.TA_FINALIZE

export const SettlementJobActions: JobSelect[] = [
  { label: LABELS.CALCULATE_ENERGY_TRADING_AMOUNT, value: 'calculateEnergyTradingAmount', show: false }, // implemented
  { label: LABELS.CALCULATE_GMR_VAT, value: 'calculate_gmr_vat', show: false }, // TA_CALCULATE_GMRVAT, !vm.hideCalcButtons(item.parentStlJobGroupDto.groupId), vm.resource === 'trading-amounts', not daily, ((item.parentStlJobGroupDto.genMonthlySummaryIsLatestJob && item.parentStlJobGroupDto.genMonthlySummaryStatus === 'COMPLETED') || item.parentStlJobGroupDto.calculateGmrIsLatestJob), !item.parentStlJobGroupDto.locked
  { label: LABELS.CALCULATE_LINE_RENTAL, value: 'calculate_line_rental', show: false }, // TA_CALCULATE_LR, !vm.hideCalcLrButtons(item.parentStlJobGroupDto.groupId), vm.resource === 'trading-amounts', item.parentStlJobGroupDto.hasCompletedGenInputWs, !item.parentStlJobGroupDto.lockedLr
  { label: LABELS.CALCULATE_RESERVE_GMR_VAT, value: 'calculate_reserve_gmr_vat', show: false }, // vm.resource === 'reserve-trading-amounts', processType is not daily, TA_CALCULATE_GMRVAT, !parentStlJobGroupDto.locked, ((item.parentStlJobGroupDto.genMonthlyRsvSummaryIsLatestJob && item.parentStlJobGroupDto.genRsvMonthlySummaryStatus === 'COMPLETED') || item.parentStlJobGroupDto.calculateRgmrIsLatestJob)
  { label: LABELS.CALCULATE_RESERVE_TRANSACTION_ALLOCATION, value: 'calculate_reserve_transaction_allocation', show: false }, // vm.resource === 'reserve-trading-amounts', perm: PROCESS_TRANSACTION_ALLOCATION, item.parentStlJobGroupDto.taggingStatus === 'COMPLETED', condition: (item.processType == 'FINAL' || item.processType == 'PRELIM' || item.processType == 'ADJUSTED')"
  { label: LABELS.CALCULATE_SETTLEMENT, value: 'calculate_settlement', show: false },
  { label: LABELS.CALCULATE_ENERGY_TRANSACTION_ALLOCATION, value: 'calculate_transactions', show: false },

  /**
   * DONE: FINALIZE
   */
  { label: LABELS.FINALIZE_LINE_RENTAL, value: 'finalize_line_rental', show: false }, // TA_FINALIZE_LR, vm.showTaggingLrButton(item), vm.hideCalcLrButtons(item.parentStlJobGroupDto.groupId)
  { label: LABELS.FINALIZE_SETTLEMENT, value: 'finalize_settlement', show: false }, // TA_FINALIZE, vm.showParentTaggingButton(item), !vm.hideCalcButtons(item.parentStlJobGroupDto.groupId), vm.finalizeAction

  { label: LABELS.GENERATE_INPUT_WORKSPACE, value: 'generate', show: false }, // implemented
  { label: LABELS.GENERATE_ENERGY_BILLING_STATEMENT, value: 'generate_energy_billing_statement', show: false },
  { label: LABELS.GENERATE_FILES, value: 'generate_files', show: false },
  { label: LABELS.GENERATE_LINE_RENTAL_FILES, value: 'generate_line_rental_files', show: false },
  { label: LABELS.GENERATE_MONTHLY_SUMMARY, value: 'generate_monthly_summary', show: false }, // TA_GEN_MONTHLY_SUMMARY, !vm.hideCalcButtons(item.parentStlJobGroupDto.groupId), vm.resource === 'trading-amounts', processType is not daily, item.parentStlJobGroupDto.hasCompletedCalc, !item.parentStlJobGroupDto.locked
  { label: LABELS.GENERATE_RESERVE_BILLING_STATEMENT, value: 'generate_reserve_billing_statement', show: false },
  { label: LABELS.GENERATE_RESERVE_FILES, value: 'generate_reserve_files', show: false },
  { label: LABELS.GENERATE_RESERVE_MONTHLY_SUMMARY, value: 'generate_reserve_monthly_summary', show: false }, // TA_GEN_MONTHLY_SUMMARY, processType is not daily, for 'reserve-trading-amounts', ask for statuses
  { label: LABELS.GENERATE_RESERVE_TRANSACTION_REPORT, value: 'generate_reserve_transaction_report', show: false },
  { label: LABELS.GENERATE_TRANSACTION_REPORT, value: 'generate_transac_reports', show: false },
  { label: LABELS.GENERATE_ENERGY_FILES, value: 'generate_energy_files', show: false },

  { label: LABELS.VALIDATE_INPUT, value: 'validate_input', show: false }, // perm: VALIDATE_INPUT, vm.resource === 'trading-amounts'

  /**
   * DONE: View
   */
  { label: LABELS.VIEW_CALCULATIONS, value: 'calculations', show: false }, // always show
  { label: LABELS.VIEW_DAILY_STATUS, value: 'view_daily_status', show: false }, // not daily, vm.resource === 'trading-amounts', TA_VIEW_DAILY_STATUS
  { label: LABELS.VIEW_VALIDATIONS, value: 'validations', show: false }, // perm: VALIDATE_INPUT, vm.resource === 'trading-amounts'


  { label: `${LABELS.PUBLISH} ${LABELS.TRANSACTION_REPORT}`, value: 'publish', show: false }, // implemented
];

export const SettlementJobSubActions:  JobSelect[] = [
  { label: LABELS.CANCEL_RUN, value: 'cancelRun', show: false }, // implemented w/ issue

]

export const BaseTableItem: TableColumn[] = [
  { name: 'Group ID', key: 'groupId' },
  { name: 'Run Date and Time', key: 'runDatetime' },
  { name: 'Process Type', key: 'processType' },
  { name: 'Trading Date', key: 'tradingDate' },
  { name: 'Status', key: 'status' },
  { name: 'Line Rental Status', key: 'lineRentalStatus' },
  { name: 'Progress', key: 'progress' },
  { name: 'Actions', key: 'actions' }
];

export const DefaultTableData: settlementTableDate = {
  pipelineGroup: [],
  first: true,
  last: false,
  number: 0,
  numberOfElements: 0,
  size: 0,
  totalElements: 0,
  totalPages: 0
};

export const RunProcessBtnLabel: Record<string, string> = {
  [settlementSearchNames.RESERVE_TRADING_AMOUNTS]: 'Run Reserve Settlement Ready',
}
