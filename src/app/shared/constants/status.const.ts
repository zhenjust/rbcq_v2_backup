export enum MeterProcessStatus {
    COMPLETED_METER_DATA = 'succeeded - meter data',
    COMPLETED_SETTLEMENT_READY = 'succeeded - settlement ready',
    COMPLETED_GESQ = 'succeeded - gesq'
}

export enum MeterDataPipelineName {
    SETTLEMENT_READY = 'settlementReady',
    FINALIZE_READY = 'finalizeSettlementData',
    INITIALIZE = 'initialize'
}