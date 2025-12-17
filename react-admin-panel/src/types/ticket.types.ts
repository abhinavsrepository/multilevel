export interface Ticket {
  id: number;
  ticketId: string;
  user: {
    userId: string;
    fullName: string;
    email: string;
    mobile: string;
    profilePicture?: string;
  };
  subject: string;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'REOPENED';
  description: string;
  attachments: TicketAttachment[];

  // Assignment
  assignedTo?: {
    id: number;
    fullName: string;
    email: string;
  };

  // Messages
  messages: TicketMessage[];
  messageCount: number;

  // Dates
  createdAt: string;
  updatedAt: string;
  lastReplyAt?: string;
  resolvedAt?: string;
  closedAt?: string;
}

export interface TicketAttachment {
  id: number;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadedAt: string;
}

export interface TicketMessage {
  id: number;
  sender: {
    id: number;
    fullName: string;
    role: string;
    profilePicture?: string;
  };
  message: string;
  attachments: TicketAttachment[];
  isInternal: boolean;
  createdAt: string;
}

export interface TicketFilters {
  search?: string;
  status?: string;
  category?: string;
  priority?: string;
  assignedTo?: string;
  startDate?: string;
  endDate?: string;
}

export interface TicketReply {
  message: string;
  attachments?: File[];
  isInternal: boolean;
}

export interface TicketTemplate {
  id: number;
  title: string;
  category: string;
  content: string;
  createdAt: string;
}
