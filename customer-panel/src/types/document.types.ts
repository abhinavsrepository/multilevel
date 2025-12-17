export interface Document {
  id: number;
  name: string;
  type: 'LEGAL' | 'CLIENT' | 'PROPERTY' | 'BOOKING' | 'AGREEMENT' | 'RECEIPT';
  category: string;
  fileUrl: string;
  fileSize: number;
  uploadedBy: number;
  associatedEntity?: {
    type: 'CLIENT' | 'PROPERTY' | 'BOOKING';
    id: number;
    name: string;
  };
  uploadedAt: string;
  updatedAt: string;
}

export interface UploadDocumentInput {
  file: File;
  name: string;
  type: string;
  category?: string;
  associatedEntityType?: string;
  associatedEntityId?: number;
}
