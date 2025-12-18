import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';


// Production backend URL (fallback if env var not set)
const PRODUCTION_API_URL = 'https://mlm-backend-ljan.onrender.com/api/v1';

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? PRODUCTION_API_URL : '/api/v1');

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('adminToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Token expired - try refresh
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('adminRefreshToken');
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          {},
          {
            headers: { 'Refresh-Token': refreshToken || '' },
          }
        );

        const newToken = response.data.data.token;
        localStorage.setItem('adminToken', newToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    const errorMessage =
      (error.response?.data as any)?.message ||
      (error.response?.data as any)?.error ||
      error.message ||
      'An error occurred';

    console.error('API Error:', errorMessage);
    // Allow the calling component to handle the specific error if needed
    // or we could show a global toast here if we had one configured

    return Promise.reject(error);
  }
);

export default axiosInstance;

// API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: {
    total: number;
    page: number;
    pages: number;
  };
}

// Generic API methods
export const api = {
  get: <T = any>(url: string, config?: any) =>
    axiosInstance.get<ApiResponse<T>>(url, config),

  post: <T = any>(url: string, data?: any, config?: any) =>
    axiosInstance.post<ApiResponse<T>>(url, data, config),

  patch: <T = any>(url: string, data?: any, config?: any) =>
    axiosInstance.patch<ApiResponse<T>>(url, data, config),

  put: <T = any>(url: string, data?: any, config?: any) =>
    axiosInstance.put<ApiResponse<T>>(url, data, config),

  delete: <T = any>(url: string, config?: any) =>
    axiosInstance.delete<ApiResponse<T>>(url, config),

  uploadFile: <T = any>(
    url: string,
    file: File,
    fieldName: string = 'file',
    additionalData?: any
  ) => {
    const formData = new FormData();
    formData.append(fieldName, file);

    if (additionalData) {
      Object.keys(additionalData).forEach((key) => {
        formData.append(key, additionalData[key]);
      });
    }

    return axiosInstance.post<ApiResponse<T>>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  uploadMultipleFiles: <T = any>(
    url: string,
    files: File[],
    fieldName: string = 'files',
    additionalData?: any
  ) => {
    const formData = new FormData();

    files.forEach((file) => {
      formData.append(fieldName, file);
    });

    if (additionalData) {
      Object.keys(additionalData).forEach((key) => {
        if (typeof additionalData[key] === 'object') {
          formData.append(key, JSON.stringify(additionalData[key]));
        } else {
          formData.append(key, additionalData[key]);
        }
      });
    }

    return axiosInstance.post<ApiResponse<T>>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
