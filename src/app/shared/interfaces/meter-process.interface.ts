import { MeterProcessType } from "@shared/types";

//TODO address the comments
export interface meterProcessPayload {
    date: string, //verify this data type
    endDate: string, //verify this data type
    processType: MeterProcessType,
    regionGroup: string,
    startDate: string, //verify this data type
    billingPeriod: string,
    adjustmentNumnber: number
}