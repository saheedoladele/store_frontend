const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Log the API base URL on initialization
console.log('[API] Base URL:', API_BASE_URL);

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
  };
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    console.log('[API] Client initialized with base URL:', this.baseURL);
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getAuthToken();
    const url = `${this.baseURL}${endpoint}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const bodyData = options.body ? JSON.parse(options.body as string) : null;
      console.log(`[API] ${options.method || 'GET'} ${url}`, bodyData);
    } catch (e) {
      console.log(`[API] ${options.method || 'GET'} ${url}`, options.body);
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log(`[API] Response status: ${response.status}`, response.statusText);

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      let data;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error('[API] Non-JSON response:', text);
        return {
          success: false,
          error: {
            message: `Server returned non-JSON response: ${text.substring(0, 100)}`,
          },
        };
      }

      if (!response.ok) {
        console.error('[API] Error response:', data);
        return {
          success: false,
          error: {
            message: data.error?.message || data.message || `HTTP ${response.status}: ${response.statusText}`,
          },
        };
      }

      console.log('[API] Success response:', data);
      return {
        success: true,
        data: data.data || data,
      };
    } catch (error) {
      console.error('[API] Network error:', error);
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Network error occurred. Please check if the backend server is running.',
        },
      };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async uploadFile<T>(endpoint: string, file: File): Promise<ApiResponse<T>> {
    const token = this.getAuthToken();
    const url = `${this.baseURL}${endpoint}`;

    const formData = new FormData();
    formData.append('file', file);

    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    console.log(`[API] POST (file upload) ${url}`, { fileName: file.name, fileSize: file.size, fileType: file.type });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      console.log(`[API] Response status: ${response.status}`, response.statusText);

      const contentType = response.headers.get('content-type');
      let data;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error('[API] Non-JSON response:', text);
        return {
          success: false,
          error: {
            message: `Server returned non-JSON response: ${text.substring(0, 100)}`,
          },
        };
      }

      if (!response.ok) {
        console.error('[API] Error response:', data);
        return {
          success: false,
          error: {
            message: data.error?.message || data.message || `HTTP ${response.status}: ${response.statusText}`,
          },
        };
      }

      console.log('[API] Success response:', data);
      return {
        success: true,
        data: data.data || data,
      };
    } catch (error) {
      console.error('[API] Network error:', error);
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Network error occurred. Please check if the backend server is running.',
        },
      };
    }
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
