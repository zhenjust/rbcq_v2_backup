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

export const SettlementJobActions: JobSelect[] = [
  { label: LABELS.GENERATE_INPUT_WORKSPACE, value: 'generate', show: false },
  { label: 'Finalize Energy Trading Amounts', value: 'finalize', show: false },
  { label: LABELS.CALCULATE_ENERGY_TRADING_AMOUNT, value: 'calculateEnergyTradingAmount', show: false },
  { label: LABELS.GENERATE_MONTHLY_SUMMARY, value: 'generateMonthlySummary', show: false },
  { label: 'View Calculations', value: 'calculations', show: false },
  { label: 'Validate Input', value: 'validate_input', show: false },
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