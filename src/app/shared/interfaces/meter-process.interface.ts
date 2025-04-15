import { MeterProcessTypes } from "@shared/enums";

//TODO address the comments
export interface meterProcessPayload {
    date: string, //verify this data type
    endDate: string, //verify this data type
    processType: MeterProcessTypes,
    regionGroup: string,
    startDate: string, //verify this data type
    billingPeriod: string,
    adjustmentNumnber: number
}