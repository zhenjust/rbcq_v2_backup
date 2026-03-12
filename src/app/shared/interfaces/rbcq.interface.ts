import { RbcqProcessType } from "@shared/enums/rbcq.enum";

export interface rbcqProcessOptions {
    id: string,
    label: string,
    value: RbcqProcessType
}