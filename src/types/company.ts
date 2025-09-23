import { User } from './auth';

export interface Company extends User {
  address: string;
  GST: string;
  employees: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCompanyRequest {
  name: string;
  address: string;
  phone: string;
  email: string;
  GST: string;
  password: string;
}

export interface UpdateCompanyRequest {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  GST?: string;
}

export interface CompanyResponse {
  _id: string;
  name: string;
  address: string;
  phone: number;
  email: string;
  GST: string;
  employees: string[];
  createdAt: string;
  updatedAt: string;
}