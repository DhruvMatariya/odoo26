import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'Admin' | 'Fleet Manager' | 'Dispatcher' | 'Driver';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
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

const INITIAL_DRIVERS: Driver[] = [
  { id: 'DR-001', name: 'James Mwangi', license: 'DL-TRK-2019-001', licenseExpiry: '2025-12-31', safetyScore: 92, tripsCompleted: 145, status: 'On Duty', category: 'Truck' },
  { id: 'DR-002', name: 'Sarah Kamau', license: 'DL-VAN-2020-002', licenseExpiry: '2024-08-15', safetyScore: 88, tripsCompleted: 98, status: 'Off Duty', category: 'Van' },
  { id: 'DR-003', name: 'Peter Odhiambo', license: 'DL-TRK-2018-003', licenseExpiry: '2023-03-20', safetyScore: 75, tripsCompleted: 210, status: 'Suspended', category: 'Truck' },
  { id: 'DR-004', name: 'Alice Njeri', license: 'DL-BKE-2022-004', licenseExpiry: '2026-06-30', safetyScore: 95, tripsCompleted: 62, status: 'On Duty', category: 'Bike' },
  { id: 'DR-005', name: 'David Otieno', license: 'DL-VAN-2021-005', licenseExpiry: '2025-09-10', safetyScore: 83, tripsCompleted: 127, status: 'Off Duty', category: 'Van' },
];

const INITIAL_TRIPS: Trip[] = [
  { id: 'TR-001', vehicleId: 'VH-001', driverId: 'DR-001', origin: 'Nairobi', destination: 'Mombasa', status: 'Dispatched', departureTime: '2024-01-15 08:00', eta: '2024-01-15 18:00', cargoWeight: 12000, estimatedCost: 45000 },
  { id: 'TR-002', vehicleId: 'VH-002', driverId: 'DR-002', origin: 'Nairobi', destination: 'Kisumu', status: 'Completed', departureTime: '2024-01-14 07:00', eta: '2024-01-14 15:00', cargoWeight: 1200, estimatedCost: 18000 },
  { id: 'TR-003', vehicleId: 'VH-005', driverId: 'DR-005', origin: 'Mombasa', destination: 'Nairobi', status: 'Dispatched', departureTime: '2024-01-15 06:00', eta: '2024-01-15 16:00', cargoWeight: 1800, estimatedCost: 22000 },
  { id: 'TR-004', vehicleId: 'VH-004', driverId: 'DR-004', origin: 'Nairobi', destination: 'Thika', status: 'Completed', departureTime: '2024-01-13 09:00', eta: '2024-01-13 11:00', cargoWeight: 80, estimatedCost: 3500 },
  { id: 'TR-005', vehicleId: 'VH-006', driverId: 'DR-001', origin: 'Nairobi', destination: 'Eldoret', status: 'Draft', departureTime: '2024-01-16 08:00', eta: '2024-01-16 16:00', cargoWeight: 18000, estimatedCost: 52000 },
  { id: 'TR-006', vehicleId: 'VH-002', driverId: 'DR-002', origin: 'Kisumu', destination: 'Nakuru', status: 'Cancelled', departureTime: '2024-01-12 10:00', eta: '2024-01-12 14:00', cargoWeight: 900, estimatedCost: 12000 },
];

const INITIAL_MAINTENANCE: MaintenanceLog[] = [
  { id: 'MN-001', vehicleId: 'VH-003', issue: 'Engine Oil Change', serviceDate: '2024-01-10', cost: 8500, status: 'Completed' },
  { id: 'MN-002', vehicleId: 'VH-001', issue: 'Brake Pad Replacement', serviceDate: '2024-01-15', cost: 15000, status: 'Scheduled' },
  { id: 'MN-003', vehicleId: 'VH-003', issue: 'Transmission Repair', serviceDate: '2024-01-14', cost: 45000, status: 'In Progress' },
  { id: 'MN-004', vehicleId: 'VH-006', issue: 'Tire Rotation', serviceDate: '2024-01-08', cost: 6000, status: 'Completed' },
  { id: 'MN-005', vehicleId: 'VH-005', issue: 'Air Filter Replacement', serviceDate: '2024-01-20', cost: 2500, status: 'Scheduled' },
];

const INITIAL_EXPENSES: Expense[] = [
  { id: 'EX-001', tripId: 'TR-001', fuelAmount: 120, fuelCost: 18000, otherExpense: 2500, expenseNote: 'Toll fees', date: '2024-01-15' },
  { id: 'EX-002', tripId: 'TR-002', fuelAmount: 45, fuelCost: 6750, otherExpense: 500, expenseNote: 'Parking', date: '2024-01-14' },
  { id: 'EX-003', tripId: 'TR-003', fuelAmount: 85, fuelCost: 12750, otherExpense: 1800, expenseNote: 'Toll + refreshments', date: '2024-01-15' },
  { id: 'EX-004', tripId: 'TR-004', fuelAmount: 8, fuelCost: 1200, otherExpense: 0, expenseNote: '', date: '2024-01-13' },
];

const DEMO_USERS = [
  { id: 'U-001', name: 'Alex Administrator', email: 'admin@fleetflow.com',    role: 'Admin'         as UserRole, password: 'password' },
  { id: 'U-002', name: 'Mike Fleet',         email: 'manager@fleetflow.com',  role: 'Fleet Manager' as UserRole, password: 'password' },
  { id: 'U-003', name: 'Dana Dispatch',      email: 'dispatcher@fleetflow.com',role: 'Dispatcher'   as UserRole, password: 'password' },
  { id: 'U-004', name: 'James Mwangi',       email: 'driver@fleetflow.com',   role: 'Driver'        as UserRole, password: 'password' },
  // Primary demo accounts (shown on login page)
  { id: 'U-005', name: 'Fleet Manager',      email: 'manager@fleetflow.io',   role: 'Fleet Manager' as UserRole, password: 'demo123' },
  { id: 'U-006', name: 'Dana Dispatcher',    email: 'dispatch@fleetflow.io',  role: 'Dispatcher'    as UserRole, password: 'demo123' },
];

interface AppContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  vehicles: Vehicle[];
  drivers: Driver[];
  trips: Trip[];
  maintenance: MaintenanceLog[];
  expenses: Expense[];
  login: (email: string, password: string, role: UserRole) => boolean;
  logout: () => void;
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => void;
  addTrip: (trip: Omit<Trip, 'id'>) => void;
  addMaintenanceLog: (log: Omit<MaintenanceLog, 'id'>) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateVehicleStatus: (id: string, status: Vehicle['status']) => void;
  updateDriverStatus: (id: string, status: Driver['status']) => void;
  updateTripStatus: (id: string, status: Trip['status']) => void;
  getVehicleById: (id: string) => Vehicle | undefined;
  getDriverById: (id: string) => Driver | undefined;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [drivers, setDrivers] = useState<Driver[]>(INITIAL_DRIVERS);
  const [trips, setTrips] = useState<Trip[]>(INITIAL_TRIPS);
  const [maintenance, setMaintenance] = useState<MaintenanceLog[]>(INITIAL_MAINTENANCE);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);

  const login = (email: string, password: string, role: UserRole): boolean => {
    const demoUser = DEMO_USERS.find(u => u.email === email);
    if (demoUser) {
      if (demoUser.password !== password) return false;
      setCurrentUser({ id: demoUser.id, name: demoUser.name, email: demoUser.email, role: demoUser.role });
      setIsAuthenticated(true);
      return true;
    }
    // Unknown user — accept any credentials
    const user: User = {
      id: `U-${Date.now()}`,
      name: email.split('@')[0].replace(/\./g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      email,
      role,
    };
    setCurrentUser(user);
    setIsAuthenticated(true);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const addVehicle = (vehicle: Omit<Vehicle, 'id'>) => {
    const id = `VH-${String(vehicles.length + 1).padStart(3, '0')}`;
    setVehicles(prev => [...prev, { ...vehicle, id }]);
  };

  const addTrip = (trip: Omit<Trip, 'id'>) => {
    const id = `TR-${String(trips.length + 1).padStart(3, '0')}`;
    setTrips(prev => [...prev, { ...trip, id }]);
    setVehicles(prev => prev.map(v => v.id === trip.vehicleId ? { ...v, status: 'On Trip' } : v));
    setDrivers(prev => prev.map(d => d.id === trip.driverId ? { ...d, status: 'On Duty' } : d));
  };

  const addMaintenanceLog = (log: Omit<MaintenanceLog, 'id'>) => {
    const id = `MN-${String(maintenance.length + 1).padStart(3, '0')}`;
    setMaintenance(prev => [...prev, { ...log, id }]);
    setVehicles(prev => prev.map(v => v.id === log.vehicleId ? { ...v, status: 'In Shop' } : v));
  };

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const id = `EX-${String(expenses.length + 1).padStart(3, '0')}`;
    setExpenses(prev => [...prev, { ...expense, id }]);
  };

  const updateVehicleStatus = (id: string, status: Vehicle['status']) =>
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, status } : v));

  const updateDriverStatus = (id: string, status: Driver['status']) =>
    setDrivers(prev => prev.map(d => d.id === id ? { ...d, status } : d));

  const updateTripStatus = (id: string, status: Trip['status']) => {
    const trip = trips.find(t => t.id === id);
    setTrips(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    if ((status === 'Completed' || status === 'Cancelled') && trip) {
      setVehicles(prev => prev.map(v => v.id === trip.vehicleId ? { ...v, status: 'Available' } : v));
      setDrivers(prev => prev.map(d => d.id === trip.driverId ? { ...d, status: 'Off Duty' } : d));
    }
  };

  const getVehicleById = (id: string) => vehicles.find(v => v.id === id);
  const getDriverById = (id: string) => drivers.find(d => d.id === id);

  return (
    <AppContext.Provider value={{
      currentUser, isAuthenticated,
      vehicles, drivers, trips, maintenance, expenses,
      login, logout,
      addVehicle, addTrip, addMaintenanceLog, addExpense,
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