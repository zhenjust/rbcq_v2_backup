export const MESSAGES = {
  // STATIC MESSAGES
  SUCCESS_JOB_TRIGGER: 'Jobs successfully triggered!',
  CLEAR_ALL_FILES: 'Are you sure you want to clear all selected files?',
  CANCEL_RUN: `Are you sure you want to cancel this run?`,
  INVALID_FILE_TYPE: `Invalid file type. Please try again.`,
  ALL_FILES_ERROR: 'All files encountered an error while importing.',
  SINGLE_FILE_ERROR: 'An error occured during import.',
  SOME_FILES_ERROR: 'Some files encountered an error while importing.',
  UPLOAD_IN_PROGRESS: 'Uploads are in progress.',

  // DYNAMIC MESSAGES
  ITEMS_REQUIRED: (item: string) => `${item} are required.`,

  SUCCESS_CONSOLIDATE_ITEM: (item: string) => `Successfully consolidated ${item}.`,
  SUCCESS_SWITCH: (type: 'Normal' | 'Super') => `Switched to ${type} user!`,
  SUCCESS_CANCEL_ITEM: (item: string) => `Successfully cancelled ${item}.`,
  SUCCESS_UPLOAD_ITEM: (item: string) => `Successfully uploaded ${item}.`,
  SUCCESS_IMPORT_ITEM: (item: string) => `Successfully imported ${item}.`,

  CONFIRM_CONSOLIDATE_ITEMS: (item: string) => `Do you want to consolidate the selected ${item}?`,
  CONFIRM_PUBLISH_ITEM: (item: string) => `Do you want to publish this ${item}?`,
  SUCCESS_DOWNLOAD_ITEM: (item: string) => `Successfully downloaded ${item}.`,
  GENERATE_INPUT_WORKSPACE_TD: (date: string) => `You are going to generate input workspace for the trading date: <strong>${date}</strong>. Do you want to proceed?`,
  CONFIRM_SETTLEMENT_MSG: (action: string) => `You are going to ${action}. Do you want to proceed?`,



}