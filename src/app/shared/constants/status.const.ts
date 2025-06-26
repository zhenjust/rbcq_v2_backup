export enum ProcessType {
  METER_DATA = 'meter data',
  SETTLEMENT_READY = 'settlement ready',
  GESQ = 'gesq'
}

export enum ProcessStatus {
  SUCCEEDED = 'succeeded - ',
  FAILED = 'failed - ',
  CANCELLED = 'cancelled - '
}

export enum MeterProcessStatus {
  SUCCEEDED_METER_DATA = ProcessStatus.SUCCEEDED + ProcessType.METER_DATA,
  SUCCEEDED_GESQ = ProcessStatus.SUCCEEDED + ProcessType.GESQ,
  FAILED_SETTLEMENT_READY = ProcessStatus.FAILED + ProcessType.SETTLEMENT_READY,
  FAILED_GESQ = ProcessStatus.FAILED + ProcessType.GESQ,
  CANCELLED_SETTLEMENT_READY = ProcessStatus.CANCELLED + ProcessType.SETTLEMENT_READY,
  CANCELLED_GESQ = ProcessStatus.CANCELLED + ProcessType.GESQ
}

export enum MeterDataPipelineName {
    SETTLEMENT_READY = 'settlementReady',
    FINALIZE_READY = 'finalizeSettlementData',
    INITIALIZE = 'initialize'
}
