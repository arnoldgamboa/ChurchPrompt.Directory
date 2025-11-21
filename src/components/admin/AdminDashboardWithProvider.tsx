import React from 'react';
import ConvexClientProvider from '@/components/providers/ConvexClientProvider';
import { AdminDashboard } from './AdminDashboard';

interface AdminDashboardWithProviderProps {
  convexUrl: string;
}

export function AdminDashboardWithProvider({ convexUrl }: AdminDashboardWithProviderProps) {
  return (
    <ConvexClientProvider convexUrl={convexUrl}>
      <AdminDashboard />
    </ConvexClientProvider>
  );
}
