import { apiGet, apiPost, apiPut, apiUploadMultiple } from './config/axiosConfig';
import {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
  Ticket,
  TicketCategory,
  TicketPriority,
  TicketStatus,
  CreateTicketRequest,
  ReplyTicketRequest,
  FAQ,
  FAQCategory,
} from '@/types';

// ==================== Ticket List APIs ====================

/**
 * Get all support tickets with pagination and filters
 */
export const getTickets = async (params?: {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  category?: TicketCategory;
  priority?: TicketPriority;
  status?: TicketStatus;
  search?: string;
}): Promise<PaginatedResponse<Ticket>> => {
  return apiGet<PaginatedResponse<Ticket>>('/support/tickets', params);
};

/**
 * Get ticket by ID
 */
export const getTicketById = async (ticketId: number): Promise<ApiResponse<Ticket>> => {
  return apiGet<ApiResponse<Ticket>>(`/support/tickets/${ticketId}`);
};

/**
 * Get ticket by ticket ID string
 */
export const getTicketByTicketId = async (ticketId: string): Promise<ApiResponse<Ticket>> => {
  return apiGet<ApiResponse<Ticket>>(`/support/tickets/code/${ticketId}`);
};

/**
 * Get open tickets
 */
export const getOpenTickets = async (params?: PaginationParams): Promise<PaginatedResponse<Ticket>> => {
  return apiGet<PaginatedResponse<Ticket>>('/support/tickets/open', params);
};

/**
 * Get closed tickets
 */
export const getClosedTickets = async (params?: PaginationParams): Promise<PaginatedResponse<Ticket>> => {
  return apiGet<PaginatedResponse<Ticket>>('/support/tickets/closed', params);
};

/**
 * Get in-progress tickets
 */
export const getInProgressTickets = async (params?: PaginationParams): Promise<PaginatedResponse<Ticket>> => {
  return apiGet<PaginatedResponse<Ticket>>('/support/tickets/in-progress', params);
};

/**
 * Get resolved tickets
 */
export const getResolvedTickets = async (params?: PaginationParams): Promise<PaginatedResponse<Ticket>> => {
  return apiGet<PaginatedResponse<Ticket>>('/support/tickets/resolved', params);
};

/**
 * Get tickets by category
 */
export const getTicketsByCategory = async (
  category: TicketCategory,
  params?: PaginationParams
): Promise<PaginatedResponse<Ticket>> => {
  return apiGet<PaginatedResponse<Ticket>>(`/support/tickets/category/${category}`, params);
};

/**
 * Get tickets by priority
 */
export const getTicketsByPriority = async (
  priority: TicketPriority,
  params?: PaginationParams
): Promise<PaginatedResponse<Ticket>> => {
  return apiGet<PaginatedResponse<Ticket>>(`/support/tickets/priority/${priority}`, params);
};

// ==================== Create Ticket APIs ====================

/**
 * Create new support ticket
 */
export const createTicket = async (data: CreateTicketRequest): Promise<ApiResponse<Ticket>> => {
  if (data.attachments && data.attachments.length > 0) {
    const formData = new FormData();
    formData.append('category', data.category);
    formData.append('priority', data.priority);
    formData.append('subject', data.subject);
    formData.append('description', data.description);
    data.attachments.forEach((file) => {
      formData.append('attachments', file);
    });
    return apiPost<ApiResponse<Ticket>>('/support/tickets', formData);
  }
  return apiPost<ApiResponse<Ticket>>('/support/tickets', data);
};

/**
 * Create ticket with attachments
 */
export const createTicketWithAttachments = async (
  data: Omit<CreateTicketRequest, 'attachments'>,
  files: File[]
): Promise<ApiResponse<Ticket>> => {
  const formData = new FormData();
  formData.append('category', data.category);
  formData.append('priority', data.priority);
  formData.append('subject', data.subject);
  formData.append('description', data.description);
  files.forEach((file) => {
    formData.append('attachments', file);
  });
  return apiPost<ApiResponse<Ticket>>('/support/tickets', formData);
};

// ==================== Ticket Reply APIs ====================

/**
 * Reply to ticket
 */
export const replyToTicket = async (ticketId: number, message: string, attachments?: File[]): Promise<ApiResponse<Ticket>> => {
  if (attachments && attachments.length > 0) {
    const formData = new FormData();
    formData.append('message', message);
    attachments.forEach((file) => {
      formData.append('attachments', file);
    });
    return apiPost<ApiResponse<Ticket>>(`/support/tickets/${ticketId}/reply`, formData);
  }
  return apiPost<ApiResponse<Ticket>>(`/support/tickets/${ticketId}/reply`, { message });
};

/**
 * Get ticket replies
 */
export const getTicketReplies = async (ticketId: number): Promise<ApiResponse<any[]>> => {
  return apiGet<ApiResponse<any[]>>(`/support/tickets/${ticketId}/replies`);
};

/**
 * Mark ticket replies as read
 */
export const markTicketRepliesAsRead = async (ticketId: number): Promise<ApiResponse> => {
  return apiPost<ApiResponse>(`/support/tickets/${ticketId}/mark-read`);
};

// ==================== Ticket Actions APIs ====================

/**
 * Close ticket
 */
export const closeTicket = async (ticketId: number, feedback?: string): Promise<ApiResponse<Ticket>> => {
  return apiPost<ApiResponse<Ticket>>(`/support/tickets/${ticketId}/close`, { feedback });
};

/**
 * Reopen ticket
 */
export const reopenTicket = async (ticketId: number, reason: string): Promise<ApiResponse<Ticket>> => {
  return apiPost<ApiResponse<Ticket>>(`/support/tickets/${ticketId}/reopen`, { reason });
};

/**
 * Update ticket priority
 */
export const updateTicketPriority = async (ticketId: number, priority: TicketPriority): Promise<ApiResponse<Ticket>> => {
  return apiPut<ApiResponse<Ticket>>(`/support/tickets/${ticketId}/priority`, { priority });
};

/**
 * Rate ticket resolution
 */
export const rateTicket = async (ticketId: number, rating: number, feedback?: string): Promise<ApiResponse> => {
  return apiPost<ApiResponse>(`/support/tickets/${ticketId}/rate`, { rating, feedback });
};

// ==================== Ticket Statistics APIs ====================

/**
 * Get ticket statistics
 */
export const getTicketStats = async (): Promise<ApiResponse<{
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  averageResponseTime: string;
  averageResolutionTime: string;
  byCategory: {
    category: TicketCategory;
    count: number;
  }[];
  byPriority: {
    priority: TicketPriority;
    count: number;
  }[];
}>> => {
  return apiGet<ApiResponse<{
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
    averageResponseTime: string;
    averageResolutionTime: string;
    byCategory: {
      category: TicketCategory;
      count: number;
    }[];
    byPriority: {
      priority: TicketPriority;
      count: number;
    }[];
  }>>('/support/tickets/stats');
};

/**
 * Get tickets with unread replies count
 */
export const getUnreadRepliesCount = async (): Promise<ApiResponse<{ count: number }>> => {
  return apiGet<ApiResponse<{ count: number }>>('/support/tickets/unread-replies/count');
};

// ==================== FAQ APIs ====================

/**
 * Get all FAQs
 */
export const getFAQs = async (params?: {
  page?: number;
  size?: number;
  category?: string;
  search?: string;
}): Promise<PaginatedResponse<FAQ>> => {
  return apiGet<PaginatedResponse<FAQ>>('/support/faqs', params);
};

/**
 * Get FAQ by ID
 */
export const getFAQById = async (faqId: number): Promise<ApiResponse<FAQ>> => {
  return apiGet<ApiResponse<FAQ>>(`/support/faqs/${faqId}`);
};

/**
 * Get FAQs by category
 */
export const getFAQsByCategory = async (category: string, params?: PaginationParams): Promise<PaginatedResponse<FAQ>> => {
  return apiGet<PaginatedResponse<FAQ>>(`/support/faqs/category/${category}`, params);
};

/**
 * Search FAQs
 */
export const searchFAQs = async (search: string, params?: PaginationParams): Promise<PaginatedResponse<FAQ>> => {
  return apiGet<PaginatedResponse<FAQ>>('/support/faqs/search', { search, ...params });
};

/**
 * Get popular FAQs
 */
export const getPopularFAQs = async (limit?: number): Promise<ApiResponse<FAQ[]>> => {
  return apiGet<ApiResponse<FAQ[]>>('/support/faqs/popular', { limit });
};

/**
 * Get related FAQs
 */
export const getRelatedFAQs = async (faqId: number): Promise<ApiResponse<FAQ[]>> => {
  return apiGet<ApiResponse<FAQ[]>>(`/support/faqs/${faqId}/related`);
};

/**
 * Get FAQ categories
 */
export const getFAQCategories = async (): Promise<ApiResponse<FAQCategory[]>> => {
  return apiGet<ApiResponse<FAQCategory[]>>('/support/faqs/categories');
};

/**
 * Mark FAQ as helpful
 */
export const markFAQHelpful = async (faqId: number): Promise<ApiResponse> => {
  return apiPost<ApiResponse>(`/support/faqs/${faqId}/helpful`);
};

/**
 * Mark FAQ as not helpful
 */
export const markFAQNotHelpful = async (faqId: number): Promise<ApiResponse> => {
  return apiPost<ApiResponse>(`/support/faqs/${faqId}/not-helpful`);
};

// ==================== Contact Support APIs ====================

/**
 * Get support contact information
 */
export const getSupportContact = async (): Promise<ApiResponse<{
  email: string;
  phone: string;
  whatsapp?: string;
  workingHours: string;
  responseTime: string;
}>> => {
  return apiGet<ApiResponse<{
    email: string;
    phone: string;
    whatsapp?: string;
    workingHours: string;
    responseTime: string;
  }>>('/support/contact');
};

/**
 * Send feedback
 */
export const sendFeedback = async (data: {
  subject: string;
  message: string;
  type: 'FEEDBACK' | 'SUGGESTION' | 'COMPLAINT';
}): Promise<ApiResponse> => {
  return apiPost<ApiResponse>('/support/feedback', data);
};

// ==================== Live Chat APIs ====================

/**
 * Check live chat availability
 */
export const checkLiveChatAvailability = async (): Promise<ApiResponse<{
  available: boolean;
  message?: string;
  estimatedWaitTime?: string;
}>> => {
  return apiGet<ApiResponse<{
    available: boolean;
    message?: string;
    estimatedWaitTime?: string;
  }>>('/support/live-chat/availability');
};

/**
 * Start live chat session
 */
export const startLiveChatSession = async (data: {
  subject: string;
  initialMessage: string;
}): Promise<ApiResponse<{
  sessionId: string;
  chatUrl: string;
}>> => {
  return apiPost<ApiResponse<{
    sessionId: string;
    chatUrl: string;
  }>>('/support/live-chat/start', data);
};

// ==================== Ticket Templates APIs ====================

/**
 * Get ticket templates/common issues
 */
export const getTicketTemplates = async (): Promise<ApiResponse<{
  category: TicketCategory;
  templates: {
    title: string;
    description: string;
    suggestedPriority: TicketPriority;
  }[];
}[]>> => {
  return apiGet<ApiResponse<{
    category: TicketCategory;
    templates: {
      title: string;
      description: string;
      suggestedPriority: TicketPriority;
    }[];
  }[]>>('/support/templates');
};

// ==================== Ticket Attachments APIs ====================

/**
 * Download ticket attachment
 */
export const downloadTicketAttachment = async (ticketId: number, attachmentId: number): Promise<Blob> => {
  const response = await fetch(`/api/support/tickets/${ticketId}/attachments/${attachmentId}/download`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return response.blob();
};

/**
 * Delete ticket attachment
 */
export const deleteTicketAttachment = async (ticketId: number, attachmentId: number): Promise<ApiResponse> => {
  return apiPost<ApiResponse>(`/support/tickets/${ticketId}/attachments/${attachmentId}/delete`);
};

// ==================== Help Center APIs ====================

/**
 * Get help center articles
 */
export const getHelpCenterArticles = async (params?: {
  page?: number;
  size?: number;
  category?: string;
  search?: string;
}): Promise<PaginatedResponse<{
  id: number;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  views: number;
  helpful: number;
  lastUpdated: string;
}>> => {
  return apiGet<PaginatedResponse<{
    id: number;
    title: string;
    slug: string;
    category: string;
    excerpt: string;
    views: number;
    helpful: number;
    lastUpdated: string;
  }>>('/support/help-center/articles', params);
};

/**
 * Get help center article by slug
 */
export const getHelpCenterArticle = async (slug: string): Promise<ApiResponse<{
  id: number;
  title: string;
  content: string;
  category: string;
  views: number;
  helpful: number;
  notHelpful: number;
  relatedArticles: any[];
  lastUpdated: string;
}>> => {
  return apiGet<ApiResponse<{
    id: number;
    title: string;
    content: string;
    category: string;
    views: number;
    helpful: number;
    notHelpful: number;
    relatedArticles: any[];
    lastUpdated: string;
  }>>(`/support/help-center/articles/${slug}`);
};

/**
 * Get help center categories
 */
export const getHelpCenterCategories = async (): Promise<ApiResponse<{
  name: string;
  slug: string;
  icon: string;
  articleCount: number;
}[]>> => {
  return apiGet<ApiResponse<{
    name: string;
    slug: string;
    icon: string;
    articleCount: number;
  }[]>>('/support/help-center/categories');
};

/**
 * Mark help article as helpful
 */
export const markArticleHelpful = async (articleId: number): Promise<ApiResponse> => {
  return apiPost<ApiResponse>(`/support/help-center/articles/${articleId}/helpful`);
};

/**
 * Mark help article as not helpful
 */
export const markArticleNotHelpful = async (articleId: number): Promise<ApiResponse> => {
  return apiPost<ApiResponse>(`/support/help-center/articles/${articleId}/not-helpful`);
};

// ==================== Video Tutorials APIs ====================

/**
 * Get video tutorials
 */
export const getVideoTutorials = async (params?: {
  page?: number;
  size?: number;
  category?: string;
}): Promise<PaginatedResponse<{
  id: number;
  title: string;
  description: string;
  videoUrl: string;
  thumbnail: string;
  category: string;
  duration: string;
  views: number;
}>> => {
  return apiGet<PaginatedResponse<{
    id: number;
    title: string;
    description: string;
    videoUrl: string;
    thumbnail: string;
    category: string;
    duration: string;
    views: number;
  }>>('/support/video-tutorials', params);
};
