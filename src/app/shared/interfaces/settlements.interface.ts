import { MeterProcessTypes, pricingConditions, settlementProcessTypes, settlementSearchNames } from "@shared/enums";

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

export interface settlementPipeline {
    id: number;
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
    pipelines: pipeline[];
    parameters?: {
      dueDate?: string;
      allocDate?: string;
      remarks?: string;
    }
}

export interface pipeline {
    id: number;
    name: string;
    status: string;
    lastModifiedDatetime: string;
    lastModifiedBy: string;
    partial: boolean;
    consolidate: boolean;
    published: boolean;
    pipelineRuns: PipelineRun[];
    currentDownloadedFile?: string | null;
    currentDownloadedPercentage?: number | null;
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
    workspaceId?: number,
    pipelineGroupId?: number,
    pipelineId?: number,
    stlGroupId: number,
    jobExecutionId?: number,
    functionName: string,
    startDate?: string,
    endDate?: string
}

export interface EnergyTradingAmounts {
    pipelineName: string,
    refId?: number | string,
    isGroup: boolean,
    // workspaceId: number | string
    parameters: {
        billingStartDate: string | null,
        billingEndDate: string | null,
        processType: string,
        meteringWorkspaceId: string | null
    }
}

export interface JobSelect {
    label: string,
    value: string,
    show?: boolean,
    permissions?: string[] | undefined,
    type?: settlementSearchNames

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

export interface SettlementJob {
    pipelineName: string;
    isGroup: boolean;
    parameters: SettlementJobParams;
}

export interface SettlementJobParams {
    processType: string;
    startDateTime?: string;
    endDateTime?: string;
}
