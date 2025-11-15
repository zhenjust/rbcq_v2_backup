export interface MspList {
  id: number;
  userId?: number;
  shortName: string;
  participantName: string;
  registrationCategory: string;
}

export interface MqList {
  transactionId: string;
  uploadDate: Date;
  msp: string;
  fileName: string;
  category: string;
  fileSize: number;
  status: string;
  fileId: number;
  fileCount: number;
  accepted: number;
  rejected: number;
}

export interface OngoingTableList {
  category: string;
  mspShortName: string;
  convertToFiveMin: string;
  tradingMonth: string;
  tradingDate: Date;
  startInterval: string;
  endInterval: string;
  file: File;
  status: string;
  percentage: number;
  errorMessage?: string;
  transactionId?: string;
}

export interface MqUploadFilters {
  category: string;
  status: string;
  tradingDate: string;
}