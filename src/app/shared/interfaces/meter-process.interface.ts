import { MeterProcessTypes, RegionGroup } from "@shared/enums";

export interface meterProcessPayload {
    processType: MeterProcessTypes,
    date: string,
    regionGroup: RegionGroup
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
    startDatetime: string
    endDatetime: string,
    tradingDate: string,
    billingPeriodName: string,
    billingStartDate: string,
    billingEndDate: string,
    processType: MeterProcessTypes,
    adjNo: number | string,
    mtn: string | [],
    reRunId: string;
}

export interface ConsolidateParams {
    baseWorkspaceId: number;
    reRunWorkspaceId?: string;
}

export interface meterProcessRunJobPayload {
    pipelineName: string
    refId?: number,
    isGroup: boolean,
    parameters: Partial<meterProcessParams>
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

export interface meterProcessPipelineRuns {
    name: string,
    description: string,
    runId: string,
    runBy: string,
    runStart: string,
    runEnd: string,
    status: string,
    message: string,
    duration: string
}

export interface meterProcessPipeline {
    name: string
    id: number
    status: string
    lastModifiedBy: string
    lastModifiedDatetime: Date
    parameters: meterProcessParameters,
    partial: boolean,
    consolidate: boolean
    pipelineRuns: meterProcessPipelineRuns[];
    currentDownloadedFile?: string | null;
    currentDownloadedPercentage?: number | null;
}

export interface meterProcessPipelineGroup {
    processType: MeterProcessTypes
    billingPeriod?: string
    tradingDate?: string
    billingStartDate: string
    billingEndDate: string
    adjNo?: number
    pipelines: meterProcessPipeline[]
    published?: boolean;
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
  name: string;
  processType: MeterProcessTypes;
  tradingDate: string;
  startDatetime: string;
  billingPeriodName: string,
  endDatetime: string;
  adjNo: number | string;
  regionGroup?: string;
  mtn: string | [];
  page: number;
  size: number;
  sort: string;
}

export interface mtnList {
    mtnName: string;
    region: string
}

export interface mtnListPage {
    data: mtnList[]
    draw: number
    recordsTotal: number
    recordsFiltered: any
    hasMore: boolean
}

export interface ReportDownloadParams {
    version: string;
    isDaily: string;
    tradingDate: string;
    runDate: string;
    processType: string;
    user: string;
}

export interface DownloadMmfParams {
  workspaceId: number;
  processType: string;
  endDate: string;
}

export interface GenerateMetering {
    pipelineName: string;
    parameters: {
        processType: MeterProcessTypes;
        startDate?: string;
        endDate?: string;
    },
    reportCodes?: string[];
}