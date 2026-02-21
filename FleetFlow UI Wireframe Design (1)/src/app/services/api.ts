/**
 * API client for FleetFlow backend.
 * Auth endpoints: POST /auth/login, POST /auth/signup
 */

const getBaseUrl = (): string => {
  const url = import.meta.env.VITE_API_URL;
  if (url) return url.replace(/\/$/, '');
  return 'http://localhost:5000';
};

export const apiBaseUrl = getBaseUrl();

export interface BackendUser {
  id: number;
  name: string;
  email: string;
  role: string;
  access_code?: string;
  organisation_id?: string;
}

export interface LoginResponse {
  token: string;
  user: BackendUser;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  role: 'manager' | 'dispatcher';
  organisationName?: string;
  organisationId?: string;
}

export interface SignupResponse {
  message: string;
  access_code?: string;
  user: BackendUser;
}

async function request<T>(
  path: string,
  options: RequestInit & { body?: object } = {}
): Promise<{ data?: T; error?: string; status: number }> {
  const { body, ...rest } = options;
  const url = `${apiBaseUrl}${path}`;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...((rest.headers as Record<string, string>) || {}),
  };
  try {
    const res = await fetch(url, {
      ...rest,
      headers,
      body: body ? JSON.stringify(body) : rest.body,
    });
    const text = await res.text();
    let data: T | undefined;
    try {
      data = text ? (JSON.parse(text) as T) : undefined;
    } catch {
      // non-JSON response
    }
    if (!res.ok) {
      const errMsg =
        (data as { error?: string })?.error ||
        res.statusText ||
        'Request failed';
      return { error: errMsg, status: res.status };
    }
    return { data: data as T, status: res.status };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Network error';
    return { error: message, status: 0 };
  }
}

export const authApi = {
  async login(email: string, password: string): Promise<{ token: string; user: BackendUser } | { error: string }> {
    const result = await request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: { email: email.trim().toLowerCase(), password },
    });
    if (result.error || !result.data) {
      return { error: result.error || 'Login failed' };
    }
    return { token: result.data.token, user: result.data.user };
  },

  async signup(payload: SignupPayload): Promise<SignupResponse | { error: string }> {
    const body: Record<string, unknown> = {
      name: payload.name.trim(),
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
      role: payload.role,
    };
    if (payload.role === 'manager' && payload.organisationName != null) {
      body.organisationName = payload.organisationName.trim();
    }
    if (payload.role === 'dispatcher' && payload.organisationId != null) {
      body.organisationId = String(payload.organisationId).trim();
    }
    const result = await request<SignupResponse>('/auth/signup', {
      method: 'POST',
      body,
    });
    if (result.error || !result.data) {
      return { error: result.error || 'Signup failed' };
    }
    return result.data;
  },
};

export function getAuthToken(): string | null {
  try {
    const raw = localStorage.getItem('fleetflow_auth');
    if (!raw) return null;
    const data = JSON.parse(raw) as { token?: string };
    return data?.token ?? null;
  } catch {
    return null;
  }
}

/** Authenticated request: adds Bearer token. Use for protected endpoints. */
async function authRequest<T>(
  path: string,
  options: RequestInit & { body?: object } = {}
): Promise<{ data?: T; error?: string; status: number }> {
  const token = getAuthToken();
  if (!token) {
    return { error: 'Not authenticated', status: 401 };
  }
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...((options.headers as Record<string, string>) || {}),
  };
  return request<T>(path, { ...options, headers });
}

/** Backend vehicle shape (snake_case from DB) */
export interface BackendVehicle {
  id: string;
  model: string;
  plate: string;
  type: 'Truck' | 'Van' | 'Bike';
  capacity: number;
  status: 'Available' | 'On Trip' | 'In Shop' | 'Retired';
  odometer: number;
  purchaseDate: string;
}

export const vehiclesApi = {
  async list(): Promise<BackendVehicle[] | { error: string }> {
    const result = await authRequest<BackendVehicle[]>('/vehicles', { method: 'GET' });
    if (result.error || result.data === undefined) {
      return { error: result.error || 'Failed to load vehicles' };
    }
    return result.data;
  },

  async create(payload: {
    model: string;
    plate: string;
    type: 'Truck' | 'Van' | 'Bike';
    capacity: number;
    status?: 'Available' | 'On Trip' | 'In Shop' | 'Retired';
    odometer?: number;
    purchaseDate?: string;
  }): Promise<BackendVehicle | { error: string }> {
    const result = await authRequest<BackendVehicle>('/vehicles', {
      method: 'POST',
      body: payload,
    });
    if (result.error || !result.data) {
      return { error: result.error || 'Failed to create vehicle' };
    }
    return result.data;
  },

  async updateStatus(
    id: string,
    status: 'Available' | 'On Trip' | 'In Shop' | 'Retired'
  ): Promise<BackendVehicle | { error: string }> {
    const result = await authRequest<BackendVehicle>(`/vehicles/${id}/status`, {
      method: 'PATCH',
      body: { status },
    });
    if (result.error || !result.data) {
      return { error: result.error || 'Failed to update status' };
    }
    return result.data;
  },
};

/** Backend driver shape */
export interface BackendDriver {
  id: string;
  name: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
}

export const driversApi = {
  async list(): Promise<BackendDriver[] | { error: string }> {
    const result = await authRequest<BackendDriver[]>('/drivers', { method: 'GET' });
    if (result.error || result.data === undefined) {
      return { error: result.error || 'Failed to load drivers' };
    }
    return result.data;
  },

  async create(payload: {
    name: string;
    phone: string;
    licenseNumber: string;
    licenseExpiry?: string;
  }): Promise<BackendDriver | { error: string }> {
    const result = await authRequest<BackendDriver>('/drivers', {
      method: 'POST',
      body: payload,
    });
    if (result.error || !result.data) {
      return { error: result.error || 'Failed to create driver' };
    }
    return result.data;
  },

  async updateStatus(
    id: string,
    status: 'active' | 'inactive' | 'suspended'
  ): Promise<BackendDriver | { error: string }> {
    const result = await authRequest<BackendDriver>(`/drivers/${id}/status`, {
      method: 'PATCH',
      body: { status },
    });
    if (result.error || !result.data) {
      return { error: result.error || 'Failed to update driver status' };
    }
    return result.data;
  },
};

/** Backend trip shape */
export interface BackendTrip {
  id: string;
  vehicleId: string;
  driverId: string;
  origin: string;
  destination: string;
  status: 'Draft' | 'Dispatched' | 'Completed' | 'Cancelled';
  departureTime: string;
  eta: string;
  cargoWeight: number;
  estimatedCost: number;
}

export const tripsApi = {
  async list(): Promise<BackendTrip[] | { error: string }> {
    const result = await authRequest<BackendTrip[]>('/trips', { method: 'GET' });
    if (result.error || result.data === undefined) {
      return { error: result.error || 'Failed to load trips' };
    }
    return result.data;
  },

  async create(payload: {
    vehicleId: string;
    driverId: string;
    origin: string;
    destination: string;
    departureTime?: string;
    eta?: string;
    cargoWeight?: number;
    estimatedCost?: number;
  }): Promise<BackendTrip | { error: string }> {
    const result = await authRequest<BackendTrip>('/trips', {
      method: 'POST',
      body: payload,
    });
    if (result.error || !result.data) {
      return { error: result.error || 'Failed to create trip' };
    }
    return result.data;
  },

  async updateStatus(
    id: string,
    status: 'Draft' | 'Dispatched' | 'Completed' | 'Cancelled'
  ): Promise<BackendTrip | { error: string }> {
    const result = await authRequest<BackendTrip>(`/trips/${id}/status`, {
      method: 'PATCH',
      body: { status },
    });
    if (result.error || !result.data) {
      return { error: result.error || 'Failed to update trip status' };
    }
    return result.data;
  },
};

/** Backend maintenance log shape */
export interface BackendMaintenanceLog {
  id: string;
  vehicleId: string;
  issue: string;
  serviceDate: string;
  cost: number;
  status: 'Scheduled' | 'In Progress' | 'Completed';
}

export const maintenanceApi = {
  async list(): Promise<BackendMaintenanceLog[] | { error: string }> {
    const result = await authRequest<BackendMaintenanceLog[]>('/maintenance', { method: 'GET' });
    if (result.error || result.data === undefined) {
      return { error: result.error || 'Failed to load maintenance logs' };
    }
    return result.data;
  },

  async create(payload: {
    vehicleId: string;
    issue: string;
    serviceDate: string;
    cost?: number;
    status?: 'Scheduled' | 'In Progress' | 'Completed';
  }): Promise<BackendMaintenanceLog | { error: string }> {
    const result = await authRequest<BackendMaintenanceLog>('/maintenance', {
      method: 'POST',
      body: payload,
    });
    if (result.error || !result.data) {
      return { error: result.error || 'Failed to create maintenance log' };
    }
    return result.data;
  },

  async updateStatus(
    id: string,
    status: 'Scheduled' | 'In Progress' | 'Completed'
  ): Promise<BackendMaintenanceLog | { error: string }> {
    const result = await authRequest<BackendMaintenanceLog>(`/maintenance/${id}/status`, {
      method: 'PATCH',
      body: { status },
    });
    if (result.error || !result.data) {
      return { error: result.error || 'Failed to update maintenance status' };
    }
    return result.data;
  },
};

/** Backend expense shape */
export interface BackendExpense {
  id: string;
  tripId: string;
  fuelAmount: number;
  fuelCost: number;
  otherExpense: number;
  expenseNote: string;
  date: string;
}

export const expensesApi = {
  async list(): Promise<BackendExpense[] | { error: string }> {
    const result = await authRequest<BackendExpense[]>('/expenses', { method: 'GET' });
    if (result.error || result.data === undefined) {
      return { error: result.error || 'Failed to load expenses' };
    }
    return result.data;
  },

  async create(payload: {
    tripId: string;
    fuelAmount?: number;
    fuelCost?: number;
    otherExpense?: number;
    expenseNote?: string;
    date: string;
  }): Promise<BackendExpense | { error: string }> {
    const result = await authRequest<BackendExpense>('/expenses', {
      method: 'POST',
      body: payload,
    });
    if (result.error || !result.data) {
      return { error: result.error || 'Failed to create expense' };
    }
    return result.data;
  },

  async remove(id: string): Promise<{ message: string; id: string } | { error: string }> {
    const result = await authRequest<{ message: string; id: string }>(`/expenses/${id}`, {
      method: 'DELETE',
    });
    if (result.error || !result.data) {
      return { error: result.error || 'Failed to delete expense' };
    }
    return result.data;
  },
};
