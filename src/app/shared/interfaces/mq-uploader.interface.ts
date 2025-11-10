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