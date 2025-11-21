import React from 'react';
import ConvexClientProvider from '@/components/providers/ConvexClientProvider';
import { SubmissionForm } from './SubmissionForm';

interface SubmissionFormWithProviderProps {
  convexUrl: string;
}

export const SubmissionFormWithProvider: React.FC<SubmissionFormWithProviderProps> = ({ 
  convexUrl
}) => {
  return (
    <ConvexClientProvider convexUrl={convexUrl}>
      <SubmissionForm />
    </ConvexClientProvider>
  );
};
