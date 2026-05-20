export const MESSAGES = {
  // STATIC MESSAGES
  SUCCESS_JOB_TRIGGER: 'Jobs successfully triggered!',
  CLEAR_ALL_FILES: 'Are you sure you want to clear all selected files?',
  CANCEL_RUN: `Are you sure you want to cancel this run?`,
  INVALID_FILE_TYPE: `Invalid file type. Please try again.`,
  INVALID_FILE_TYPE_MQ: 'Invalid File Type. Only CSV, MDE, MDEF files are allowed.',
  LONG_FILE_NAME: `Invalid file. Maximum filename should be 100 characters.`,
  ALL_FILES_ERROR: 'All files encountered an error while importing.',
  SINGLE_FILE_ERROR: 'An error occured during import.',
  SOME_FILES_ERROR: 'Some files encountered an error while importing.',
  DUPLICATE_FILES: 'Please choose a different file.',
  UPLOAD_IN_PROGRESS: 'Uploads are in progress.',
  REQUIRED_FIELDS: 'Please fill out the required fields.',
  REQUIRED_FIELD: 'This is a required field.',
  CONFIRM_ACTION: 'Do you want to proceed with the action?',
  SESSION_TIMEOUT_TITLE: 'Session Expiring Soon',
  SESSION_TIMEOUT_MSG_1: 'You have been inactive for a while. For your security, you will be logged out in',
  SESSION_TIMEOUT_MSG_2: 'Move your cursor to continue with your session',
  MIN_DATE: 'End date should be after the start date.',
  MMF_DUPLICATE: 'Metering Masterfile for the Billing Period and Billing Run Type already exists.',

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
  SUCCESS_SAVE_ITEM: (item: string) => `Successfully saved ${item}.`,
  SUCCESS_FILE_ITEM: (item: string) => `Successfully filed ${item}.`,

  CONFIRM_CONSOLIDATE_ITEMS: (item: string) => `Do you want to consolidate the selected ${item}?`,
  CONFIRM_DELETE_ITEM: (item: string) => `Do you want to delete the selected ${item}?`,
  CONFIRM_PUBLISH_ITEM: (item: string) => `Do you want to publish this ${item}?`,
  GENERATE_INPUT_WORKSPACE_TD: (date: string) => `You are going to generate input workspace for the trading date: <strong>${date}</strong>. Do you want to proceed?`,
  CALCULATE_STL: (date: string) => `You are going to calculate trading amount for the following dates: <strong>${date}</strong>. Do you want to proceed?`,
  CONFIRM_SETTLEMENT_MSG: (action: string) => `You are going to ${action}. Do you want to proceed?`,
  CONFIRM_RUN_JOB: (jobType: string) => `You are going to run a ${jobType}.`,

  MIN_REQUIRED_LENGTH: (length: number, item: string) => `Minimum of ${length} ${item} is required.`,





}
