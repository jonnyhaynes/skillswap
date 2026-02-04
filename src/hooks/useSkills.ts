import { useContext } from 'react';
import { SkillsContext, type SkillsContextType } from '@/context/SkillsContext';

export function useSkills(): SkillsContextType {
  const context = useContext(SkillsContext);
  if (!context) {
    throw new Error('useSkills must be used within a SkillsProvider');
  }
  return context;
}
