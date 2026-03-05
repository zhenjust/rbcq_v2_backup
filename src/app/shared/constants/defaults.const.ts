import { LABELS } from './labels.const';

export const modalConfig = {
  nzCentered: true,
  nzOkText: LABELS.PROCEED,
  nzMaskClosable: false,
  nzKeyboard: true,
}

export const STATUS_OPTIONS = [
  { label: LABELS.INACTIVE, value: false },
  { label: LABELS.ACTIVE, value: true }
]
