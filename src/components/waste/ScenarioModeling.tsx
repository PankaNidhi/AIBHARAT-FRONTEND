import { useState, useEffect } from 'react';
import { Card } from '../Card';
import { TrendingDown, Zap, DollarSign, CheckCircle, AlertCircle, ArrowRight, Activity } from 'lucide-react';
import WasteManagementService, { WasteScenario } from '../../services/WasteManagementService';
import IoTDataService, { FacilitySummary } from '../../services/IoTDataService';

interface ScenarioModelingProps {
  onDataUpdate: () => void;
}

const ScenarioModeling = ({ onDataUpdate }: ScenarioModelingProps) => {
  const [project] = useState(WasteManagementService.getProject());
  const [selectedScenario, setSelectedScenario] = useState<'conservative' | 'expected' | 'optimized'>('expected');
  const [compareMode, setCompareMode] = useState(false);
  const [compareScenario, setCompareScenario] = useState<'conservative' | 'expected' | 'optimized'>('conservative');
  const [scenarios, setScenarios] = useState<Record<string, WasteScenario>>({});
  
  // Real-time facility summary
  const [facilitySummary, setFacilitySummary] = useState<FacilitySummary | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Fetch real-time facility summary
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const summary = await IoTDataService.getFacilitySummary();
        setFacilitySummary(summary);
        setLastUpdate(new Date());
      } catch (error) {
        console.error('Error fetching facility summary:', error);
      }
    };

    // Initial fetch
    fetchSummary();

    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchSummary, 5000);

    return () => clearInterval(interval);
  }, []);

  // Calculate scenarios on mount and when project changes
  useEffect(() => {
    const conservative = WasteManagementService.calculateScenario('conservative');
    const expected = WasteManagementService.calculateScenario('expected');
    const optimized = WasteManagementService.calculateScenario('optimized');
    
    setScenarios({
      conservative,
      expected,
      optimized,
    });
    
    onDataUpdate();
  }, []);

  const activeScenario = scenarios[selectedScenario];
  const comparisonScenario = scenarios[compareScenario];

  const ScenarioCard = ({ scenario, type, isActive, onClick }: any) => {
    if (!scenario) return null;
    
    return (
      <button
        onClick={onClick}
        className={`p-4 rounded-lg border-2 transition-all text-left w-full ${
          isActive
            ? 'border-info bg-info bg-opacity-10'
            : 'border-bg-secondary hover:border-info'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-lg font-semibold text-text-primary capitalize">{type}</h4>
          {scenario.article6Compliance && (
            <CheckCircle className="text-safe" size={20} />
          )}
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-text-secondary">CO₂e Reduction</span>
            <span className="font-semibold text-text-primary">
              {(scenario.annualCO2Reduction / 1000).toFixed(1)}k tCO₂e/yr
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">MRV Readiness</span>
            <span className={`font-semibold ${scenario.mrvReadiness >= 85 ? 'text-safe' : 'text-warning'}`}>
              {scenario.mrvReadiness}%
            </span>
          </div>
        </div>
      </button>
    );
  };

  if (!activeScenario) {
    return <div>Loading scenarios...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-text-primary">Scenario Modeling</h3>
          <p className="text-text-secondary mt-1">
            Compare emission reduction potential across different operational scenarios
          </p>
        </div>
        <button
          onClick={() => setCompareMode(!compareMode)}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            compareMode
              ? 'bg-info text-white'
              : 'bg-bg-secondary text-text-primary hover:bg-bg-primary'
          }`}
        >
          {compareMode ? 'Exit Compare Mode' : 'Compare Scenarios'}
        </button>
      </div>

      {/* Real-Time Sensor Overview */}
      {facilitySummary && (
        <Card className="border-2 border-info">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-lg font-semibold text-text-primary">Live Sensor Data</h4>
              <p className="text-sm text-text-secondary">Real-time monitoring from facility sensors</p>
            </div>
            <div className="flex items-center space-x-2">
              <Activity className="text-info animate-pulse" size={20} />
              <span className="text-sm text-text-secondary">
                {lastUpdate.toLocaleTimeString()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-bg-secondary rounded-lg">
              <div className="text-sm text-text-secondary mb-1">Gas Status</div>
              <div className={`text-lg font-bold ${
                facilitySummary.gasStatus.status === 'Alert' ? 'text-red-600' : 'text-green-600'
              }`}>
                {facilitySummary.gasStatus.status}
              </div>
            </div>
            <div className="text-center p-3 bg-bg-secondary rounded-lg">
              <div className="text-sm text-text-secondary mb-1">Fire Status</div>
              <div className={`text-lg font-bold ${
                facilitySummary.fireStatus.status === 'Alert' ? 'text-red-600' : 'text-green-600'
              }`}>
                {facilitySummary.fireStatus.status}
              </div>
            </div>
            <div className="text-center p-3 bg-bg-secondary rounded-lg">
              <div className="text-sm text-text-secondary mb-1">Waste Bins</div>
              <div className="text-lg font-bold text-blue-600">
                {facilitySummary.wasteStats.totalBins}
              </div>
              <div className="text-xs text-text-secondary">
                Avg: {facilitySummary.wasteStats.averageFillLevel.toFixed(0)}%
              </div>
            </div>
            <div className="text-center p-3 bg-bg-secondary rounded-lg">
              <div className="text-sm text-text-secondary mb-1">Total Alerts</div>
              <div className="text-lg font-bold text-yellow-600">
                {facilitySummary.activeAlerts.critical + facilitySummary.activeAlerts.high + 
                 facilitySummary.activeAlerts.medium + facilitySummary.activeAlerts.low}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Scenario Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ScenarioCard
          scenario={scenarios.conservative}
          type="conservative"
          isActive={selectedScenario === 'conservative'}
          onClick={() => setSelectedScenario('conservative')}
        />
        <ScenarioCard
          scenario={scenarios.expected}
          type="expected"
          isActive={selectedScenario === 'expected'}
          onClick={() => setSelectedScenario('expected')}
        />
        <ScenarioCard
          scenario={scenarios.optimized}
          type="optimized"
          isActive={selectedScenario === 'optimized'}
          onClick={() => setSelectedScenario('optimized')}
        />
      </div>

      {/* Comparison Mode */}
      {compareMode && (
        <Card className="border-2 border-info">
          <h4 className="text-lg font-semibold text-text-primary mb-4">Compare With</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['conservative', 'expected', 'optimized'] as const).map((type) => (
              type !== selectedScenario && (
                <ScenarioCard
                  key={type}
                  scenario={scenarios[type]}
                  type={type}
                  isActive={compareScenario === type}
                  onClick={() => setCompareScenario(type)}
                />
              )
            ))}
          </div>
        </Card>
      )}

      {/* Detailed Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Primary Scenario */}
        <div className="space-y-4">
          <h4 className="text-xl font-semibold text-text-primary capitalize">
            {selectedScenario} Scenario
          </h4>

          <Card>
            <div className="flex items-center space-x-3 mb-4">
              <TrendingDown className="text-safe" size={28} />
              <div>
                <div className="text-sm text-text-secondary">Annual CO₂e Reduction</div>
                <div className="text-2xl font-bold text-text-primary">
                  {(activeScenario.annualCO2Reduction / 1000).toFixed(2)}k tCO₂e
                </div>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Avoided Methane</span>
                <span className="text-text-primary">
                  {((project.dailyWasteVolume * activeScenario.organicEfficiency * 0.5 * 365) / 1000).toFixed(2)}k tCO₂e
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Fossil Fuel Substitution</span>
                <span className="text-text-primary">
                  {(activeScenario.annualElectricityGeneration * 0.0008 / 1000).toFixed(2)}k tCO₂e
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Reduced Fertilizer</span>
                <span className="text-text-primary">
                  {((project.dailyWasteVolume * activeScenario.organicEfficiency * 0.1 * 365) / 1000).toFixed(2)}k tCO₂e
                </span>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center space-x-3 mb-4">
              <Zap className="text-warning" size={28} />
              <div>
                <div className="text-sm text-text-secondary">Annual Energy Output</div>
                <div className="text-2xl font-bold text-text-primary">
                  {(activeScenario.annualElectricityGeneration / 1000).toFixed(0)}k kWh
                </div>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Biogas Production</span>
                <span className="text-text-primary">
                  {(activeScenario.annualBiogasProduction / 1000).toFixed(0)}k m³
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Conversion Efficiency</span>
                <span className="text-text-primary">
                  {(activeScenario.electricityConversion * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center space-x-3 mb-4">
              <DollarSign className="text-info" size={28} />
              <div>
                <div className="text-sm text-text-secondary">Revenue Potential</div>
                <div className="text-2xl font-bold text-text-primary">
                  ${(activeScenario.revenuePotential / 1000).toFixed(0)}k/year
                </div>
              </div>
            </div>
            <div className="text-xs text-text-secondary">
              Based on $15/tCO₂e carbon credit price
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-text-primary">MRV Readiness</div>
              <div className={`text-xl font-bold ${activeScenario.mrvReadiness >= 85 ? 'text-safe' : 'text-warning'}`}>
                {activeScenario.mrvReadiness}%
              </div>
            </div>
            <div className="w-full bg-bg-secondary rounded-full h-3 overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${
                  activeScenario.mrvReadiness >= 85 ? 'bg-safe' : 'bg-warning'
                }`}
                style={{ width: `${activeScenario.mrvReadiness}%` }}
              />
            </div>
            <div className="mt-3 flex items-center space-x-2">
              {activeScenario.article6Compliance ? (
                <>
                  <CheckCircle className="text-safe" size={16} />
                  <span className="text-sm text-safe">Article 6 Compliant</span>
                </>
              ) : (
                <>
                  <AlertCircle className="text-warning" size={16} />
                  <span className="text-sm text-warning">Additional MRV data required</span>
                </>
              )}
            </div>
          </Card>
        </div>

        {/* Comparison Scenario (if in compare mode) */}
        {compareMode && (
          <div className="space-y-4">
            <h4 className="text-xl font-semibold text-text-primary capitalize">
              {compareScenario} Scenario
            </h4>

            <Card className="border-2 border-info">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm text-text-secondary">CO₂e Reduction Difference</div>
                  <div className="text-2xl font-bold text-text-primary">
                    {((activeScenario.annualCO2Reduction - comparisonScenario.annualCO2Reduction) / 1000).toFixed(2)}k tCO₂e
                  </div>
                </div>
                <ArrowRight className="text-info" size={24} />
              </div>
              <div className="text-xs text-text-secondary">
                {activeScenario.annualCO2Reduction > comparisonScenario.annualCO2Reduction
                  ? `${selectedScenario} scenario reduces ${(((activeScenario.annualCO2Reduction - comparisonScenario.annualCO2Reduction) / comparisonScenario.annualCO2Reduction) * 100).toFixed(1)}% more emissions`
                  : `${compareScenario} scenario reduces ${(((comparisonScenario.annualCO2Reduction - activeScenario.annualCO2Reduction) / activeScenario.annualCO2Reduction) * 100).toFixed(1)}% more emissions`
                }
              </div>
            </Card>

            <Card>
              <div className="text-sm font-medium text-text-primary mb-3">Comparison Summary</div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">CO₂e Reduction</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-text-primary">
                      {(comparisonScenario.annualCO2Reduction / 1000).toFixed(1)}k
                    </span>
                    <ArrowRight size={14} className="text-text-secondary" />
                    <span className={`text-sm font-semibold ${
                      activeScenario.annualCO2Reduction > comparisonScenario.annualCO2Reduction
                        ? 'text-safe'
                        : 'text-danger'
                    }`}>
                      {(activeScenario.annualCO2Reduction / 1000).toFixed(1)}k
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Revenue Potential</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-text-primary">
                      ${(comparisonScenario.revenuePotential / 1000).toFixed(0)}k
                    </span>
                    <ArrowRight size={14} className="text-text-secondary" />
                    <span className={`text-sm font-semibold ${
                      activeScenario.revenuePotential > comparisonScenario.revenuePotential
                        ? 'text-safe'
                        : 'text-danger'
                    }`}>
                      ${(activeScenario.revenuePotential / 1000).toFixed(0)}k
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">MRV Readiness</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-text-primary">
                      {comparisonScenario.mrvReadiness}%
                    </span>
                    <ArrowRight size={14} className="text-text-secondary" />
                    <span className={`text-sm font-semibold ${
                      activeScenario.mrvReadiness > comparisonScenario.mrvReadiness
                        ? 'text-safe'
                        : 'text-warning'
                    }`}>
                      {activeScenario.mrvReadiness}%
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScenarioModeling;
