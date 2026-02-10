export enum settlementPageTitles {
    ENERGY_MARKET_FEE_CALCULATION = 'Energy Market Fee Calculation',
    RESERVE_MARKET_FEE_CALCULATION = 'Reserve Market Fee Calculation',
    RESERVE_TRADING_AMOUNTS_CALCULATION = 'Reserve Trading Amounts Calculation',
    TRADING_AMOUNTS_CALCULATION = 'Energy Trading Amounts Calculation'
}

export enum settlementProcessTypes {
    ALL = 'ALL',
    ALL_MONTHLY = 'ALL_MONTHLY',
    DAILY = 'DAILY',
    PRELIM = 'PRELIM',
    FINAL = 'FINAL',
    ADJUSTED = 'ADJUSTED'
}

export enum settlementSearchNames {
    RESERVE_TRADING_AMOUNTS = "reserveTradingAmounts",
    ENERGY_TRADING_AMOUNTS = "energyTradingAmounts",
    ENERGY_MARKET_FEE = "energyMarketFee",
    RESERVE_MARKET_FEE = "reserveMarketFee",
    MANAGE_ADD_COM_CLAIMS = "manageAddComClaims",
    UPDATE_ADD_COM_INVOICE = "updateAddComInvoice"
}

export enum pricingConditions {
    AP = "AP",
    SEC = "SEC",
    MRU = "MRU",
    PSM = "PSM",
    MOT = "MOT"
}

export enum ETA_JOBS {
    GEN_INPUT_WORKSPACE = 'energyTradingAmounts-generateInputWorkspace',
    CAL_TRADING_AMOUNTS = 'energyTradingAmounts-calculateTradingAmount',
    GEN_MONTHLY_SUMMARY = 'energyTradingAmounts-generateMonthlySummary',
    RTA_GENERATE_INPUT_WORKSPACE = 'reserveTradingAmounts-generateInputWorkspace',
    CALC_RESERVE_TRADING_AMOUNTS = 'reserveTradingAmounts-calculateTradingAmount',
    RTA_GENERATE_FILES = 'reserveTradingAmounts-generateFiles',
    ETA_GENERATE_FILES = 'energyTradingAmounts-generateFiles',
}

export enum MDV {
    MDV1 = 'MDV1',
    MDV2 = 'MDV2',
    MDV3 = 'MDV3',
    MDV4 = 'MDV4',
    MDV5 = 'MDV5',
    MDV6 = 'MDV6',
    MDV7 = 'MDV7',
    MDV8 = 'MDV8',
    MDV9 = 'MDV9',
}
