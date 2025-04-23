import { MeterProcessTypes } from "@shared/enums";
import { meterProcessOptions } from "@shared/interfaces";

export const METER_PROCESS_TYPE_OPTION: meterProcessOptions[] = [
    {id: MeterProcessTypes.DAILY, label: 'Daily', value: MeterProcessTypes.DAILY},
    {id: MeterProcessTypes.ADJUSTMENT, label: 'Adjustment', value: MeterProcessTypes.ADJUSTMENT},
    {id: MeterProcessTypes.PRELIMINARY, label: 'Preliminary', value: MeterProcessTypes.PRELIMINARY},
    {id: MeterProcessTypes.FINAL, label: 'Final', value: MeterProcessTypes.FINAL},
]