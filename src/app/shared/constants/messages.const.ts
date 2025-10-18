export const MESSAGES = {
  ITEMS_REQUIRED: (item: string) => `${item} are required.`,
  // Success
  SUCCESS_CONSOLIDATE_ITEM: (item: string) => `Successfully consolidated ${item}.`,
  SUCCESS_SWITCH: (type: 'Normal' | 'Super') => `Switched to ${type} user!`,

  // Confirm
  CONFIRM_CONSOLIDATE_ITEMS: (item: string) => `Do you want to consolidate the selected ${item}?`,
  CONFIRM_PUBLISH_ITEM: (item: string) => `Do you want to publish this ${item}?`,
  SUCCESS_DOWNLOAD_ITEM: (item: string) => `Successfully downloaded ${item}.`,
}