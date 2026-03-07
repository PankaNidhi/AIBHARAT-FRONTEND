// Scenario Storage Hook

import { useState, useEffect } from 'react';
import { SavedScenario, ScenarioFormData, CalculationResults } from '../types/scenario';

const STORAGE_KEY = 'saved-scenarios';

const generateId = (): string => {
  return `scenario-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const useScenarioStorage = () => {
  const [scenarios, setScenarios] = useState<SavedScenario[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    loadScenarios();
  }, []);
  
  const getStoredScenarios = (): SavedScenario[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      
      const parsed = JSON.parse(stored);
      return parsed.map((s: any) => ({
        ...s,
        createdAt: new Date(s.createdAt),
        updatedAt: new Date(s.updatedAt),
        results: {
          ...s.results,
          calculationDate: new Date(s.results.calculationDate)
        }
      }));
    } catch {
      return [];
    }
  };
  
  const saveScenario = async (
    name: string,
    formData: ScenarioFormData,
    results: CalculationResults,
    description?: string
  ): Promise<string> => {
    setIsLoading(true);
    
    try {
      const scenario: SavedScenario = {
        id: generateId(),
        name,
        description,
        moduleId: formData.moduleId,
        projectId: formData.projectId,
        formData,
        results,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const existingScenarios = getStoredScenarios();
      const updatedScenarios = [...existingScenarios, scenario];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedScenarios));
      
      setScenarios(updatedScenarios);
      return scenario.id;
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadScenarios = async (moduleId?: string, projectId?: string): Promise<SavedScenario[]> => {
    setIsLoading(true);
    
    try {
      let allScenarios = getStoredScenarios();
      
      if (moduleId) {
        allScenarios = allScenarios.filter(s => s.moduleId === moduleId);
      }
      
      if (projectId) {
        allScenarios = allScenarios.filter(s => s.projectId === projectId);
      }
      
      setScenarios(allScenarios);
      return allScenarios;
    } finally {
      setIsLoading(false);
    }
  };
  
  const deleteScenario = async (scenarioId: string): Promise<void> => {
    const existingScenarios = getStoredScenarios();
    const updatedScenarios = existingScenarios.filter(s => s.id !== scenarioId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedScenarios));
    setScenarios(updatedScenarios);
  };
  
  const updateScenario = async (
    scenarioId: string,
    formData: ScenarioFormData,
    results: CalculationResults
  ): Promise<void> => {
    const existingScenarios = getStoredScenarios();
    const updatedScenarios = existingScenarios.map(s => {
      if (s.id === scenarioId) {
        return {
          ...s,
          formData,
          results,
          updatedAt: new Date()
        };
      }
      return s;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedScenarios));
    setScenarios(updatedScenarios);
  };
  
  return {
    scenarios,
    isLoading,
    saveScenario,
    loadScenarios,
    deleteScenario,
    updateScenario
  };
};
