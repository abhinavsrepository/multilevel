// Support Types
export interface Ticket {
  id: number;
  ticketId: string;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  description: string;
  attachments: Attachment[];
  createdDate: string;
  lastReplyDate?: string;
  closedDate?: string;
  hasUnreadReplies: boolean;
  replies: TicketReply[];
}

export type TicketCategory =
  | 'INVESTMENT_QUERY'
  | 'PAYMENT_ISSUE'
  | 'COMMISSION_DISPUTE'
  | 'PROPERTY_INFORMATION'
  | 'TECHNICAL_SUPPORT'
  | 'ACCOUNT_ACCESS'
  | 'KYC_ISSUE'
  | 'GENERAL';

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'REOPENED';

export interface TicketReply {
  id: number;
  sender: 'USER' | 'ADMIN';
  senderName: string;
  message: string;
  attachments: Attachment[];
  timestamp: string;
}

export interface Attachment {
  id?: number;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
}

export interface CreateTicketRequest {
  category: TicketCategory;
  priority: TicketPriority;
  subject: string;
  description: string;
  attachments?: File[];
}

export interface ReplyTicketRequest {
  ticketId: number;
  message: string;
  attachments?: File[];
}

export interface FAQ {
  id: number;
  category: string;
  question: string;
  answer: string;
  views: number;
  helpful: number;
  notHelpful: number;
  relatedFAQs?: number[];
}

export interface FAQCategory {
  name: string;
  icon: string;
  count: number;
  faqs: FAQ[];
}
