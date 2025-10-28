import { ETA_JOBS, MeterProcessTypes, pricingConditions, settlementPageTitles, settlementProcessTypes } from "@shared/enums";

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
    adjNo: string
    processType: MeterProcessTypes
    tradingDate: string
    billingPeriod: string
    billingEndDate: string
    billingStartDate: string
    status: string
    runDatetime: string
    lineRentalStatus?: string
    workspaceId: string
    published?: boolean;
    pipelines: [] //create interface once sample pipeline view calculations has values,
}

export interface settlementTableDate {
    pipelineGroup: settlementPipeline[]
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

export interface PublishSettlement {
    stlGroupId: number,
    processType: string,
    stlSource: string
}

export interface EnergyTradingAmounts {
    pipelineName: ETA_JOBS,
    refId: number | string,
    isGroup: boolean,
    parameters: {
        billingStartDate: string | null,
        billingEndDate: string | null,
        tradingDate: string | null,
        processType: string,
        workspaceId: number | string
    }
}

export interface JobSelect {
  label: string,
  value: string,
  show?: boolean
}

export interface SettlementPipelineWithRun {
  id: number;
  name: string;
  lastModifiedDatetime: string;
  lastModifiedBy: string;
  partial: boolean;
  consolidate: boolean;
  pipelineRuns: PipelineRun[];
  status?: string;
}

export interface PipelineRun {
  name: string;
  description: any;
  runBy: string;
  runId: string;
  status: string;
  message: any;
  runStart: string;
  runEnd?: string;
  duration: string;
  workspaceId: number;
}
