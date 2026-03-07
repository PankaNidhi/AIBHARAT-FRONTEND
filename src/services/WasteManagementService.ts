/**
 * Waste Management Service
 * Handles API calls and data management for Municipal Waste Management module
 */

export interface WasteProjectConfig {
  id: string;
  country: string;
  hostAuthority: string;
  projectStage: string;
  dailyWasteVolume: number;
  article6Enabled: boolean;
  ownershipType: string;
  wasteStreams: WasteStreamConfig[];
  mrvData: MRVDataPoint[];
  scenarios: WasteScenario[];
  createdAt: string;
  updatedAt: string;
}

export interface WasteStreamConfig {
  id: string;
  streamType: 'organic' | 'hazardous' | 'collection';
  percentageAllocation: number;
  technology: string;
  biogasOption?: 'cooking_gas' | 'chp_electricity';
  status: 'active' | 'blocked' | 'maintenance';
}

export interface MRVDataPoint {
  id: string;
  category: 'waste_volume' | 'organic_fraction' | 'biogas_yield' | 'electricity_output' | 'rfid_tracking';
  value: number;
  unit: string;
  timestamp: string;
  source: 'manual' | 'sensor' | 'rfid';
  uncertaintyBuffer: number;
  bufferedValue: number;
  validationStatus: 'valid' | 'blocked' | 'pending';
}

export interface WasteScenario {
  id: string;
  scenarioName: 'conservative' | 'expected' | 'optimized';
  organicEfficiency: number;
  biogasYield: number;
  electricityConversion: number;
  collectionRate: number;
  annualCO2Reduction: number;
  annualBiogasProduction: number;
  annualElectricityGeneration: number;
  revenuePotential: number;
  mrvReadiness: number;
  article6Compliance: boolean;
}

class WasteManagementService {
  private storageKey = 'waste_management_project';

  /**
   * Get or create waste project configuration
   */
  getProject(): WasteProjectConfig {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      return JSON.parse(stored);
    }

    // Create default project with Ghana-specific defaults
    const defaultProject: WasteProjectConfig = {
      id: this.generateId(),
      country: 'Ghana',
      hostAuthority: 'EPA Ghana',
      projectStage: 'Feasibility/Stage B',
      dailyWasteVolume: 120,
      article6Enabled: true,
      ownershipType: 'Host Country',
      wasteStreams: [],
      mrvData: [],
      scenarios: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.saveProject(defaultProject);
    return defaultProject;
  }

  /**
   * Save project configuration
   */
  saveProject(project: WasteProjectConfig): void {
    project.updatedAt = new Date().toISOString();
    localStorage.setItem(this.storageKey, JSON.stringify(project));
  }

  /**
   * Update waste streams configuration
   */
  updateWasteStreams(streams: WasteStreamConfig[]): WasteProjectConfig {
    const project = this.getProject();
    project.wasteStreams = streams;
    this.saveProject(project);
    return project;
  }

  /**
   * Add MRV data point
   */
  addMRVData(dataPoint: Omit<MRVDataPoint, 'id' | 'timestamp' | 'bufferedValue'>): WasteProjectConfig {
    const project = this.getProject();
    
    const newDataPoint: MRVDataPoint = {
      ...dataPoint,
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      bufferedValue: dataPoint.value * (1 - dataPoint.uncertaintyBuffer),
    };

    project.mrvData.push(newDataPoint);
    this.saveProject(project);
    return project;
  }

  /**
   * Calculate and save scenario
   */
  calculateScenario(scenarioName: 'conservative' | 'expected' | 'optimized'): WasteScenario {
    const project = this.getProject();
    
    // Get scenario parameters
    const params = this.getScenarioParameters(scenarioName);
    
    // Calculate emissions and outputs
    const calculations = this.calculateEmissionsAndOutputs(project, params);
    
    const scenario: WasteScenario = {
      id: this.generateId(),
      scenarioName,
      ...params,
      ...calculations,
    };

    // Update project scenarios
    const existingIndex = project.scenarios.findIndex(s => s.scenarioName === scenarioName);
    if (existingIndex >= 0) {
      project.scenarios[existingIndex] = scenario;
    } else {
      project.scenarios.push(scenario);
    }
    
    this.saveProject(project);
    return scenario;
  }

  /**
   * Get scenario parameters based on type
   */
  private getScenarioParameters(scenarioName: string) {
    const params = {
      conservative: {
        organicEfficiency: 0.55,
        biogasYield: 80,
        electricityConversion: 0.30,
        collectionRate: 0.85,
      },
      expected: {
        organicEfficiency: 0.62,
        biogasYield: 100,
        electricityConversion: 0.35,
        collectionRate: 0.90,
      },
      optimized: {
        organicEfficiency: 0.65,
        biogasYield: 120,
        electricityConversion: 0.40,
        collectionRate: 0.95,
      },
    };

    return params[scenarioName as keyof typeof params];
  }

  /**
   * Calculate emissions reductions and outputs
   */
  private calculateEmissionsAndOutputs(project: WasteProjectConfig, params: any) {
    const dailyWaste = project.dailyWasteVolume;
    const organicStream = project.wasteStreams.find(s => s.streamType === 'organic');
    const organicPercentage = organicStream?.percentageAllocation || 0.62;

    // Annual organic waste (tonnes/year)
    const annualOrganicWaste = dailyWaste * (organicPercentage / 100) * 365;

    // Biogas production (m³/year)
    const annualBiogasProduction = annualOrganicWaste * params.biogasYield * params.organicEfficiency;

    // Electricity generation (kWh/year) - if CHP option selected
    const biogasOption = organicStream?.biogasOption;
    const annualElectricityGeneration = biogasOption === 'chp_electricity' 
      ? annualBiogasProduction * params.electricityConversion 
      : 0;

    // CO2 reduction calculations (tCO2e/year)
    // 1. Avoided methane from landfill (21x GWP)
    const avoidedMethane = annualOrganicWaste * 0.5 * 21 / 1000; // tCO2e

    // 2. Fossil fuel substitution from electricity
    const fossilFuelSubstitution = annualElectricityGeneration * 0.0007; // tCO2e (0.7 kg CO2/kWh grid factor)

    // 3. Reduced synthetic fertilizer (if digestate used)
    const reducedFertilizer = annualOrganicWaste * 0.1 * 0.5; // tCO2e

    const annualCO2Reduction = avoidedMethane + fossilFuelSubstitution + reducedFertilizer;

    // Revenue potential ($15/tCO2e baseline)
    const revenuePotential = annualCO2Reduction * 15;

    // MRV readiness score (0-100)
    const mrvReadiness = this.calculateMRVReadiness(project);

    // Article 6 compliance check
    const article6Compliance = project.article6Enabled && 
                               project.hostAuthority === 'EPA Ghana' &&
                               mrvReadiness >= 70;

    return {
      annualCO2Reduction: Math.round(annualCO2Reduction),
      annualBiogasProduction: Math.round(annualBiogasProduction),
      annualElectricityGeneration: Math.round(annualElectricityGeneration),
      revenuePotential: Math.round(revenuePotential),
      mrvReadiness,
      article6Compliance,
    };
  }

  /**
   * Calculate MRV readiness score
   */
  private calculateMRVReadiness(project: WasteProjectConfig): number {
    let score = 0;

    // Waste streams configured (30 points)
    if (project.wasteStreams.length === 3) {
      const total = project.wasteStreams.reduce((sum, s) => sum + s.percentageAllocation, 0);
      if (Math.abs(total - 100) < 0.1) {
        score += 30;
      }
    }

    // MRV data collected (40 points)
    const requiredCategories = ['waste_volume', 'organic_fraction', 'biogas_yield'];
    const collectedCategories = new Set(project.mrvData.map(d => d.category));
    const categoryScore = (requiredCategories.filter(c => collectedCategories.has(c as any)).length / requiredCategories.length) * 40;
    score += categoryScore;

    // Article 6 enabled (15 points)
    if (project.article6Enabled) {
      score += 15;
    }

    // Host authority set (15 points)
    if (project.hostAuthority === 'EPA Ghana') {
      score += 15;
    }

    return Math.round(score);
  }

  /**
   * Get all scenarios
   */
  getScenarios(): WasteScenario[] {
    const project = this.getProject();
    return project.scenarios;
  }

  /**
   * Clear all data (for testing)
   */
  clearData(): void {
    localStorage.removeItem(this.storageKey);
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default new WasteManagementService();
