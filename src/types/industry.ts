/**
 * Industry-specific type definitions for module system
 */

export type IndustryType = 'steel' | 'cement' | 'waste' | 'champion' | 'tree';

export interface Module {
  id: string;
  name: string;
  industryType: IndustryType;
  description: string;
  icon: string;
  color: string;
}

export interface IndustryData {
  processes: string[];
  sensors: string[];
  wasteStreams: string[];
  complianceFrameworks: string[];
}

export interface SteelIndustryData extends IndustryData {
  eafProcesses: string[];
  blastFurnaceConfig: string;
  coalDisplacementMetrics: string[];
}

export interface CementIndustryData extends IndustryData {
  kilnProcesses: string[];
  clinkerProduction: string;
  rdfIntegration: string;
}

export const MODULES: Module[] = [
  {
    id: 'steel',
    name: 'Steel Production',
    industryType: 'steel',
    description: 'Electric Arc Furnace & Blast Furnace Operations',
    icon: '🏭',
    color: '#64748b',
  },
  {
    id: 'cement',
    name: 'Cement Manufacturing',
    industryType: 'cement',
    description: 'Rotary Kiln & Clinker Production',
    icon: '🏗️',
    color: '#78716c',
  },
  {
    id: 'waste',
    name: 'Municipal Waste Management',
    industryType: 'waste',
    description: 'Waste Collection, Processing & Recycling',
    icon: '♻️',
    color: '#10b981',
  },
  {
    id: 'champion',
    name: 'CHAMPION Module',
    industryType: 'champion',
    description: 'Scenario-based Learning & Decision Making',
    icon: '🎯',
    color: '#8b5cf6',
  },
  {
    id: 'tree',
    name: 'Tree Plantation',
    industryType: 'tree',
    description: 'Reforestation & Carbon Sequestration',
    icon: '🌳',
    color: '#059669',
  },
];

export const STEEL_DATA: SteelIndustryData = {
  processes: ['EAF Melting', 'Blast Furnace', 'Continuous Casting', 'Rolling Mill'],
  sensors: ['Temperature Sensors', 'Gas Analyzers', 'Power Meters', 'Vibration Sensors'],
  wasteStreams: ['Slag Recovery', 'Dust Collection', 'Biogas Integration'],
  complianceFrameworks: ['ISO 14001', 'EU ETS', 'Gold Standard'],
  eafProcesses: ['Scrap Melting', 'Biogas Injection', 'Alloy Addition'],
  blastFurnaceConfig: 'Integrated Steel Mill Configuration',
  coalDisplacementMetrics: ['Coal Reduction %', 'Biogas Substitution Rate', 'CO2 Avoided'],
};

export const CEMENT_DATA: CementIndustryData = {
  processes: ['Raw Material Preparation', 'Rotary Kiln', 'Clinker Cooling', 'Cement Grinding'],
  sensors: ['Temperature Sensors', 'Gas Analyzers', 'Flow Meters', 'Pressure Sensors'],
  wasteStreams: ['RDF Production', 'Alternative Raw Materials', 'Waste Heat Recovery'],
  complianceFrameworks: ['ISO 50001', 'GCCA Standards', 'Verra VCS'],
  kilnProcesses: ['Preheating', 'Calcination', 'Sintering', 'Cooling'],
  clinkerProduction: 'Dry Process Kiln Configuration',
  rdfIntegration: 'Alternative Fuel Substitution System',
};
