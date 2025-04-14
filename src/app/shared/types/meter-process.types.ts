export const MeterProcessTypes = {
    DAILY: 'DAILY',
    PRELIMINARY: 'PRELIMINARY',
    FINAL: 'FINAL',
    ADJUSTMENT: 'ADJUSTMENT'
} as const;

export type MeterProcessType = typeof MeterProcessTypes[keyof typeof MeterProcessTypes];