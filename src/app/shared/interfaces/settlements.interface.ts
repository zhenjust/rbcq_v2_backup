import { MeterProcessTypes, pricingConditions, settlementPageTitles, settlementProcessTypes } from "@shared/enums";

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
    value: settlementProcessTypes | pricingConditions | null
}

export interface settlementParams {
    billingPeriod: string,
    date: string,
    startDate: string
    endDate: string,
    tradingDate: string,
    billingPeriodName: string,
    processType: MeterProcessTypes,
    adjNo: number | string,
    regionGroup: number | string,
    name: string,
    tradingStartDate: string,
    tradingEndDate: string
}

export interface settlementPipelineParameters {
    billingPeriod: string
    startDatetime: string
    endDatetime: string
    billingPeriodName: string
    adjNo?: number
    regionGroup: string
    mtn: string
    processType: MeterProcessTypes,
    tradingDate?: string,
    pricingCondition?: string
}

export interface settlementPipeline {
    name: string
    runId: string
    status: string
    runStart: string
    runEnd: string
    parameters: settlementPipelineParameters,
    lineRentalStatus?: string,
    progress?: string,
    pricingCondition?: string
}

export interface settlementTableDate {
    pipelines: settlementPipeline[]
    last: boolean
    totalPages: number
    totalElements: number
    first: boolean
    numberOfElements: number
    size: number
    number: number
}

export interface StartEndDateParam {
    startDate: string
    endDate: string
}

export interface AddtlCompensationRunDto {
    billingId: string
    mtn: string
    approvedRate: number
    acParamBillingIdList: string[]
    acParamBillingIdMtnList: string[]
    billingStartDate: string
    billingEndDate: string
    pricingCondition: string
    startEndDateParams: StartEndDateParam[]
}

export interface addtlCompensationRunDtos {
    addtlCompensationRunDtos: AddtlCompensationRunDto[]
}