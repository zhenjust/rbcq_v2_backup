import { pricingConditions, settlementProcessTypes } from "@shared/enums";
import { JobSelect, settlementJobInstanceOptions, settlementTableDate, TableColumn } from "@shared/interfaces";
import { LABELS } from './labels.const';

export const FULL_SETTLEMENT_OPTIONS: settlementJobInstanceOptions[] = [
    {id: 'ALL', label: 'All', value: null},
    {id: 'ALL_MONTHLY', label: 'All Monthly', value: settlementProcessTypes.ALL_MONTHLY},
    {id: 'DAILY', label: 'Daily', value: settlementProcessTypes.DAILY},
    {id: 'PRELIM', label: 'Preliminary', value: settlementProcessTypes.PRELIM},
    {id: 'FINAL', label: 'Final', value: settlementProcessTypes.FINAL},
    {id: 'ADJUSTED', label: 'Adjustment', value: settlementProcessTypes.ADJUSTED}
  ];

export const MARKET_FEE_SETTLEMENT_OPTIONS: settlementJobInstanceOptions[] = [
    {id: 'ALL_MONTHLY', label: 'All', value: settlementProcessTypes.ALL_MONTHLY},
    {id: 'PRELIM', label: 'Preliminary', value: settlementProcessTypes.PRELIM},
    {id: 'FINAL', label: 'Final', value: settlementProcessTypes.FINAL},
    {id: 'ADJUSTED', label: 'Adjustment', value: settlementProcessTypes.ADJUSTED}
  ];

export const PRICING_CONDITIONS: settlementJobInstanceOptions[] = [
  {id: pricingConditions.AP, label: pricingConditions.AP, value: pricingConditions.AP},
  {id: pricingConditions.MOT, label: pricingConditions.MOT, value: pricingConditions.MOT},
  {id: pricingConditions.MRU, label: pricingConditions.MRU, value: pricingConditions.MRU},
  {id: pricingConditions.PSM, label: pricingConditions.PSM, value: pricingConditions.PSM},
  {id: pricingConditions.SEC, label: pricingConditions.SEC, value: pricingConditions.SEC}
]

export const SettlementJobActions: JobSelect[] = [
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
