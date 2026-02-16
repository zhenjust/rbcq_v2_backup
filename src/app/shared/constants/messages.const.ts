export const MESSAGES = {
  // STATIC MESSAGES
  SUCCESS_JOB_TRIGGER: 'Jobs successfully triggered!',
  CLEAR_ALL_FILES: 'Are you sure you want to clear all selected files?',
  CANCEL_RUN: `Are you sure you want to cancel this run?`,
  INVALID_FILE_TYPE: `Invalid file type. Please try again.`,
  LONG_FILE_NAME: `Invalid file. Maximum filename should be 100 characters.`,
  ALL_FILES_ERROR: 'All files encountered an error while importing.',
  SINGLE_FILE_ERROR: 'An error occured during import.',
  SOME_FILES_ERROR: 'Some files encountered an error while importing.',
  DUPLICATE_FILES: 'Please choose a different file.',
  UPLOAD_IN_PROGRESS: 'Uploads are in progress.',
  REQUIRED_FIELDS: 'Please fill out the required fields.',
  CONFIRM_ACTION: 'Do you want to proceed with the action?',

  // DYNAMIC MESSAGES
  ITEMS_REQUIRED: (item: string) => `${item} are required.`,

  INVALID_MQ_TIME: (time: string) => `Gate Closure time for MQ Submission is only until: ${time}.`,

  SUCCESS_CONSOLIDATE_ITEM: (item: string) => `Successfully consolidated ${item}.`,
  SUCCESS_SWITCH: (type: 'Normal' | 'Super') => `Switched to ${type} user!`,
  SUCCESS_CANCEL_ITEM: (item: string) => `Successfully cancelled ${item}.`,
  SUCCESS_UPLOAD_ITEM: (item: string) => `Successfully uploaded ${item}.`,
  SUCCESS_IMPORT_ITEM: (item: string) => `Successfully imported ${item}.`,
  SUCCESS_DOWNLOAD_ITEM: (item: string) => `Successfully downloaded ${item}.`,
  SUCCESS_DELETE_ITEM: (item: string) => `Successfully deleted ${item}.`,

  CONFIRM_CONSOLIDATE_ITEMS: (item: string) => `Do you want to consolidate the selected ${item}?`,
  CONFIRM_DELETE_ITEM: (item: string) => `Do you want to delete the selected ${item}?`,
  CONFIRM_PUBLISH_ITEM: (item: string) => `Do you want to publish this ${item}?`,
  GENERATE_INPUT_WORKSPACE_TD: (date: string) => `You are going to generate input workspace for the trading date: <strong>${date}</strong>. Do you want to proceed?`,
  CALCULATE_STL: (date: string) => `You are going to calculate trading amount for the following dates: <strong>${date}</strong>. Do you want to proceed?`,
  CONFIRM_SETTLEMENT_MSG: (action: string) => `You are going to ${action}. Do you want to proceed?`,
  CONFIRM_RUN_JOB: (jobType: string) => `You are going to run a ${jobType}.`,




}