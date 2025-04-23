import { settlementPageTitles, settlementProcessTypes } from "@shared/enums";

export interface settlementPageData {
    pageTitle: settlementPageTitles | string,
    isLineRentalStatus: boolean
}

export interface settlementJobInstanceParams {
    mapParams: {
        endDate: string | null,
        processType: settlementProcessTypes | null,
        startDate: string | null,
        tradingDateEnd: string | null,
        tradingDateStart: string | null
    },
    pageNo: number,
    pagsize: number
}

export interface settlementJobInstanceOptions {
    id: string,
    label: string,
    value: settlementProcessTypes | null
}