import { MeterProcessTypes } from "@shared/enums";
import { meterProcessOptions } from "@shared/enums/interfaces";

export const METER_PROCESS_TYPE_OPTION: meterProcessOptions[] = [
    {id: MeterProcessTypes.DAILY, label: 'Daily', value: MeterProcessTypes.DAILY},
    {id: MeterProcessTypes.ADJUSTED, label: 'Adjustment', value: MeterProcessTypes.ADJUSTED},
    {id: MeterProcessTypes.PRELIM, label: 'Preliminary', value: MeterProcessTypes.PRELIM},
    {id: MeterProcessTypes.FINAL, label: 'Final', value: MeterProcessTypes.FINAL},
]
