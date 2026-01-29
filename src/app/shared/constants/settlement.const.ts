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

// const ACTION_LIST = [
//   'Calculate Energy Transaction Allocation',
//   'Calculate GMR/VAT',
//   'Calculate Line Rental',
//   'Calculate Reserve GMR/VAT',
//   'Calculate Reserve Transaction Allocation',
//   'Calculate Settlement',

//   'Finalize Line Rental',
//   'Finalize Settlement',

//   'Generate Energy Billing Statement',
//   'Generate Energy Files',
//   'Generate Files',
//   'Generate Input Workspace',
//   'Generate Line Rental Files',
//   'Generate Monthly Summary',
//   'Generate Reserve Billing Statement',
//   'Generate Reserve Files',
//   'Generate Reserve Monthly Summary',
//   'Generate Reserve Transaction Report',
//   'Generate Transaction Report',

//   'Publish Transaction Report',

//   'Validate Input',
//   'View Calculations',
//   'View Daily Status',
//   'View Validations',
// ];

export const SettlementJobActions: JobSelect[] = [
  { label: LABELS.GENERATE_INPUT_WORKSPACE, value: 'generate', show: false },
  { label: LABELS.CALCULATE_ENERGY_TRADING_AMOUNT, value: 'calculateEnergyTradingAmount', show: false },

  { label: LABELS.CALCULATE_GMR_VAT, value: 'calculate_gmr_vat', show: false },
  { label: LABELS.CALCULATE_LINE_RENTAL, value: 'calculate_line_rental', show: false },
  { label: LABELS.CALCULATE_RESERVE_GMR_VAT, value: 'calculate_reserve_gmr_vat', show: false },
  { label: LABELS.CALCULATE_RESERVE_TRANSACTION_ALLOCATION, value: 'calculate_reserve_transaction_allocation', show: false },
  { label: LABELS.CALCULATE_SETTLEMENT, value: 'calculate_settlement', show: false },

  { label: LABELS.FINALIZE_LINE_RENTAL, value: 'finalize_line_rental', show: false },
  { label: LABELS.FINALIZE_SETTLEMENT, value: 'finalize_settlement', show: false },

  { label: LABELS.GENERATE_ENERGY_BILLING_STATEMENT, value: 'generate_energy_billing_statement', show: false },
  // { label: 'Generate Energy Files', value: 'generate_energy_files', show: false },
  { label: LABELS.GENERATE_FILES, value: 'generate_files', show: false },
  { label: LABELS.GENERATE_INPUT_WORKSPACE, value: 'generate_input_workspace', show: false },
  { label: LABELS.GENERATE_LINE_RENTAL_FILES, value: 'generate_line_rental_files', show: false },
  { label: LABELS.GENERATE_MONTHLY_SUMMARY, value: 'generate_monthly_summary', show: false },
  { label: LABELS.GENERATE_RESERVE_BILLING_STATEMENT, value: 'generate_reserve_billing_statement', show: false },
  { label: LABELS.GENERATE_RESERVE_FILES, value: 'generate_reserve_files', show: false },
  { label: LABELS.GENERATE_RESERVE_MONTHLY_SUMMARY, value: 'generate_reserve_monthly_summary', show: false },
  { label: LABELS.GENERATE_RESERVE_TRANSACTION_REPORT, value: 'generate_reserve_transaction_report', show: false },
  { label: LABELS.GENERATE_TRANSACTION_REPORT, value: 'generate_transac_reports', show: false },
  { label: LABELS.VALIDATE_INPUT, value: 'validate_input', show: false },
  { label: 'View Calculations', value: 'calculations', show: false },
  { label: LABELS.VIEW_DAILY_STATUS, value: 'view_daily_status', show: false },
  { label: 'View Validations', value: 'validations', show: false },
  { label: 'Calculate Energy Transaction Allocation', value: 'calculate_transactions', show: false },
  { label: 'Generate Transaction Report', value: 'generate_transac_reports', show: false },
  { label: 'Generate Energy Files', value: 'generate_energy_files', show: false },
  { label: `${LABELS.PUBLISH} ${LABELS.TRANSACTION_REPORT}`, value: 'publish', show: false },
  { label: `${LABELS.CANCEL_RUN}`, value: 'cancelRun', show: false }
];

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