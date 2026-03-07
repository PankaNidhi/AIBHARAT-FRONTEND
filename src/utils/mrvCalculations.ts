// MRV Calculation Engine

import { ScenarioFormData, CalculationResults } from '../types/scenario';

interface EconomicCalculationInputs {
  projectSize: number;
  investmentAmount: number;
  operatingCost: number;
  annualRevenue: number;
  projectDuration: number;
  discountRate: number;
  moduleType: string;
}

interface TreeProjectCalculationInputs {
  projectArea: number;
  initialTrees: number;
  treeSpecies: string;
  costPerTree: number;
  survivalRate: number;
  projectDuration: number;
  sequestrationConstant: number;
}

export class MRVCalculationEngine {
  static calculateEconomicScenario(inputs: EconomicCalculationInputs): CalculationResults {
    const { investmentAmount, operatingCost, annualRevenue, projectDuration, discountRate } = inputs;
    
    // Calculate NPV
    const discountFactor = discountRate / 100;
    let npv = -investmentAmount;
    
    for (let year = 1; year <= projectDuration; year++) {
      const netCashFlow = annualRevenue - operatingCost;
      npv += netCashFlow / Math.pow(1 + discountFactor, year);
    }
    
    // Calculate IRR
    const irr = this.calculateIRR(investmentAmount, annualRevenue - operatingCost, projectDuration);
    
    // Calculate Payback Period
    const paybackPeriod = investmentAmount / (annualRevenue - operatingCost);
    
    // Estimate CO2 reduction
    const co2Reduction = this.estimateCO2Reduction(inputs.moduleType, inputs.projectSize);
    
    return {
      npv,
      irr,
      paybackPeriod,
      estimatedCO2Reduction: co2Reduction,
      calculationDate: new Date(),
      moduleType: 'economic',
      complianceStatus: this.getComplianceStatus(npv, irr)
    };
  }
  
  static calculateTreeProjectScenario(inputs: TreeProjectCalculationInputs): CalculationResults {
    const { initialTrees, costPerTree, survivalRate, projectDuration, sequestrationConstant } = inputs;
    
    // Calculate survival-adjusted tree count
    const survivalAdjustedTrees = initialTrees * (survivalRate / 100);
    
    // Calculate total project cost
    const totalProjectCost = initialTrees * costPerTree;
    
    // Calculate annual CO2 absorption
    const annualCO2Absorption = survivalAdjustedTrees * sequestrationConstant;
    
    // Calculate total sequestration
    const totalSequestration = annualCO2Absorption * projectDuration;
    
    return {
      totalSequestration,
      totalProjectCost,
      survivalAdjustedTrees,
      annualCO2Absorption,
      calculationDate: new Date(),
      moduleType: 'tree',
      complianceStatus: this.getTreeComplianceStatus(totalSequestration, inputs.projectArea)
    };
  }
  
  private static calculateIRR(investment: number, annualCashFlow: number, duration: number): number {
    let rate = 0.1;
    const tolerance = 0.0001;
    const maxIterations = 100;
    
    for (let i = 0; i < maxIterations; i++) {
      let npv = -investment;
      let derivative = 0;
      
      for (let year = 1; year <= duration; year++) {
        const factor = Math.pow(1 + rate, year);
        npv += annualCashFlow / factor;
        derivative -= year * annualCashFlow / Math.pow(1 + rate, year + 1);
      }
      
      if (Math.abs(npv) < tolerance) break;
      
      rate = rate - npv / derivative;
    }
    
    return rate * 100;
  }
  
  private static estimateCO2Reduction(moduleType: string, projectSize: number): number {
    const emissionFactors: Record<string, number> = {
      steel: 2.3,
      cement: 0.9,
      waste: 0.5,
      biogas: 1.2
    };
    
    const factor = emissionFactors[moduleType] || 1.0;
    const reductionPercentage = 0.15;
    
    return projectSize * factor * reductionPercentage;
  }
  
  private static getComplianceStatus(npv: number, irr: number): string {
    if (npv > 0 && irr > 8) return 'Excellent';
    if (npv > 0 && irr > 5) return 'Good';
    if (npv > 0) return 'Acceptable';
    return 'Needs Review';
  }
  
  private static getTreeComplianceStatus(totalSequestration: number, projectArea: number): string {
    const sequestrationPerHa = totalSequestration / projectArea;
    
    if (sequestrationPerHa > 100) return 'High Impact';
    if (sequestrationPerHa > 50) return 'Good Impact';
    if (sequestrationPerHa > 20) return 'Moderate Impact';
    return 'Low Impact';
  }
}

export class ScenarioValidationService {
  static validateEconomicForm(data: Partial<ScenarioFormData>): Record<string, string> {
    const errors: Record<string, string> = {};
    
    if (!data.scenarioName || data.scenarioName.trim() === '') {
      errors.scenarioName = 'Scenario name is required';
    }
    
    if (!data.projectSize || data.projectSize < 1000) {
      errors.projectSize = 'Project size must be at least 1,000';
    }
    
    if (!data.investmentAmount || data.investmentAmount < 10000) {
      errors.investmentAmount = 'Investment amount must be at least $10,000';
    }
    
    if (!data.operatingCost || data.operatingCost < 0) {
      errors.operatingCost = 'Operating cost must be positive';
    }
    
    if (!data.annualRevenue || (data.operatingCost && data.annualRevenue <= data.operatingCost)) {
      errors.annualRevenue = 'Annual revenue must be greater than operating cost';
    }
    
    if (!data.discountRate || data.discountRate < 1 || data.discountRate > 20) {
      errors.discountRate = 'Discount rate must be between 1% and 20%';
    }
    
    if (!data.projectDuration || data.projectDuration < 1 || data.projectDuration > 50) {
      errors.projectDuration = 'Project duration must be between 1 and 50 years';
    }
    
    return errors;
  }
  
  static validateTreeProjectForm(data: Partial<ScenarioFormData>): Record<string, string> {
    const errors: Record<string, string> = {};
    
    if (!data.scenarioName || data.scenarioName.trim() === '') {
      errors.scenarioName = 'Scenario name is required';
    }
    
    if (!data.projectArea || data.projectArea < 0.1) {
      errors.projectArea = 'Project area must be at least 0.1 hectares';
    }
    
    if (!data.initialTrees || data.initialTrees < 1) {
      errors.initialTrees = 'Initial trees must be at least 1';
    }
    
    if (!data.treeSpecies) {
      errors.treeSpecies = 'Tree species is required';
    }
    
    if (!data.survivalRate || data.survivalRate < 10 || data.survivalRate > 100) {
      errors.survivalRate = 'Survival rate must be between 10% and 100%';
    }
    
    if (!data.costPerTree || data.costPerTree < 0.1) {
      errors.costPerTree = 'Cost per tree must be at least $0.10';
    }
    
    if (!data.sequestrationConstant || data.sequestrationConstant < 0.1) {
      errors.sequestrationConstant = 'Sequestration constant must be at least 0.1';
    }
    
    if (!data.projectDuration || data.projectDuration < 1 || data.projectDuration > 50) {
      errors.projectDuration = 'Project duration must be between 1 and 50 years';
    }
    
    return errors;
  }
}
