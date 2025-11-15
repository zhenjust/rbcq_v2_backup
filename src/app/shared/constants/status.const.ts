export enum MeterDataPipelineProcess {
  METER_DATA = 'meter data',
  SETTLEMENT_READY = 'settlement ready',
  GESQ = 'gesq'
}

export enum PipelineStatus {
  COMPLETED = 'completed - ',
  FAILED = 'failed - ',
  CANCELLED = 'cancelled - '
}

export enum MeterProcessStatus {
  COMPLETED_METER_DATA = PipelineStatus.COMPLETED + MeterDataPipelineProcess.METER_DATA,
  COMPLETED_GESQ = PipelineStatus.COMPLETED + MeterDataPipelineProcess.GESQ,
  COMPLETED_SETTLEMENT_READY = PipelineStatus.COMPLETED + MeterDataPipelineProcess.SETTLEMENT_READY,
  FAILED_SETTLEMENT_READY = PipelineStatus.FAILED + MeterDataPipelineProcess.SETTLEMENT_READY,
  FAILED_GESQ = PipelineStatus.FAILED + MeterDataPipelineProcess.GESQ,
  CANCELLED_SETTLEMENT_READY = PipelineStatus.CANCELLED + MeterDataPipelineProcess.SETTLEMENT_READY,
  CANCELLED_GESQ = PipelineStatus.CANCELLED + MeterDataPipelineProcess.GESQ
}

export enum MeterDataPipelineName {
    SETTLEMENT_READY = 'settlementReady',
    FINALIZE_READY = 'finalizeSettlementData',
    INITIALIZE = 'initialize',
    CONSOLIDATE = 'consolidateMeterData'
}

export enum SettlementStatus {
  NULLIFIED = 'Nullified',

  COMPLETED_SETTLEMENT_READY = 'Completed - Settlement Ready',
  COMPLETED_GENERATE_INPUT_WORKSPACE =  'Completed - Generate Input Workspace',
  COMPLETED_SETTLEMENT_COMPLETE = 'Completed - Settlement Complete',
  COMPLETED_SETTLEMENT_CALCULATION = 'Completed - Settlement Calculation',

  FAILED_GENERATE_INPUT_WORKSPACE = `Failed - Generate Input Workspace`,

  CANCELLED_GENERATE_INPUT_WORKSPACE = 'Cancelled - Generate Input Workspace',
}

export enum Status {
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  QUEUED_FOR_PROCESSING = 'QUEUED_FOR_PROCESSING',
  IN_PROGRESS = 'IN_PROGRESS'
}