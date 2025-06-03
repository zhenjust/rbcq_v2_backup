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
    startDateTime?: string
    endDateTime?: string,
    tradingDate?: string,
    billingPeriodName?: string,
    processType?: MeterProcessTypes,
    adjNo?: number | string,
    regionGroup?: number | string,
    name?: string,
    mtn?: string | []
}

export interface meterProcessRunJobPayload {
    pipelineName: string
    refId: number,
    isGroup: boolean,
    parameters: meterProcessParams
}

export interface meterProcessBillingPeriod {
    createDatetime: string
    id: number
    billingPeriod: number
    supplyMonth: string
    startDate: string
    endDate: string
    name: string
}

export interface meterProcessParameters {
    tradingDate?: string
    startDatetime: string
    endDatetime: string
    processType: MeterProcessTypes
    regionGroup: string
    mtn: string
    billingPeriod?: string
    billingPeriodName?: string
    adjNo?: number
}

export interface meterProcessPipeline {
    name: string
    runId: string
    status: string
    runStart: string
    runEnd: string
    parameters: meterProcessParameters
}

export interface meterProcessPipelineGroup {
    processType: MeterProcessTypes
    billingPeriod?: string
    tradingDate?: string
    startDatetime: string
    endDatetime: string
    adjNo?: number
    pipelines: meterProcessPipeline[]
}

export interface meterProcessTable {
  pipelineGroup: meterProcessPipelineGroup[]
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

export interface meterProcessJobSearchGroupParams {
  name?: string;
  processType?: MeterProcessTypes;
  billingPeriod?: string | undefined;
  tradingDate?: string; 
  startDatetime?: string; 
  endDatetime?: string; 
  adjNo?: number | string;
  regionGroup?: string | number;
  mtn?: string | [];
  page?: number;
  size?: number;
  sort?: string;
}

export interface mtnList {
    substation: string;
    modifiedDate: string;
    status: string;
    source: string;
    facilityType: string;
    createdBy: string;
    modifiedBy: string;
    name: string;
    id: number;
}