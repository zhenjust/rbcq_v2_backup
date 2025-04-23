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