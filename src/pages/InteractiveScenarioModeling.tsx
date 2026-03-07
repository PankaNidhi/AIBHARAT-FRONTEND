import { useState, useEffect } from 'react';
import { useModuleContext } from '../contexts/ModuleContext';
import { useProjectContext } from '../contexts/ProjectContext';
import { ScenarioFormData, CalculationResults, SavedScenario, FormField } from '../types/scenario';
import { MRVCalculationEngine, ScenarioValidationService } from '../utils/mrvCalculations';
import { useScenarioStorage } from '../hooks/useScenarioStorage';
import { Calculator, Save, Trash2, Play, FileText } from 'lucide-react';
import { Card } from '../components/Card';
import toast from 'react-hot-toast';

const InteractiveScenarioModeling = () => {
  const { selectedModules } = useModuleContext();
  const { selectedProject, projects } = useProjectContext();
  const { scenarios, saveScenario, loadScenarios, deleteScenario } = useScenarioStorage();
  
  const [formData, setFormData] = useState<Partial<ScenarioFormData>>({
    scenarioName: '',
    description: '',
    moduleId: selectedModules[0] || 'steel',
    projectId: selectedProject?.id || projects[0]?.id || '',
    projectDuration: 10,
    discountRate: 8
  });
  
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isCalculating, setIsCalculating] = useState(false);
  
  const isTreeModule = formData.moduleId === 'tree';
  
  useEffect(() => {
    loadScenarios();
  }, []);
  
  useEffect(() => {
    if (selectedModules.length > 0) {
      setFormData(prev => ({ ...prev, moduleId: selectedModules[0] }));
    }
  }, [selectedModules]);
  
  useEffect(() => {
    if (selectedProject) {
      setFormData(prev => ({ ...prev, projectId: selectedProject.id }));
    }
  }, [selectedProject]);
  
  const getFormFields = (): FormField[] => {
    if (isTreeModule) {
      return [
        {
          name: 'scenarioName',
          label: 'Scenario Name',
          type: 'text',
          required: true,
          placeholder: 'e.g., Ghana Reforestation 2024',
          helpText: 'Unique name for this scenario'
        },
        {
          name: 'projectArea',
          label: 'Project Area (hectares)',
          type: 'number',
          required: true,
          min: 0.1,
          max: 100000,
          step: 0.1,
          placeholder: '50',
          helpText: 'Total area of the tree project'
        },
        {
          name: 'initialTrees',
          label: 'Initial Trees',
          type: 'number',
          required: true,
          min: 1,
          max: 1000000,
          step: 1,
          placeholder: '10000',
          helpText: 'Number of trees to be planted'
        },
        {
          name: 'treeSpecies',
          label: 'Tree Species',
          type: 'select',
          required: true,
          options: [
            { value: 'acacia', label: 'Acacia' },
            { value: 'eucalyptus', label: 'Eucalyptus' },
            { value: 'pine', label: 'Pine' },
            { value: 'oak', label: 'Oak' },
            { value: 'mixed', label: 'Mixed Species' }
          ],
          helpText: 'Primary tree species'
        },
        {
          name: 'costPerTree',
          label: 'Cost per Tree (USD)',
          type: 'number',
          required: true,
          min: 0.1,
          max: 100,
          step: 0.1,
          placeholder: '4',
          helpText: 'Cost to plant and maintain each tree'
        },
        {
          name: 'survivalRate',
          label: 'Survival Rate (%)',
          type: 'number',
          required: true,
          min: 10,
          max: 100,
          step: 1,
          placeholder: '85',
          helpText: 'Expected tree survival percentage'
        },
        {
          name: 'projectDuration',
          label: 'Project Duration (years)',
          type: 'number',
          required: true,
          min: 1,
          max: 50,
          step: 1,
          placeholder: '10',
          helpText: 'Duration of the project'
        },
        {
          name: 'sequestrationConstant',
          label: 'Sequestration Rate (tCO2e/tree/year)',
          type: 'number',
          required: true,
          min: 0.1,
          max: 5,
          step: 0.1,
          placeholder: '0.8',
          helpText: 'Annual CO2 sequestration per tree'
        }
      ];
    } else {
      return [
        {
          name: 'scenarioName',
          label: 'Scenario Name',
          type: 'text',
          required: true,
          placeholder: 'e.g., Steel Plant Upgrade 2024',
          helpText: 'Unique name for this scenario'
        },
        {
          name: 'projectSize',
          label: 'Project Size',
          type: 'number',
          required: true,
          min: 1000,
          max: 100000000,
          step: 1000,
          placeholder: '10000000',
          helpText: 'Total project capacity or size'
        },
        {
          name: 'investmentAmount',
          label: 'Investment Amount (USD)',
          type: 'number',
          required: true,
          min: 10000,
          max: 1000000000,
          step: 1000,
          placeholder: '4500000',
          helpText: 'Initial capital investment'
        },
        {
          name: 'operatingCost',
          label: 'Operating Cost (USD/year)',
          type: 'number',
          required: true,
          min: 1000,
          max: 100000000,
          step: 1000,
          placeholder: '200000',
          helpText: 'Annual operating costs'
        },
        {
          name: 'annualRevenue',
          label: 'Annual Revenue (USD)',
          type: 'number',
          required: true,
          min: 1000,
          max: 100000000,
          step: 1000,
          placeholder: '1000000',
          helpText: 'Expected annual revenue'
        },
        {
          name: 'projectDuration',
          label: 'Project Duration (years)',
          type: 'number',
          required: true,
          min: 1,
          max: 50,
          step: 1,
          placeholder: '10',
          helpText: 'Duration of the project'
        },
        {
          name: 'discountRate',
          label: 'Discount Rate (%)',
          type: 'number',
          required: true,
          min: 1,
          max: 20,
          step: 0.1,
          placeholder: '8',
          helpText: 'Discount rate for NPV'
        }
      ];
    }
  };
  
  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  
  const handleCalculate = () => {
    setIsCalculating(true);
    
    try {
      // Validate form
      const errors = isTreeModule
        ? ScenarioValidationService.validateTreeProjectForm(formData)
        : ScenarioValidationService.validateEconomicForm(formData);
      
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        toast.error('Please fix validation errors');
        setIsCalculating(false);
        return;
      }
      
      // Calculate results
      let calculationResults: CalculationResults;
      
      if (isTreeModule) {
        calculationResults = MRVCalculationEngine.calculateTreeProjectScenario({
          projectArea: formData.projectArea!,
          initialTrees: formData.initialTrees!,
          treeSpecies: formData.treeSpecies!,
          costPerTree: formData.costPerTree!,
          survivalRate: formData.survivalRate!,
          projectDuration: formData.projectDuration!,
          sequestrationConstant: formData.sequestrationConstant!
        });
      } else {
        calculationResults = MRVCalculationEngine.calculateEconomicScenario({
          projectSize: formData.projectSize!,
          investmentAmount: formData.investmentAmount!,
          operatingCost: formData.operatingCost!,
          annualRevenue: formData.annualRevenue!,
          projectDuration: formData.projectDuration!,
          discountRate: formData.discountRate!,
          moduleType: formData.moduleId!
        });
      }
      
      setResults(calculationResults);
      toast.success('Calculation completed successfully');
    } catch (error) {
      toast.error('Calculation failed. Please check your inputs.');
      console.error(error);
    } finally {
      setIsCalculating(false);
    }
  };
  
  const handleSave = async () => {
    if (!results) {
      toast.error('Please calculate results before saving');
      return;
    }
    
    try {
      await saveScenario(
        formData.scenarioName!,
        formData as ScenarioFormData,
        results,
        formData.description
      );
      toast.success('Scenario saved successfully');
      await loadScenarios();
    } catch (error) {
      toast.error('Failed to save scenario');
      console.error(error);
    }
  };
  
  const handleLoadScenario = (scenario: SavedScenario) => {
    setFormData(scenario.formData);
    setResults(scenario.results);
    toast.success('Scenario loaded');
  };
  
  const handleDeleteScenario = async (scenarioId: string) => {
    if (confirm('Are you sure you want to delete this scenario?')) {
      try {
        await deleteScenario(scenarioId);
        toast.success('Scenario deleted');
        await loadScenarios();
      } catch (error) {
        toast.error('Failed to delete scenario');
      }
    }
  };
  
  const handleNewScenario = () => {
    setFormData({
      scenarioName: '',
      description: '',
      moduleId: selectedModules[0] || 'steel',
      projectId: selectedProject?.id || projects[0]?.id || '',
      projectDuration: 10,
      discountRate: 8
    });
    setResults(null);
    setValidationErrors({});
  };
  
  const formatValue = (key: string, value: number): string => {
    if (key.includes('Amount') || key.includes('Cost') || key.includes('Revenue') || key === 'npv' || key === 'totalProjectCost') {
      return `$${value.toLocaleString()}`;
    }
    if (key.includes('Rate') || key === 'irr') {
      return `${value.toFixed(2)}%`;
    }
    if (key.includes('CO2') || key.includes('Sequestration') || key.includes('Absorption')) {
      return `${value.toFixed(2)} tCO₂e`;
    }
    if (key === 'paybackPeriod') {
      return `${value.toFixed(2)} years`;
    }
    return value.toLocaleString();
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Interactive Scenario Modeling</h1>
          <p className="text-gray-400 mt-2">Create and analyze custom MRV scenarios</p>
        </div>
        <button
          onClick={handleNewScenario}
          className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center space-x-2"
        >
          <FileText size={20} />
          <span>New Scenario</span>
        </button>
      </div>
      
      {/* Input Form */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            {isTreeModule ? 'Tree Project Parameters' : 'Economic Module Parameters'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {getFormFields().map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {field.label}
                  {field.required && <span className="text-red-400 ml-1">*</span>}
                </label>
                {field.type === 'select' ? (
                  <select
                    value={formData[field.name as keyof ScenarioFormData] as string || ''}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Select {field.label}</option>
                    {field.options?.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    value={formData[field.name as keyof ScenarioFormData] as string || ''}
                    onChange={(e) => handleFieldChange(field.name, field.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
                    placeholder={field.placeholder}
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                )}
                {field.helpText && (
                  <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>
                )}
                {validationErrors[field.name] && (
                  <p className="text-xs text-red-400 mt-1">{validationErrors[field.name]}</p>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-6 flex space-x-4">
            <button
              onClick={handleCalculate}
              disabled={isCalculating}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              {isCalculating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Calculating...</span>
                </>
              ) : (
                <>
                  <Calculator size={20} />
                  <span>Calculate</span>
                </>
              )}
            </button>
            
            <button
              onClick={handleSave}
              disabled={!results}
              className="px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              <Save size={20} />
              <span>Save Scenario</span>
            </button>
          </div>
        </div>
      </Card>
      
      {/* Results */}
      {results && (
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Calculation Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(results).map(([key, value]) => {
                if (key === 'calculationDate' || key === 'moduleType' || value === undefined) return null;
                
                return (
                  <div key={key} className="bg-gray-800/50 p-4 rounded-lg">
                    <p className="text-sm text-gray-400 mb-1">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </p>
                    <p className="text-2xl font-bold text-white">
                      {typeof value === 'number' ? formatValue(key, value) : value}
                    </p>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-4 p-4 bg-gray-800/50 rounded-lg">
              <p className="text-sm text-gray-400">Compliance Status</p>
              <p className={`text-lg font-semibold ${
                results.complianceStatus.includes('Excellent') || results.complianceStatus.includes('High') ? 'text-emerald-400' :
                results.complianceStatus.includes('Good') ? 'text-blue-400' :
                results.complianceStatus.includes('Acceptable') || results.complianceStatus.includes('Moderate') ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                {results.complianceStatus}
              </p>
            </div>
          </div>
        </Card>
      )}
      
      {/* Saved Scenarios */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Saved Scenarios</h2>
          {scenarios.length === 0 ? (
            <p className="text-gray-400">No saved scenarios yet. Create and save your first scenario above.</p>
          ) : (
            <div className="space-y-3">
              {scenarios.map((scenario) => (
                <div
                  key={scenario.id}
                  className="bg-gray-800/50 p-4 rounded-lg flex items-center justify-between hover:bg-gray-800 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="text-white font-medium">{scenario.name}</h3>
                    <p className="text-sm text-gray-400">
                      {scenario.moduleId} • {scenario.projectId} • {scenario.createdAt.toLocaleDateString()}
                    </p>
                    {scenario.description && (
                      <p className="text-sm text-gray-500 mt-1">{scenario.description}</p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleLoadScenario(scenario)}
                      className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-1"
                    >
                      <Play size={16} />
                      <span>Load</span>
                    </button>
                    <button
                      onClick={() => handleDeleteScenario(scenario.id)}
                      className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default InteractiveScenarioModeling;
