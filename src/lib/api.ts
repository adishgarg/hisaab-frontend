import { API_BASE_URL, STORAGE_KEYS } from "./constants";
import type { LoginRequest, SignupRequest } from "@/types/auth";

class ApiClient {
    private baseURL: string;
    
    constructor(baseURL: string) {
        this.baseURL = baseURL; 
    }

    private getAuthToken(): string | null {
        return localStorage.getItem(STORAGE_KEYS.TOKEN);
    }

    private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
        const url = `${this.baseURL}${endpoint}`;
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string>),
        };
        
        const authToken = this.getAuthToken();
        if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
        }
        
        try {
            const response = await fetch(url, {
                ...options,
                headers,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'API request failed');
            }

            return response.json();
        } catch (error) {
            console.error(`API Error [${options.method || 'GET'} ${endpoint}]:`, error);
            throw error;
        }
    }

    async get(endpoint: string): Promise<any> {
        return this.request(endpoint, { method: 'GET' });
    }

    async post(endpoint: string, body?: any): Promise<any> {
        return this.request(endpoint, {
            method: 'POST',
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    async put(endpoint: string, body?: any): Promise<any> {
        return this.request(endpoint, {
            method: 'PUT',
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    async patch(endpoint: string, body?: any): Promise<any> {
        return this.request(endpoint, {
            method: 'PATCH',
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    async delete(endpoint: string): Promise<any> {
        return this.request(endpoint, { method: 'DELETE' });
    }
}

const apiClient = new ApiClient(API_BASE_URL);

export const authApi = {
    companyLogin: (data: LoginRequest) =>
        apiClient.post('/auth/login/company', data),

    employeeLogin: (data: LoginRequest) =>
        apiClient.post('/auth/login/employee', data),

    companySignup: (data: SignupRequest) =>
        apiClient.post('/auth/signup/company', data),
};

export const companyApi = {
    getAll: () => apiClient.get('/company/all'),
    getById: (id: string) => apiClient.get(`/company/${id}`),
    create: (data: any) => apiClient.post('/company/create', data),
    update: (id: string, data: any) => apiClient.put(`/company/${id}`, data),
    delete: (id: string) => apiClient.delete(`/company/${id}`),
};

export const employeeApi = {
    getByCompany: (companyId: string) => apiClient.get(`/employee/company/${companyId}`),
    getById: (id: string) => apiClient.get(`/employee/${id}`),
    create: (data: any) => apiClient.post('/employee/create', data),
    update: (id: string, data: any) => apiClient.put(`/employee/${id}`, data),
    updateRole: (id: string, roleId: string) => apiClient.patch(`/employee/${id}/role`, { roleId }),
    delete: (id: string) => apiClient.delete(`/employee/${id}`),
};

export const roleApi = {
    getAll: () => apiClient.get('/roles'),
    getPermissions: () => apiClient.get('/roles/permissions'),
    create: (data: any) => apiClient.post('/roles', data),
    update: (id: string, data: any) => apiClient.put(`/roles/${id}`, data),
    delete: (id: string) => apiClient.delete(`/roles/${id}`),
};

export const unitApi = {
    getAll: () => apiClient.get('/units/all'),
    getById: (id: string) => apiClient.get(`/units/${id}`),
    create: (data: any) => apiClient.post('/units/create', data),
    update: (id: string, data: any) => apiClient.put(`/units/${id}`, data),
    delete: (id: string) => apiClient.delete(`/units/${id}`),
};

export const invoiceApi = {
    getAll: () => apiClient.get('/invoices/all'),
    getById: (id: string) => apiClient.get(`/invoices/${id}`),
    create: (data: any) => apiClient.post('/invoices/create', data),
    update: (id: string, data: any) => apiClient.put(`/invoices/${id}`, data),
    delete: (id: string) => apiClient.delete(`/invoices/${id}`),
};

export const entityApi = {
    getAll: () => apiClient.get('/entities/all'),
    getById: (id: string) => apiClient.get(`/entities/${id}`),
    create: (data: any) => apiClient.post('/entities/create', data),
    update: (id: string, data: any) => apiClient.put(`/entities/${id}`, data),
    delete: (id: string) => apiClient.delete(`/entities/${id}`),
};
    
export const itemApi = {
    getAll: () => apiClient.get('/items/all'),
    getById: (id: string) => apiClient.get(`/items/${id}`),
    create: (data: any) => apiClient.post('/items/create', data),
    update: (id: string, data: any) => apiClient.put(`/items/${id}`, data),
    delete: (id: string) => apiClient.delete(`/items/${id}`),
};

export { apiClient };