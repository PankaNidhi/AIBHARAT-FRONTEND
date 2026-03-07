// Interactive Scenario MRV Modeling Types

export interface ScenarioFormData {
  // Identification
  scenarioName: string;
  description?: string;
  moduleId: string;
  projectId: string;
  
  // Economic Module fields
  projectSize?: number;
  investmentAmount?: number;
  operatingCost?: number;
  annualRevenue?: number;
  projectDuration?: number;
  discountRate?: number;
  
  // Tree Project fields
  projectArea?: number;
  initialTrees?: number;
  treeSpecies?: string;
  costPerTree?: number;
  survivalRate?: number;
  sequestrationConstant?: number;
}

export interface CalculationResults {
  // Economic results
  npv?: number;
  irr?: number;
  paybackPeriod?: number;
  estimatedCO2Reduction?: number;
  
  // Tree project results
  totalSequestration?: number;
  totalProjectCost?: number;
  survivalAdjustedTrees?: number;
  annualCO2Absorption?: number;
  
  // Common metadata
  calculationDate: Date;
  moduleType: 'economic' | 'tree';
  complianceStatus: string;
}

export interface SavedScenario {
  id: string;
  name: string;
  description?: string;
  moduleId: string;
  projectId: string;
  formData: ScenarioFormData;
  results: CalculationResults;
  createdAt: Date;
  updatedAt: Date;
}

export interface FormField {
  name: string;
  label: string;
  type: 'number' | 'text' | 'select';
  required: boolean;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  helpText?: string;
  options?: Array<{ value: string; label: string }>;
}
