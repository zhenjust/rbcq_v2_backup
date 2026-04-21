import { TPL_TABLE_COLUMN } from '@shared/interfaces';
import { LABELS } from './labels.const';

export const PipelineTableColumns: Record<string, TPL_TABLE_COLUMN> = {
  [LABELS.NAME]: { label: LABELS.NAME, propName: 'name', width: '180px' },
  [LABELS.RUN_START]: { label: LABELS.RUN_START, propName: 'runStart', width: '150px', type: 'date' },
  [LABELS.RUN_END]: { label: LABELS.RUN_END, propName: 'runEnd', width: '150px', type: 'date' },
  [LABELS.DURATION]: { label: LABELS.DURATION, propName: 'duration' },
  [LABELS.RUN_BY]: { label: LABELS.RUN_BY, propName: 'runBy' },
  [LABELS.STATUS]: { label: LABELS.STATUS, propName: 'status', type: 'template' },
}
