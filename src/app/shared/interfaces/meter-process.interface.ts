import { MeterProcessTypes } from "@shared/enums";

//TODO address the comments
export interface meterProcessPayload {
    date: string,
    endDate: string,
    processType: MeterProcessTypes,
    regionGroup: string,
    startDate: string,
    billingPeriod: string,
    adjustmentNumnber: number
}