export enum MeterDataPipelineProcess {
  METER_DATA = 'meter data',
  SETTLEMENT_READY = 'settlement ready',
  GESQ = 'gesq'
}

export enum PipelineStatus {
  COMPLETED = 'completed - ',
  FAILED = 'failed - ',
  NULLIFIED = 'nullified - ',
  NULLIFIED_PENDING = 'nullified (pending) - '
}

export enum MeterProcessStatus {
  COMPLETED_METER_DATA = PipelineStatus.COMPLETED + MeterDataPipelineProcess.METER_DATA,
  COMPLETED_GESQ = PipelineStatus.COMPLETED + MeterDataPipelineProcess.GESQ,
  FAILED_SETTLEMENT_READY = PipelineStatus.FAILED + MeterDataPipelineProcess.SETTLEMENT_READY,
  FAILED_GESQ = PipelineStatus.FAILED + MeterDataPipelineProcess.GESQ
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
  IN_PROGRESS_RESERVE_SETTLEMENT_CALCULATION: 'In-Progress - Reserve Settlement Calculation', // RTA
  FAILED_RESERVE_SETTLEMENT_CALCULATION: 'Failed - Reserve Settlement Calculation', // RTA
  FAILED_GENERATE_INPUT_RESERVE_WORKSPACE: `Failed - Generate Reserve Input Workspace`, // RTA
  COMPLETED_RESERVE_SETTLEMENT_CALCULATION: 'Completed - Reserve Settlement Calculation', // RTA
  COMPLETED_RESERVE_SETTLEMENT_COMPLETE: 'Completed - Reserve Settlement Complete', // RTA
  COMPLETED_GENERATE_RESERVE_INPUT_WORKSPACE: 'Completed - Generate Reserve Input Workspace', // RTA

  COMPLETED_GENERATE_RESERVE_FILES: 'Completed - Generate Reserve Files',
  IN_PROGRESS_GENERATE_RESERVE_FILES: 'In-Progress - Generate Reserve Files',
  CANCELLED_GENERATE_RESERVE_FILES: 'Cancelled - Generate Reserve Files',
  FAILED_GENERATE_RESERVE_FILES: 'Failed - Generate Reserve Files',
}

export const EtaSettlementStatus = {
  COMPLETED_GENERATE_INPUT_WORKSPACE: 'Completed - Generate Input Workspace', // ETA
  COMPLETED_SETTLEMENT_COMPLETE: 'Completed - Settlement Complete', // ETA
  COMPLETED_SETTLEMENT_CALCULATION: 'Completed - Settlement Calculation', // ETA
  FAILED_GENERATE_INPUT_WORKSPACE: `Failed - Generate Input Workspace`, // ETA
  FAILED_SETTLEMENT_CALCULATION: 'Failed - Settlement Calculation', // ETA
  CANCELLED_GENERATE_INPUT_WORKSPACE: 'Cancelled - Generate Input Workspace', // ETA
  CANCELLED_SETTLEMENT_CALCULATION: 'Cancelled - Settlement Calculation', // ETA
  IN_PROGRESS_SETTLEMENT_CALCULATION: 'In-Progress - Settlement Calculation', // RTA

  IN_PROGRESS_GENERATE_INPUT_ENERGY_WORKSPACE: 'In-Progress - Generate Input Workspace', // ETA
  COMPLETED_GENERATE_ENERGY_FILES: 'Completed - Generate Energy Files',
  IN_PROGRESS_GENERATE_ENERGY_FILES: 'In-Progress - Generate Energy Files',
  CANCELLED_GENERATE_ENERGY_FILES: 'Cancelled - Generate Energy Files',
  FAILED_GENERATE_ENERGY_FILES: 'Failed - Generate Energy Files',
}

export const SettlementStatus = {
  NULLIFIED: 'Nullified',
  COMPLETED_SETTLEMENT_READY: 'Completed - Settlement Ready',
  COMPLETED_TAGGING: 'Completed - Tagging',

  /** Finalize */
  IN_PROGRESS_FINALIZE: 'In-Progress - Finalize',
  FAILED_FINALIZE: 'Failed - Finalize',
  COMPLETED_FINALIZE: 'Completed - Finalize',
  CANCELLED_FINALIZE: 'Cancelled - Finalize',

  /** Calc GMR/VAT */
  IN_PROGRESS_CALCULATE_GMRVAT: 'In-Progress - Calculate GMR/VAT',
  FAILED_CALCULATE_GMRVAT: 'Failed - Calculate GMR/VAT',
  COMPLETED_CALCULATE_GMRVAT: 'Completed - Calculate GMR/VAT',
  CANCELLED_CALCULATE_GMRVAT: 'Cancelled - Calculate GMR/VAT',

  /** Generate Monthly Summary */
  IN_PROGRESS_GENERATE_MONTHLY_SUMMARY: 'In-Progress - Generate Monthly Summary',
  CANCELLED_GENERATE_MONTHLY_SUMMARY: 'Cancelled - Generate Monthly Summary',
  COMPLETED_GENERATE_MONTHLY_SUMMARY: 'Completed - Generate Monthly Summary',
  FAILED_GENERATE_MONTHLY_SUMMARY: 'Failed - Generate Monthly Summary',

  ...RtaSettlementStatus,
  ...EtaSettlementStatus,
}

export enum Status {
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  QUEUED_FOR_PROCESSING = 'QUEUED_FOR_PROCESSING',
  IN_PROGRESS = 'IN_PROGRESS'
}
