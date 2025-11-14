import { User } from './auth';

export interface Employee extends User {
  companyId: string;
  roleId: string;
  role?: Role;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployeeRequest {
  name: string;
  email: string;
  phone?: string;
  roleId: string;
  password: string;
}

export interface UpdateEmployeeRequest {
  name?: string;
  email?: string;
  phone?: string;
  roleId?: string;
}

export interface EmployeeResponse {
  id: string;
  name: string;
  email: string;
  phone?: string;
  companyId: string;
  roleId: string;
  company: {
    id: string;
    name: string;
  };
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: RolePermission[];
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface RolePermission {
  id: string;
  roleId: string;
  permissionId: string;
  permission: Permission;
}

export interface CreateRoleRequest {
  name: string;
  description: string;
  permissionIds?: string[];
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  permissionIds?: string[];
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface PermissionsResponse {
  permissions: Record<string, Permission[]>;
}

export interface RolesResponse {
  roles: Role[];
}

export interface EmployeesResponse {
  employees: EmployeeResponse[];
}