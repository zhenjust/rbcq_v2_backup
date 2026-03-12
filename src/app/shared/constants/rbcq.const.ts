import { RbcqProcessType } from "@shared/enums/rbcq.enum";
import { rbcqProcessOptions } from "@shared/interfaces/rbcq.interface";

export const RBCQ_PROCESS_TYPE: rbcqProcessOptions[] = [
    {id: RbcqProcessType.INTIALIZE, label: 'Initialize', value: RbcqProcessType.INTIALIZE},
    {id: RbcqProcessType.FINALIZE, label: 'Finalize', value: RbcqProcessType.FINALIZE},
    {id: RbcqProcessType.AP_FLAG, label: 'AP Flag', value: RbcqProcessType.AP_FLAG},
 
]