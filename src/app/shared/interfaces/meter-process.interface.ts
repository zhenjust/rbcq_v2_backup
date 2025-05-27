import { MeterProcessTypes, RegionGroup } from "@shared/enums";

export interface meterProcessPayload {
    processType: MeterProcessTypes,
    date: string,
    regionGroup: RegionGroup
}

export interface meterProcessPayloadNotDaily extends meterProcessPayload {
    startDate: string,
    endDate: string
}

export interface meterProcessTableData extends meterProcessPayload {
    billingPeriod: number,
    billingPeriodName: string | null,
    adjNo: string | null,
    taskExecutionDtoList: []
}

export interface meterProcessOptions {
    id: string,
    label: string,
    value: MeterProcessTypes
}

export interface meterProcessSearch {
    content: meterProcessTableData[]
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

export interface meterProcessParams {
    billingPeriod?: string,
    date?: string,
    startDate?: string
    endDate?: string,
    tradingDate?: string,
    billingPeriodName?: string,
    processType?: MeterProcessTypes,
    adjNo?: number | string,
    regionGroup?: number | string
}

export interface meterProcessRunJobPayload {
    pipelineName: string
    refId: number,
    parameters: meterProcessParams
}