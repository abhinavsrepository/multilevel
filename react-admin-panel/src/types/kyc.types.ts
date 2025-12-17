export interface KYCDocument {
  id: number;
  user: {
    userId: string;
    fullName: string;
    email: string;
    mobile: string;
    profilePicture?: string;
  };
  documentType:
  | 'PAN'
  | 'AADHAAR'
  | 'BANK_PROOF'
  | 'INCOME_PROOF'
  | 'ADDRESS_PROOF'
  | 'PHOTO';
  documentNumber?: string;
  documentUrl: string;
  backDocumentUrl?: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  verifiedBy?: string;
  verifiedDate?: string;
  rejectionReason?: string;
  submittedDate: string;

  // OCR Data
  extractedData?: Record<string, any>;
}

export interface KYCFilters {
  search?: string;
  status?: string;
  documentType?: string;
  startDate?: string;
  endDate?: string;
}

export interface KYCVerificationRequest {
  kycLevel: 'BASIC' | 'FULL' | 'PREMIUM';
  remarks?: string;
}
