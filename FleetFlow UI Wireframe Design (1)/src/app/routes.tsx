import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { DashboardPage } from './pages/DashboardPage';
import { VehiclesPage } from './pages/VehiclesPage';
import { TripsPage } from './pages/TripsPage';
import { MaintenancePage } from './pages/MaintenancePage';
import { ExpensesPage } from './pages/ExpensesPage';
import { DriversPage } from './pages/DriversPage';
import { AnalyticsPage } from './pages/AnalyticsPage';

export const router = createBrowserRouter([
  { path: '/',       element: <LandingPage /> },
  { path: '/login',  element: <LoginPage /> },
  { path: '/signup', element: <SignupPage /> },
  {
    // Pathless layout route — wraps all app screens
    element: <Layout />,
    children: [
      { path: '/dashboard',   element: <DashboardPage /> },
      { path: '/vehicles',    element: <VehiclesPage /> },
      { path: '/trips',       element: <TripsPage /> },
      { path: '/maintenance', element: <MaintenancePage /> },
      { path: '/expenses',    element: <ExpensesPage /> },
      { path: '/drivers',     element: <DriversPage /> },
      { path: '/analytics',   element: <AnalyticsPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
