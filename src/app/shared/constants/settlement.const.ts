import { settlementProcessTypes } from "@shared/enums";
import { settlementJobInstanceOptions } from "@shared/interfaces";

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