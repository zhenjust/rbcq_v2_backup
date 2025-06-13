export enum settlementPageTitles {
    ENERGY_MARKET_FEE_CALCULATION = 'Energy Market Fee Calculation',
    RESERVE_MARKET_FEE_CALCULATION = 'Reserve Market Fee Calculation',
    RESERVE_TRADING_AMOUNTS_CALCULATION = 'Reserve Trading Amounts Calculation',
    TRADING_AMOUNTS_CALCULATION = 'Trading Amounts Calculation'
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