import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { IndustryType, Module, MODULES, STEEL_DATA, CEMENT_DATA, IndustryData } from '../types/industry';

interface ModuleContextType {
  selectedModules: string[];
  setSelectedModules: (moduleIds: string[]) => void;
  isModuleSelected: (moduleId: string) => boolean;
  getActiveIndustries: () => IndustryType[];
  getIndustryData: (industryType: IndustryType) => IndustryData;
  filterDataByModules: <T extends { industryType?: IndustryType }>(data: T[]) => T[];
  modules: Module[];
}

const ModuleContext = createContext<ModuleContextType | undefined>(undefined);

export const useModuleContext = () => {
  const context = useContext(ModuleContext);
  if (!context) {
    throw new Error('useModuleContext must be used within ModuleProvider');
  }
  return context;
};

interface ModuleProviderProps {
  children: ReactNode;
}

export const ModuleProvider: React.FC<ModuleProviderProps> = ({ children }) => {
  const [selectedModules, setSelectedModulesState] = useState<string[]>(() => {
    const stored = localStorage.getItem('selectedModules');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('selectedModules', JSON.stringify(selectedModules));
  }, [selectedModules]);

  const setSelectedModules = (moduleIds: string[]) => {
    setSelectedModulesState(moduleIds);
  };

  const isModuleSelected = (moduleId: string): boolean => {
    return selectedModules.includes(moduleId);
  };

  const getActiveIndustries = (): IndustryType[] => {
    if (selectedModules.length === 0) {
      return ['steel', 'cement'];
    }
    return selectedModules
      .map(id => MODULES.find(m => m.id === id)?.industryType)
      .filter((type): type is IndustryType => type !== undefined);
  };

  const getIndustryData = (industryType: IndustryType): IndustryData => {
    return industryType === 'steel' ? STEEL_DATA : CEMENT_DATA;
  };

  const filterDataByModules = <T extends { industryType?: IndustryType }>(data: T[]): T[] => {
    if (selectedModules.length === 0) {
      return data;
    }
    const activeIndustries = getActiveIndustries();
    return data.filter(item => 
      item.industryType && activeIndustries.includes(item.industryType)
    );
  };

  const value: ModuleContextType = {
    selectedModules,
    setSelectedModules,
    isModuleSelected,
    getActiveIndustries,
    getIndustryData,
    filterDataByModules,
    modules: MODULES,
  };

  return <ModuleContext.Provider value={value}>{children}</ModuleContext.Provider>;
};
