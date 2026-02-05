import { useContext } from 'react';
import { SwapsContext, type SwapsContextType } from '@/context/SwapsContext';

export function useSwaps(): SwapsContextType {
  const context = useContext(SwapsContext);
  if (!context) {
    throw new Error('useSwaps must be used within a SwapsProvider');
  }
  return context;
}
