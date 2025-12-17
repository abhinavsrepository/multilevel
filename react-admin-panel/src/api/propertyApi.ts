import { api } from './axiosConfig';
import { Property, PropertyFilters, CreatePropertyRequest, PropertyInvestor } from '@/types/property.types';
import { PaginatedResponse, FilterParams } from '@/types/api.types';

export const propertyApi = {
  // Get all properties
  getProperties: (params: FilterParams & PropertyFilters) =>
    api.get<PaginatedResponse<Property>>('/admin/properties', { params }),

  // Get property by ID
  getPropertyById: (id: number) => api.get<Property>(`/admin/properties/${id}`),

  // Create property
  createProperty: (data: FormData) =>
    api.post<Property>('/admin/properties', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Update property
  updateProperty: (id: number, data: FormData) =>
    api.put<Property>(`/admin/properties/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Delete property
  deleteProperty: (id: number) => api.delete(`/admin/properties/${id}`),

  // Update property status
  updatePropertyStatus: (id: number, status: string) =>
    api.put(`/admin/properties/${id}/status`, { status }),

  // Toggle featured
  toggleFeatured: (id: number) => api.put(`/admin/properties/${id}/toggle-featured`),

  // Toggle trending
  toggleTrending: (id: number) => api.put(`/admin/properties/${id}/toggle-trending`),

  // Get property investors
  getPropertyInvestors: (id: number, params: any) =>
    api.get<PaginatedResponse<PropertyInvestor>>(`/admin/properties/${id}/investors`, { params }),

  // Export properties
  exportProperties: (params: PropertyFilters) =>
    api.get('/admin/properties/export', { params, responseType: 'blob' }),

  // Import properties
  importProperties: (file: File) => api.uploadFile('/admin/properties/import', file),

  // Upload property images
  uploadPropertyImages: (propertyId: number, files: File[]) =>
    api.uploadMultipleFiles(`/admin/properties/${propertyId}/images`, files, 'images'),

  // Delete property image
  deletePropertyImage: (propertyId: number, imageId: number) =>
    api.delete(`/admin/properties/${propertyId}/images/${imageId}`),

  // Upload property document
  uploadPropertyDocument: (propertyId: number, file: File, documentType: string) =>
    api.uploadFile(`/admin/properties/${propertyId}/documents`, file, 'document', {
      documentType,
    }),

  // Delete property document
  deletePropertyDocument: (propertyId: number, documentId: number) =>
    api.delete(`/admin/properties/${propertyId}/documents/${documentId}`),

  // Send update to investors
  sendUpdateToInvestors: (propertyId: number, data: any) =>
    api.post(`/admin/properties/${propertyId}/send-update`, data),
};
