// Municipal Waste Management Type Definitions

export interface WasteProject {
  id: string;
  projectId: string;
  name: string;
  country: string;
  hostAuthority: string;
  projectStage: string;
  dailyWasteVolume: number;
  article6Enabled: boolean;
  ownershipType: string;
  createdAt: string;
  updatedAt: string;
}

export interface WasteStream {
  id: string;
  projectId: string;
  streamType: 'organic' | 'hazardous' | 'collection';
  percentageAllocation: number;
  technology: string;
  status: 'active' | 'blocked' | 'maintenance';
  biogasOption?: 'cooking_gas' | 'chp_electricity';
  incinerationType?: string;
  collectionImprovement?: number;
}

export interface WasteConfiguration {
  organicStream: OrganicStreamConfig;
  hazardousStream: HazardousStreamConfig;
  collectionStream: CollectionStreamConfig;
  totalDailyVolume: number;
}

export interface OrganicStreamConfig {
  percentage: number;
  technology: string;
  biogasOption: 'cooking_gas' | 'chp_electricity';
  expectedBiogasYield: number;
}

export interface HazardousStreamConfig {
  percentage: number;
  technology: string;
  incinerationType: string;
  expectedEnergyRecovery: number;
}

export interface CollectionStreamConfig {
  percentage: number;
  improvementType: string;
  collectionEfficiency: number;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface WasteOutput {
  id: string;
  streamId: string;
  outputType: 'biogas' | 'electricity' | 'digestate' | 'heat';
  dailyQuantity: number;
  unit: string;
  climateBenefit?: string;
}

export interface MRVDataPoint {
  id: string;
  category: 'waste_volume' | 'organic_fraction' | 'biogas_yield' | 'electricity_output' | 'rfid_tracking';
  value: number;
  unit: string;
  timestamp: Date;
  source: 'manual' | 'sensor' | 'rfid';
  uncertaintyBuffer: number;
}

export interface WasteScenario {
  id: string;
  projectId: string;
  scenarioName: 'conservative' | 'expected' | 'optimized';
  organicEfficiency: number;
  biogasYield: number;
  electricityConversion: number;
  collectionRate: number;
  annualCO2Reduction?: number;
  annualBiogasProduction?: number;
  annualElectricityGeneration?: number;
  revenuePotential?: number;
  mrvReadiness?: number;
  article6Compliance: boolean;
}

export interface Article6Status {
  hostCountryAuthorization: boolean;
  epaApprovalStatus: string;
  authorizationDate?: string;
  correspondingAdjustmentReady: boolean;
  goldStandardStatus: string;
  complianceScore: number;
}

export interface MRVStatus {
  dataCompleteness: number;
  validationStatus: string;
  blockedStates: string[];
  lastUpdate: string;
}
