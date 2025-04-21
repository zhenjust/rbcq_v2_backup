export enum MeterProcessTypes {
    DAILY = 'DAILY',
    PRELIMINARY = 'PRELIMINARY',
    FINAL = 'FINAL',
    ADJUSTMENT = 'ADJUSTMENT'
}

enum SettlementProcessType {
    ALL = 'ALL',
    ALLMONTHLY = 'ALLMONTHLY'
}

export type SettlementProcessTypes = MeterProcessTypes | SettlementProcessType;

export enum RegionGroup {
    ALL = 'ALL',
    LUZON = 'LUZON',
    VISAYAS = 'VISAYAS',
    MINDANAO = 'MINDANAO'
}