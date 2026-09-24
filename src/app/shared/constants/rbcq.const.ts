import { RbcqProcessType } from "@shared/enums/rbcq.enum";
import { rbcqProcessOptions } from "@shared/interfaces/rbcq.interface";

export const RBCQ_PROCESS_TYPE: rbcqProcessOptions[] = [
    {id: RbcqProcessType.INTIALIZE, label: 'Initialize RBCQ', value: RbcqProcessType.INTIALIZE},
    {id: RbcqProcessType.FINALIZE, label: 'Finalize RBCQ', value: RbcqProcessType.FINALIZE},
    {id: RbcqProcessType.AP_FLAG, label: 'AP Flag', value: RbcqProcessType.AP_FLAG},
    {id: RbcqProcessType.ASIE_RESERVE, label: 'ASIE Reserve', value: RbcqProcessType.ASIE_RESERVE},
    {id: RbcqProcessType.ASIE_RESERVE_AP, label: 'ASIE Reserve AP', value: RbcqProcessType.ASIE_RESERVE_AP}
 
]