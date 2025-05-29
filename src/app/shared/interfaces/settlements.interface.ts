import { MeterProcessTypes, settlementPageTitles, settlementProcessTypes } from "@shared/enums";

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

export interface settlementTableData {
    billingPeriod: string
    date: any
    startDate: any
    endDate: any
    billingPeriodName: any
    processType: string
    adjNo: any
    regionGroup: string
}

export interface settlementSearch {
    content: settlementTableData[]
    last: boolean
    totalPages: number
    totalElements: number
    sortBy: any
    sortDirection: any
    first: boolean
    numberOfElements: number
    size: number
    number: number
}

export interface settlementParams {
    billingPeriod?: string,
    date?: string,
    startDate?: string
    endDate?: string,
    tradingDate?: string,
    billingPeriodName?: string,
    processType?: MeterProcessTypes,
    adjNo?: number | string,
    regionGroup?: number | string,
    name?: string,
    tradingStartDate?: string,
    tradingEndDate?: string
}