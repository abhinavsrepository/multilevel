import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosRequestConfig } from 'axios';
import { toast } from 'react-toastify';

// Determine base URL
const getBaseUrl = () => {
  // For local development, use proxy
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return '/api/v1';
  }

  // For production, always use the backend URL
  return 'https://backend-node-373e.onrender.com/api/v1';
};

// Create axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: getBaseUrl(),
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add auth token to headers
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL || '/api/v1'}/auth/refresh-token`,
            { refreshToken }
          );

          const { token: newToken } = response.data.data;
          localStorage.setItem('token', newToken);

          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token failed - logout user
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    if (error.response) {
      const { status, data } = error.response as AxiosResponse<any>;

      switch (status) {
        case 400:
          toast.error(data.message || 'Bad Request');
          break;
        case 403:
          toast.error('Access Forbidden');
          break;
        case 404:
          toast.error('Resource Not Found');
          break;
        case 500:
          toast.error(data.message || data.error || 'Internal Server Error');
          break;
        default:
          toast.error(data.message || 'Something went wrong');
      }
    } else if (error.request) {
      toast.error('Network Error - Please check your connection');
    } else {
      toast.error('Request Error');
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

// Helper functions for API calls
export const apiGet = async <T = any>(url: string, params?: any): Promise<T> => {
  const response = await axiosInstance.get<T>(url, { params });
  return response.data;
};

export const apiPost = async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  const response = await axiosInstance.post<T>(url, data, config);
  return response.data;
};

export const apiPut = async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  const response = await axiosInstance.put<T>(url, data, config);
  return response.data;
};

export const apiDelete = async <T = any>(url: string): Promise<T> => {
  const response = await axiosInstance.delete<T>(url);
  return response.data;
};

export const apiPatch = async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  const response = await axiosInstance.patch<T>(url, data, config);
  return response.data;
};

// Upload file helper
export const apiUpload = async <T = any>(
  url: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<T> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axiosInstance.post<T>(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(progress);
      }
    },
  });

  return response.data;
};

// Upload multiple files
export const apiUploadMultiple = async <T = any>(
  url: string,
  files: File[],
  onProgress?: (progress: number) => void
): Promise<T> => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });

  const response = await axiosInstance.post<T>(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(progress);
      }
    },
  });

  return response.data;
};
