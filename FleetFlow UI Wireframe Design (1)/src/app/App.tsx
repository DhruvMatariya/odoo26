import React from 'react';
import { RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import { router } from './routes';
import { AppProvider } from './context/AppContext';

export default function App() {
  return (
    <AppProvider>
      <RouterProvider router={router} />
      <Toaster
        theme="dark"
        position="top-right"
        toastOptions={{
          style: {
            background: '#1A1D26',
            border: '1px solid #1E2330',
            color: '#F1F5F9',
            fontFamily: '"Sora", sans-serif',
            fontSize: 13,
          },
        }}
      />
    </AppProvider>
  );
}