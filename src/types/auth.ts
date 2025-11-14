export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface AuthState {
  user: User | null;
  userType: 'company' | 'employee' | '';
  token: string | null;
  loading: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  address: string;
  phone: string;
  email: string;
  GST: string;
  password: string;
}