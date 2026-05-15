import { MDV, pricingConditions, settlementProcessTypes, settlementSearchNames } from "@shared/enums";
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
  /**
   *
   * DONE WITH IMPLEMENTATION
   * Always arrange by order of process
   *
   * */
  { label: LABELS.GENERATE_INPUT_WORKSPACE, value: 'energyTradingAmounts-generateInputWorkspace', type: settlementSearchNames.ENERGY_TRADING_AMOUNTS },
  { label: LABELS.GENERATE_RESERVE_INPUT_WORKSPACE, value: 'reserveTradingAmounts-generateInputWorkspace', type: settlementSearchNames.RESERVE_TRADING_AMOUNTS },
  { label: LABELS.CALCULATE_ENERGY_TRADING_AMOUNT, value: 'energyTradingAmounts-calculateTradingAmount', type: settlementSearchNames.ENERGY_TRADING_AMOUNTS },
  { label: LABELS.CALCULATE_RESERVE_TRADING_AMOUNT, value: 'reserveTradingAmounts-calculateTradingAmount', type: settlementSearchNames.RESERVE_TRADING_AMOUNTS },
  { label: LABELS.GENERATE_MONTHLY_SUMMARY, value: 'energyTradingAmounts-calculateMSummary', type: settlementSearchNames.ENERGY_TRADING_AMOUNTS },
  { label: LABELS.GENERATE_RESERVE_MONTHLY_SUMMARY, value: 'reserveTradingAmounts-calculateMSummary', type: settlementSearchNames.RESERVE_TRADING_AMOUNTS },
  { label: LABELS.CALCULATE_GMR_VAT, value: 'energyTradingAmounts-calculateGmrVat', type: settlementSearchNames.ENERGY_TRADING_AMOUNTS },
  { label: LABELS.CALCULATE_RESERVE_GMR_VAT, value: 'reserveTradingAmounts-calculateGmrVat', type: settlementSearchNames.RESERVE_TRADING_AMOUNTS },
  { label: LABELS.FINALIZE_SETTLEMENT, value: 'energyTradingAmounts-finalize', type: settlementSearchNames.ENERGY_TRADING_AMOUNTS },
  { label: LABELS.FINALIZE_SETTLEMENT, value: 'reserveTradingAmounts-finalize', type: settlementSearchNames.RESERVE_TRADING_AMOUNTS },
  { label: LABELS.CALCULATE_ENERGY_TRANSACTION_ALLOCATION, value: 'energyTradingAmounts-calculateTransAlloc', type: settlementSearchNames.ENERGY_TRADING_AMOUNTS },
  { label: LABELS.CALCULATE_RESERVE_TRANSACTION_ALLOCATION, value: 'reserveTradingAmounts-calculateTransAlloc', type: settlementSearchNames.RESERVE_TRADING_AMOUNTS },
  { label: LABELS.GENERATE_ENERGY_TRANSACTION_REPORT, value: 'energyTradingAmounts-generateTransactionReport', type: settlementSearchNames.ENERGY_TRADING_AMOUNTS },
  { label: LABELS.GENERATE_RESERVE_TRANSACTION_REPORT, value: 'reserveTradingAmounts-generateTransactionReport', type: settlementSearchNames.RESERVE_TRADING_AMOUNTS },
  { label: LABELS.GENERATE_ENERGY_FILES, value: 'energyTradingAmounts-generateFiles', type: settlementSearchNames.ENERGY_TRADING_AMOUNTS },
  { label: LABELS.GENERATE_RESERVE_FILES, value: 'reserveTradingAmounts-generateFiles', type: settlementSearchNames.RESERVE_TRADING_AMOUNTS },
  { label: `${LABELS.PUBLISH} ${LABELS.TRANSACTION_REPORT}`, value: 'energyTradingAmounts-publish', type: settlementSearchNames.ENERGY_TRADING_AMOUNTS },
  { label: `${LABELS.PUBLISH} ${LABELS.TRANSACTION_REPORT}`, value: 'reserveTradingAmounts-publish', type: settlementSearchNames.RESERVE_TRADING_AMOUNTS },
  /**
   * IN_PROGRESS
   */



  /**
   * NOT YET STARTED
   */
  { label: LABELS.CALCULATE_LINE_RENTAL, value: 'calculate_line_rental' }, // TA_CALCULATE_LR, !vm.hideCalcLrButtons(item.parentStlJobGroupDto.groupId), vm.resource === 'trading-amounts', item.parentStlJobGroupDto.hasCompletedGenInputWs, !item.parentStlJobGroupDto.lockedLr
  { label: LABELS.CALCULATE_RESERVE_GMR_VAT, value: 'calculate_reserve_gmr_vat' }, // vm.resource === 'reserve-trading-amounts', processType is not daily, TA_CALCULATE_GMRVAT, !parentStlJobGroupDto.locked, ((item.parentStlJobGroupDto.genMonthlyRsvSummaryIsLatestJob && item.parentStlJobGroupDto.genRsvMonthlySummaryStatus === 'COMPLETED') || item.parentStlJobGroupDto.calculateRgmrIsLatestJob)
  { label: LABELS.CALCULATE_SETTLEMENT, value: 'calculate_settlement' },

  { label: LABELS.FINALIZE_LINE_RENTAL, value: 'finalize_line_rental' }, // TA_FINALIZE_LR, vm.showTaggingLrButton(item), vm.hideCalcLrButtons(item.parentStlJobGroupDto.groupId)
  { label: LABELS.FINALIZE_SETTLEMENT, value: 'finalize_settlement' }, // TA_FINALIZE, vm.showParentTaggingButton(item), !vm.hideCalcButtons(item.parentStlJobGroupDto.groupId), vm.finalizeAction

  { label: LABELS.GENERATE_LINE_RENTAL_FILES, value: 'generate_line_rental_files' },

  { label: LABELS.VALIDATE_INPUT, value: 'validate_input' }, // perm: VALIDATE_INPUT, vm.resource === 'trading-amounts'

  { label: LABELS.VIEW_CALCULATIONS, value: 'calculations' }, // always show
  { label: LABELS.VIEW_DAILY_STATUS, value: 'view_daily_status' }, // not daily, vm.resource === 'trading-amounts', TA_VIEW_DAILY_STATUS
  { label: LABELS.VIEW_VALIDATIONS, value: 'validations' }, // perm: VALIDATE_INPUT, vm.resource === 'trading-amounts'
];

export const SettlementJobSubActions: JobSelect[] = [
  { label: LABELS.CANCEL_RUN, value: 'cancelRun' }, // implemented
]

export const BaseTableItem: TableColumn[] = [
  { name: 'Workspace ID', key: 'workspaceId' },
  { name: 'Run Date and Time', key: 'runDatetime' },
  { name: 'Process Type', key: 'processType' },
  { name: 'Trading Date', key: 'tradingDate' },
  { name: 'Status', key: 'status' },
  { name: 'Line Rental Status', key: 'lineRentalStatus' },
  { name: 'Published', key: 'published' },
  { name: 'Actions', key: 'actions' }
];

export const RunProcessBtnLabel: Record<string, string> = {
  [settlementSearchNames.RESERVE_TRADING_AMOUNTS]: 'Run Reserve Settlement Ready',
}

export const MDV_LABELS: Record<MDV, string> = {
  [MDV.MDV1]: 'Active Mtn and Trading Participant',
  [MDV.MDV2]: 'Uploaded MQ vs Processed MQ',
  [MDV.MDV3]: 'Captive MQ vs Adjustment MQ vs GOT MQ',
  [MDV.MDV4]: 'GESQ vs RTU',
  [MDV.MDV5]: 'Adjusted MQ vs GESQ',
  [MDV.MDV7]: 'MQ per interval (WESM & RCOA)',
  [MDV.MDV8]: 'Billing Run Comparison',
  [MDV.MDV9]: 'Metering Summary',
};

export const WESM_PENALTY_STATUS = [
  'COMPLETED - CALCULATE-PENALTY',
  'COMPLETED - FINALIZE-PENALTY',
  'COMPLETED - CALCULATE-REFUND',
  'COMPLETED - FINALIZE-REFUND',
  'FAILED - CALCULATE-PENALTY',
  'FAILED - FINALIZE-PENALTY',
  'FAILED - CALCULATE-REFUND',
  'FAILED - FINALIZE-REFUND'
];

export const WESM_PENALTY_TYPE = {
  PENALTY: 'Penalty',
  REFUND: 'Refund'
}
