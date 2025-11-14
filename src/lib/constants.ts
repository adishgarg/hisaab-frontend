export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  COMPANIES: '/companies',
  EMPLOYEES: '/employees',
  ROLES: '/roles',
  UNITS: '/units',
  INVOICES: '/invoices',
  ENTITIES: '/entities',
  ITEMS: '/items',
} as const;

export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  USER_TYPE: 'userType',
} as const;

export const USER_TYPES = {
  COMPANY: 'company',
  EMPLOYEE: 'employee',
} as const;
