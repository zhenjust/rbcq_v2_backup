export enum MeterDataPipelineProcess {
  METER_DATA = 'meter data',
  SETTLEMENT_READY = 'settlement ready',
  GESQ = 'gesq'
}

export enum PipelineStatus {
  COMPLETED = 'completed - ',
  FAILED = 'failed - ',
  CANCELLED = 'cancelled - ',
  NULLIFIED = 'nullified - '
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

export const MeterDataPipelineNameLabel:Record<MeterDataPipelineName, string> = {
  [MeterDataPipelineName.CONSOLIDATE]: 'Consolidate',
  [MeterDataPipelineName.SETTLEMENT_READY]: 'Run Settlement-Ready',
  [MeterDataPipelineName.FINALIZE_READY]: 'Finalize Settlement - Ready',
  [MeterDataPipelineName.INITIALIZE]: 'Initialize'
}


export const RtaSettlementStatus = {
  IN_PROGRESS_GENERATE_INPUT_RESERVE_WORKSPACE: 'In-Progress - Generate Reserve Input Workspace', // RTA
  CANCELLED_RESERVE_SETTLEMENT_CALCULATION: 'Cancelled - Reserve Settlement Calculation', // RTA
  CANCELLED_GENERATE_INPUT_RESERVE_WORKSPACE: 'Cancelled - Generate Reserve Input Workspace', // RTA
  FAILED_RESERVE_SETTLEMENT_CALCULATION: 'Failed - Reserve Settlement Calculation', // RTA
  FAILED_GENERATE_INPUT_RESERVE_WORKSPACE: `Failed - Generate Reserve Input Workspace`, // RTA
  COMPLETED_RESERVE_SETTLEMENT_CALCULATION: 'Completed - Reserve Settlement Calculation', // RTA
  COMPLETED_RESERVE_SETTLEMENT_COMPLETE: 'Completed - Reserve Settlement Complete', // RTA
  COMPLETED_GENERATE_RESERVE_INPUT_WORKSPACE: 'Completed - Generate Reserve Input Workspace', // RTA
}

export const EtaSettlementStatus = {
  COMPLETED_GENERATE_INPUT_WORKSPACE: 'Completed - Generate Input Workspace', // ETA
  COMPLETED_SETTLEMENT_COMPLETE: 'Completed - Settlement Complete', // ETA
  COMPLETED_SETTLEMENT_CALCULATION: 'Completed - Settlement Calculation', // ETA
  FAILED_GENERATE_INPUT_WORKSPACE: `Failed - Generate Input Workspace`, // ETA
  FAILED_SETTLEMENT_CALCULATION: 'Failed - Settlement Calculation', // ETA
  IN_PROGRESS_GENERATE_INPUT_ENERGY_WORKSPACE: 'In-Progress - Generate Energy Input Workspace', // ETA
  CANCELLED_GENERATE_INPUT_WORKSPACE: 'Cancelled - Generate Input Workspace', // ETA
  CANCELLED_SETTLEMENT_CALCULATION: 'Cancelled - Settlement Calculation', // ETA
}

export const SettlementStatus = {
  NULLIFIED: 'Nullified',
  COMPLETED_SETTLEMENT_READY: 'Completed - Settlement Ready',
  COMPLETED_TAGGING: 'Completed - Tagging',
  ...RtaSettlementStatus,
  ...EtaSettlementStatus,
}

export enum Status {
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  QUEUED_FOR_PROCESSING = 'QUEUED_FOR_PROCESSING',
  IN_PROGRESS = 'IN_PROGRESS'
}
