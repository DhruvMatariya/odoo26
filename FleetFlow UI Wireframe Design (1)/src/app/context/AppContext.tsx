import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { getStoredSession, setStoredSession, clearStoredSession } from '../services/auth';
import { authApi, vehiclesApi, driversApi, tripsApi, maintenanceApi, expensesApi } from '../services/api';
import type { BackendDriver } from '../services/api';

export type UserRole = 'Admin' | 'Fleet Manager' | 'Dispatcher' | 'Driver';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profilePic?: string;
  accessCode?: string;
  organisationId?: string;
}

export interface Vehicle {
  id: string;
  model: string;
  plate: string;
  type: 'Truck' | 'Van' | 'Bike';
  capacity: number;
  status: 'Available' | 'On Trip' | 'In Shop' | 'Retired';
  odometer: number;
  purchaseDate: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  license: string;
  licenseExpiry: string;
  safetyScore: number;
  tripsCompleted: number;
  status: 'On Duty' | 'Off Duty' | 'Suspended';
  category: string;
}

export interface Trip {
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

export interface MaintenanceLog {
  id: string;
  vehicleId: string;
  issue: string;
  serviceDate: string;
  cost: number;
  status: 'Scheduled' | 'In Progress' | 'Completed';
}

export interface Expense {
  id: string;
  tripId: string;
  fuelAmount: number;
  fuelCost: number;
  otherExpense: number;
  expenseNote: string;
  date: string;
}

const INITIAL_VEHICLES: Vehicle[] = [
  { id: 'VH-001', model: 'Mercedes Actros', plate: 'KCA 001A', type: 'Truck', capacity: 15000, status: 'On Trip', odometer: 145230, purchaseDate: '2021-03-15' },
  { id: 'VH-002', model: 'Toyota Hiace', plate: 'KCB 234B', type: 'Van', capacity: 1500, status: 'Available', odometer: 89420, purchaseDate: '2022-06-10' },
  { id: 'VH-003', model: 'Isuzu NQR', plate: 'KCC 456C', type: 'Truck', capacity: 8000, status: 'In Shop', odometer: 213450, purchaseDate: '2020-01-20' },
  { id: 'VH-004', model: 'Honda CB500', plate: 'KCD 789D', type: 'Bike', capacity: 150, status: 'Available', odometer: 34120, purchaseDate: '2023-02-28' },
  { id: 'VH-005', model: 'Ford Transit', plate: 'KCE 012E', type: 'Van', capacity: 2000, status: 'On Trip', odometer: 67890, purchaseDate: '2022-09-05' },
  { id: 'VH-006', model: 'Volvo FH16', plate: 'KCF 345F', type: 'Truck', capacity: 20000, status: 'Available', odometer: 320780, purchaseDate: '2019-11-12' },
  { id: 'VH-007', model: 'Yamaha FZ', plate: 'KCG 678G', type: 'Bike', capacity: 100, status: 'Retired', odometer: 125000, purchaseDate: '2018-05-30' },
];

const INITIAL_DRIVERS: Driver[] = [];

const INITIAL_TRIPS: Trip[] = [];

const INITIAL_MAINTENANCE: MaintenanceLog[] = [];

const INITIAL_EXPENSES: Expense[] = [];

function mapBackendRole(role: string): UserRole {
  const r = (role || '').toLowerCase();
  if (r === 'manager') return 'Fleet Manager';
  if (r === 'dispatcher') return 'Dispatcher';
  if (r === 'admin') return 'Admin';
  if (r === 'driver') return 'Driver';
  return 'Fleet Manager';
}

interface AppContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  authReady: boolean;
  vehicles: Vehicle[];
  drivers: Driver[];
  trips: Trip[];
  maintenance: MaintenanceLog[];
  expenses: Expense[];
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (updates: { name?: string; profilePic?: string }) => void;
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => Promise<{ success: boolean; error?: string }>;
  fetchVehicles: () => Promise<void>;
  addDriver: (driver: { name: string; phone: string; licenseNumber: string; licenseExpiry?: string }) => Promise<{ success: boolean; error?: string }>;
  fetchDrivers: () => Promise<void>;
  addTrip: (trip: Omit<Trip, 'id'>) => Promise<{ success: boolean; error?: string }>;
  fetchTrips: () => Promise<void>;
  addMaintenanceLog: (log: Omit<MaintenanceLog, 'id'>) => Promise<{ success: boolean; error?: string }>;
  fetchMaintenance: () => Promise<void>;
  updateMaintenanceStatus: (id: string, status: MaintenanceLog['status']) => Promise<{ success: boolean; error?: string }>;
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<{ success: boolean; error?: string }>;
  fetchExpenses: () => Promise<void>;
  deleteExpense: (id: string) => Promise<{ success: boolean; error?: string }>;
  updateVehicleStatus: (id: string, status: Vehicle['status']) => Promise<{ success: boolean; error?: string }>;
  updateDriverStatus: (id: string, status: Driver['status']) => Promise<{ success: boolean; error?: string }>;
  updateTripStatus: (id: string, status: Trip['status']) => Promise<{ success: boolean; error?: string }>;
  getVehicleById: (id: string) => Vehicle | undefined;
  getDriverById: (id: string) => Driver | undefined;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>(INITIAL_DRIVERS);
  const [trips, setTrips] = useState<Trip[]>(INITIAL_TRIPS);
  const [maintenance, setMaintenance] = useState<MaintenanceLog[]>(INITIAL_MAINTENANCE);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);

  // Restore session from localStorage on mount
  useEffect(() => {
    const session = getStoredSession();
    if (session?.user) {
      setCurrentUser(session.user);
      setIsAuthenticated(true);
    }
    setAuthReady(true);
  }, []);

  const fetchVehicles = useCallback(async () => {
    const result = await vehiclesApi.list();
    if ('error' in result) {
      console.error('Failed to load vehicles:', result.error);
      if (result.error === 'No organisation context') {
        setCurrentUser(null);
        setIsAuthenticated(false);
        clearStoredSession();
      }
    } else {
      setVehicles(result);
    }
  }, []);

  function backendDriverToDriver(d: BackendDriver): Driver {
    const statusMap: Record<string, Driver['status']> = {
      active: 'On Duty',
      inactive: 'Off Duty',
      suspended: 'Suspended',
    };
    return {
      id: d.id,
      name: d.name,
      phone: d.phone,
      license: d.licenseNumber,
      licenseExpiry: d.licenseExpiry,
      safetyScore: 0,
      tripsCompleted: 0,
      status: statusMap[d.status] || 'Off Duty',
      category: '',
    };
  }

  const fetchDrivers = useCallback(async () => {
    const result = await driversApi.list();
    if ('error' in result) {
      console.error('Failed to load drivers:', result.error);
    } else {
      setDrivers(result.map(backendDriverToDriver));
    }
  }, []);

  const fetchTrips = useCallback(async () => {
    const result = await tripsApi.list();
    if ('error' in result) {
      console.error('Failed to load trips:', result.error);
    } else {
      setTrips(result);
    }
  }, []);

  const fetchMaintenance = useCallback(async () => {
    const result = await maintenanceApi.list();
    if ('error' in result) {
      console.error('Failed to load maintenance logs:', result.error);
    } else {
      setMaintenance(result);
    }
  }, []);

  const fetchExpenses = useCallback(async () => {
    const result = await expensesApi.list();
    if ('error' in result) {
      console.error('Failed to load expenses:', result.error);
    } else {
      setExpenses(result);
    }
  }, []);

  // Load vehicles, drivers, trips, maintenance, and expenses when authenticated
  useEffect(() => {
    if (!authReady || !isAuthenticated) return;
    fetchVehicles();
    fetchDrivers();
    fetchTrips();
    fetchMaintenance();
    fetchExpenses();
  }, [authReady, isAuthenticated, fetchVehicles, fetchDrivers, fetchTrips, fetchMaintenance, fetchExpenses]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const result = await authApi.login(email, password);
    if ('error' in result) {
      return { success: false, error: result.error };
    }
    const user: User = {
      id: String(result.user.id),
      name: result.user.name,
      email: result.user.email,
      role: mapBackendRole(result.user.role),
      accessCode: result.user.access_code,
      organisationId: result.user.organisation_id,
    };
    setCurrentUser(user);
    setIsAuthenticated(true);
    setStoredSession({ token: result.token, user });
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    clearStoredSession();
  };

  const updateUser = (updates: { name?: string; profilePic?: string }) => {
    setCurrentUser(prev => prev ? { ...prev, ...updates } : prev);
  };

  const addVehicle = async (vehicle: Omit<Vehicle, 'id'>): Promise<{ success: boolean; error?: string }> => {
    const result = await vehiclesApi.create({
      model: vehicle.model,
      plate: vehicle.plate,
      type: vehicle.type,
      capacity: vehicle.capacity,
      status: vehicle.status,
      odometer: vehicle.odometer,
      purchaseDate: vehicle.purchaseDate || undefined,
    });
    if ('error' in result) {
      return { success: false, error: result.error };
    }
    setVehicles(prev => [...prev, result]);
    return { success: true };
  };

  const addDriver = async (driver: { name: string; phone: string; licenseNumber: string; licenseExpiry?: string }): Promise<{ success: boolean; error?: string }> => {
    const result = await driversApi.create(driver);
    if ('error' in result) {
      return { success: false, error: result.error };
    }
    setDrivers(prev => [...prev, backendDriverToDriver(result)]);
    return { success: true };
  };

  const addTrip = async (trip: Omit<Trip, 'id'>): Promise<{ success: boolean; error?: string }> => {
    const result = await tripsApi.create({
      vehicleId: trip.vehicleId,
      driverId: trip.driverId,
      origin: trip.origin,
      destination: trip.destination,
      departureTime: trip.departureTime || undefined,
      eta: trip.eta || undefined,
      cargoWeight: trip.cargoWeight,
      estimatedCost: trip.estimatedCost,
    });
    if ('error' in result) {
      return { success: false, error: result.error };
    }
    setTrips(prev => [...prev, result]);
    return { success: true };
  };

  const addMaintenanceLog = async (log: Omit<MaintenanceLog, 'id'>): Promise<{ success: boolean; error?: string }> => {
    const result = await maintenanceApi.create({
      vehicleId: log.vehicleId,
      issue: log.issue,
      serviceDate: log.serviceDate,
      cost: log.cost,
      status: log.status,
    });
    if ('error' in result) {
      return { success: false, error: result.error };
    }
    setMaintenance(prev => [...prev, result]);
    // Backend sets vehicle to "In Shop" — refresh vehicles
    fetchVehicles();
    return { success: true };
  };

  const updateMaintenanceStatus = async (id: string, status: MaintenanceLog['status']): Promise<{ success: boolean; error?: string }> => {
    const result = await maintenanceApi.updateStatus(id, status);
    if ('error' in result) {
      return { success: false, error: result.error };
    }
    setMaintenance(prev => prev.map(m => m.id === id ? { ...m, status } : m));
    // Completed may set vehicle back to Available — refresh vehicles
    if (status === 'Completed') {
      fetchVehicles();
    }
    return { success: true };
  };

  const addExpense = async (expense: Omit<Expense, 'id'>): Promise<{ success: boolean; error?: string }> => {
    const result = await expensesApi.create({
      tripId: expense.tripId,
      fuelAmount: expense.fuelAmount,
      fuelCost: expense.fuelCost,
      otherExpense: expense.otherExpense,
      expenseNote: expense.expenseNote,
      date: expense.date,
    });
    if ('error' in result) {
      return { success: false, error: result.error };
    }
    setExpenses(prev => [...prev, result]);
    return { success: true };
  };

  const deleteExpense = async (id: string): Promise<{ success: boolean; error?: string }> => {
    const result = await expensesApi.remove(id);
    if ('error' in result) {
      return { success: false, error: result.error };
    }
    setExpenses(prev => prev.filter(e => e.id !== id));
    return { success: true };
  };

  const updateVehicleStatus = async (id: string, status: Vehicle['status']): Promise<{ success: boolean; error?: string }> => {
    const result = await vehiclesApi.updateStatus(id, status);
    if ('error' in result) {
      return { success: false, error: result.error };
    }
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, status } : v));
    return { success: true };
  };

  const updateDriverStatus = async (id: string, status: Driver['status']): Promise<{ success: boolean; error?: string }> => {
    const backendStatus: Record<string, string> = {
      'On Duty': 'active',
      'Off Duty': 'inactive',
      'Suspended': 'suspended',
    };
    const result = await driversApi.updateStatus(id, backendStatus[status] as 'active' | 'inactive' | 'suspended');
    if ('error' in result) {
      return { success: false, error: result.error };
    }
    setDrivers(prev => prev.map(d => d.id === id ? { ...d, status } : d));
    return { success: true };
  };

  const updateTripStatus = async (id: string, status: Trip['status']): Promise<{ success: boolean; error?: string }> => {
    const result = await tripsApi.updateStatus(id, status);
    if ('error' in result) {
      return { success: false, error: result.error };
    }
    const trip = trips.find(t => t.id === id);
    setTrips(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    if ((status === 'Completed' || status === 'Cancelled') && trip) {
      // Refresh vehicles and drivers to get updated statuses
      fetchVehicles();
      fetchDrivers();
    }
    return { success: true };
  };

  const getVehicleById = (id: string) => vehicles.find(v => v.id === id);
  const getDriverById = (id: string) => drivers.find(d => d.id === id);

  return (
    <AppContext.Provider value={{
      currentUser, isAuthenticated, authReady,
      vehicles, drivers, trips, maintenance, expenses,
      login, logout, updateUser,
      addVehicle, fetchVehicles, addDriver, fetchDrivers, addTrip, fetchTrips,
      addMaintenanceLog, fetchMaintenance, updateMaintenanceStatus,
      addExpense, fetchExpenses, deleteExpense,
      updateVehicleStatus, updateDriverStatus, updateTripStatus,
      getVehicleById, getDriverById,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}