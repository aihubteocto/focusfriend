import React from 'react';
import { cn } from '@/lib/utils';

interface StyleWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export const StyleWrapper = ({ children, className }: StyleWrapperProps) => (
  <div className={cn('focus-flow-extension', className)}>
    {children}
  </div>
);