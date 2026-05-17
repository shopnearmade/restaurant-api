// Centralized API service module — all server communication goes through here

const API_BASE = 'http://localhost:4000/api';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('restaurant_token');
}

// Core request helper: attaches JWT header and parses JSON errors uniformly
async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init.headers ?? {}),
  };

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  const json = await res.json();

  if (!res.ok) {
    // Prefer the server's message field, fall back to error field
    throw new Error(json.message ?? json.error ?? 'Request failed');
  }
  return json as T;
}

// ─── Shared Types ──────────────────────────────────────────────────────────────

export interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: 'Appetizer' | 'Main Course' | 'Dessert' | 'Beverage' | 'Side Dish';
  available: boolean;
  ingredients?: string[];
  calories?: number;
  preparationTime?: number;
}

export interface Customer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface Order {
  _id: string;
  customer: Customer | string;
  menuItem: { item: MenuItem | string; quantity: number }[];
  totalAmount: number;
  status: 'Pending' | 'Preparing' | 'Ready' | 'Completed' | 'Cancelled';
  specialInstructions?: string;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: { id: string; name: string; role: string };
}

// ─── Auth ──────────────────────────────────────────────────────────────────────

export const authApi = {
  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (name: string, email: string, password: string, role = 'staff') =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    }),
};

// ─── Menu Items ────────────────────────────────────────────────────────────────

export const menuApi = {
  getAll: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<{ total: number; page: number; limit: number; menuItems: MenuItem[] }>(
      `/menuItems${qs}`
    );
  },

  create: (data: Omit<MenuItem, '_id'>) =>
    request<MenuItem>('/menuItems', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: Partial<Omit<MenuItem, '_id'>>) =>
    request<MenuItem>(`/menuItems/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: string) =>
    request<{ message: string }>(`/menuItems/${id}`, { method: 'DELETE' }),
};

// ─── Customers ─────────────────────────────────────────────────────────────────

export const customerApi = {
  getAll: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<{ total: number; page: number; limit: number; customers: Customer[] }>(
      `/customers${qs}`
    );
  },

  create: (data: Omit<Customer, '_id'>) =>
    request<Customer>('/customers', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: Partial<Omit<Customer, '_id'>>) =>
    request<Customer>(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: string) =>
    request<{ message: string }>(`/customers/${id}`, { method: 'DELETE' }),
};

// ─── Orders ────────────────────────────────────────────────────────────────────

export const orderApi = {
  getAll: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<{ total: number; page: number; limit: number; orders: Order[] }>(
      `/orders${qs}`
    );
  },

  getPopular: () => request<{ item: string; count: number }>('/orders/popular'),

  create: (data: {
    customer: string;
    menuItem: { item: string; quantity: number }[];
    totalAmount: number;
    status: string;
    specialInstructions?: string;
  }) => request<Order>('/orders', { method: 'POST', body: JSON.stringify(data) }),

  update: (
    id: string,
    data: Partial<Pick<Order, 'status' | 'specialInstructions' | 'totalAmount'>>
  ) => request<Order>(`/orders/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  delete: (id: string) =>
    request<{ message: string }>(`/orders/${id}`, { method: 'DELETE' }),
};
