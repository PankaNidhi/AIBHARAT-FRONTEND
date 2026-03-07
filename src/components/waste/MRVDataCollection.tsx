import { useState, useEffect } from 'react';
import { Card } from '../Card';
import { Database, AlertTriangle, CheckCircle, TrendingUp, Zap, Droplet, Activity } from 'lucide-react';
import WasteManagementService from '../../services/WasteManagementService';
import IoTDataService, { FacilitySummary } from '../../services/IoTDataService';

interface MRVDataCollectionProps {
  onDataUpdate: () => void;
}

const MRVDataCollection = ({ onDataUpdate }: MRVDataCollectionProps) => {
  const [activeCategory, setActiveCategory] = useState<string>('waste_volume');
  const [formData, setFormData] = useState({
    value: '',
    source: 'manual' as 'manual' | 'sensor' | 'rfid',
  });

  const [blockedStates] = useState<string[]>([
    'RFID tracking data missing for hazardous waste',
    'Biogas yield measurements incomplete for last 7 days',
  ]);

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

  const dataCategories = [
    {
      id: 'waste_volume',
      name: 'Waste Volume',
      icon: Database,
      unit: 'tonnes/day',
      description: 'Total daily municipal solid waste input',
      required: true,
    },
    {
      id: 'organic_fraction',
      name: 'Organic Fraction',
      icon: Droplet,
      unit: '%',
      description: 'Percentage of organic content in waste stream',
      required: true,
    },
    {
      id: 'biogas_yield',
      name: 'Biogas Yield',
      icon: TrendingUp,
      unit: 'm³/tonne',
      description: 'Biogas production per tonne of organic waste',
      required: true,
    },
    {
      id: 'electricity_output',
      name: 'Electricity Output',
      icon: Zap,
      unit: 'kWh/day',
      description: 'Daily electricity generation from biogas and incineration',
      required: true,
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const category = dataCategories.find(c => c.id === activeCategory);
    if (!category) return;

    WasteManagementService.addMRVData({
      category: activeCategory as any,
      value: parseFloat(formData.value),
      unit: category.unit,
      source: formData.source,
      uncertaintyBuffer: 0.1, // 10% conservative buffer
      validationStatus: 'valid',
    });

    onDataUpdate();
    
    // Reset form
    setFormData({ value: '', source: 'manual' });
  };

  const activeDataCategory = dataCategories.find(c => c.id === activeCategory);
  const rawValue = parseFloat(formData.value) || 0;
  const bufferedValue = rawValue * 0.9; // Apply 10% conservative buffer

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-bold text-text-primary">MRV Data Collection</h3>
        <p className="text-text-secondary mt-1">
          Monitor, Report, and Verify emission reduction data with automatic uncertainty buffers
        </p>
      </div>

      {/* Real-Time Facility Summary */}
      {facilitySummary && (
        <Card className="border-2 border-info">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-lg font-semibold text-text-primary">Real-Time Facility Status</h4>
              <p className="text-sm text-text-secondary">Live data from DynamoDB sensors</p>
            </div>
            <div className="flex items-center space-x-2">
              <Activity className="text-info animate-pulse" size={20} />
              <span className="text-sm text-text-secondary">
                {lastUpdate.toLocaleTimeString()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Gas Status */}
            <div className={`p-4 rounded-lg ${
              facilitySummary.gasStatus.status === 'Alert' ? 'bg-red-50' : 'bg-green-50'
            }`}>
              <div className="text-sm font-medium text-gray-700 mb-2">Gas Detection</div>
              <div className={`text-2xl font-bold ${
                facilitySummary.gasStatus.status === 'Alert' ? 'text-red-600' : 'text-green-600'
              }`}>
                {facilitySummary.gasStatus.status}
              </div>
              {facilitySummary.gasStatus.latestReading && (
                <div className="text-xs text-gray-600 mt-2">
                  {facilitySummary.gasStatus.latestReading.concentration} ppm
                </div>
              )}
            </div>

            {/* Fire Status */}
            <div className={`p-4 rounded-lg ${
              facilitySummary.fireStatus.status === 'Alert' ? 'bg-red-50' : 'bg-green-50'
            }`}>
              <div className="text-sm font-medium text-gray-700 mb-2">Fire Detection</div>
              <div className={`text-2xl font-bold ${
                facilitySummary.fireStatus.status === 'Alert' ? 'text-red-600' : 'text-green-600'
              }`}>
                {facilitySummary.fireStatus.status}
              </div>
              {facilitySummary.fireStatus.latestReading && (
                <div className="text-xs text-gray-600 mt-2">
                  Intensity: {facilitySummary.fireStatus.latestReading.intensity}%
                </div>
              )}
            </div>

            {/* Waste Bins */}
            <div className="p-4 rounded-lg bg-blue-50">
              <div className="text-sm font-medium text-gray-700 mb-2">Waste Bins</div>
              <div className="text-2xl font-bold text-blue-600">
                {facilitySummary.wasteStats.totalBins}
              </div>
              <div className="text-xs text-gray-600 mt-2">
                {facilitySummary.wasteStats.fullBins} full, {facilitySummary.wasteStats.nearlyFullBins} nearly full
              </div>
            </div>

            {/* Active Alerts */}
            <div className="p-4 rounded-lg bg-yellow-50">
              <div className="text-sm font-medium text-gray-700 mb-2">Active Alerts</div>
              <div className="text-2xl font-bold text-yellow-600">
                {facilitySummary.activeAlerts.critical + facilitySummary.activeAlerts.high + 
                 facilitySummary.activeAlerts.medium + facilitySummary.activeAlerts.low}
              </div>
              <div className="text-xs text-gray-600 mt-2">
                {facilitySummary.activeAlerts.critical} critical, {facilitySummary.activeAlerts.high} high
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Blocked States Alert */}
      {blockedStates.length > 0 && (
        <Card className="border-2 border-warning">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="text-warning flex-shrink-0 mt-1" size={24} />
            <div className="flex-1">
              <h4 className="font-semibold text-warning mb-2">Data Collection Blocks</h4>
              <p className="text-sm text-text-secondary mb-3">
                The following data requirements must be resolved before credit issuance:
              </p>
              <ul className="space-y-2">
                {blockedStates.map((state, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-warning mt-1">•</span>
                    <div>
                      <div className="text-sm font-medium text-text-primary">{state}</div>
                      <div className="text-xs text-text-secondary mt-1">
                        Resolution: {state.includes('RFID') ? 'Install RFID readers and tag waste batches' : 'Continue daily measurements for 7 consecutive days'}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Data Category Selection */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {dataCategories.map((category) => {
          const Icon = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                activeCategory === category.id
                  ? 'border-info bg-info bg-opacity-10'
                  : 'border-bg-secondary hover:border-info'
              }`}
            >
              <Icon className={activeCategory === category.id ? 'text-info' : 'text-text-secondary'} size={24} />
              <div className="mt-2 text-sm font-semibold text-text-primary">{category.name}</div>
              {category.required && (
                <div className="text-xs text-danger mt-1">Required</div>
              )}
            </button>
          );
        })}
      </div>

      {/* Data Entry Form */}
      {activeDataCategory && (
        <Card>
          <div className="flex items-center space-x-3 mb-4">
            <activeDataCategory.icon className="text-info" size={28} />
            <div>
              <h4 className="text-lg font-semibold text-text-primary">{activeDataCategory.name}</h4>
              <p className="text-sm text-text-secondary">{activeDataCategory.description}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Measurement Value ({activeDataCategory.unit})
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                className="w-full px-4 py-2 bg-bg-secondary border border-bg-secondary rounded-lg text-text-primary focus:outline-none focus:border-info"
                placeholder={`Enter ${activeDataCategory.name.toLowerCase()}`}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Data Source
              </label>
              <select
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value as any })}
                className="w-full px-4 py-2 bg-bg-secondary border border-bg-secondary rounded-lg text-text-primary focus:outline-none focus:border-info"
              >
                <option value="manual">Manual Entry</option>
                <option value="sensor">Automated Sensor</option>
                <option value="rfid">RFID Tracking</option>
              </select>
            </div>

            {/* Uncertainty Buffer Display */}
            {formData.value && (
              <div className="bg-bg-secondary rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Raw Measurement</span>
                  <span className="text-lg font-semibold text-text-primary">
                    {rawValue.toFixed(2)} {activeDataCategory.unit}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Conservative Buffer (10%)</span>
                  <span className="text-sm font-medium text-warning">
                    -{(rawValue * 0.1).toFixed(2)} {activeDataCategory.unit}
                  </span>
                </div>
                <div className="border-t border-bg-primary pt-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-text-primary">Reported Value</span>
                  <span className="text-xl font-bold text-safe">
                    {bufferedValue.toFixed(2)} {activeDataCategory.unit}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-text-secondary">
                  <CheckCircle size={14} className="text-safe" />
                  <span>Automatic uncertainty buffer applied for conservative reporting</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-info hover:bg-info-dark text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Submit Data Point
            </button>
          </form>
        </Card>
      )}

      {/* MRV Compliance Info */}
      <Card>
        <h4 className="text-lg font-semibold text-text-primary mb-3">MRV Compliance Requirements</h4>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <CheckCircle className="text-safe flex-shrink-0 mt-1" size={18} />
            <div>
              <div className="text-sm font-medium text-text-primary">Automatic Uncertainty Buffers</div>
              <div className="text-xs text-text-secondary mt-1">
                All measurements automatically apply 10% conservative buffers for EPA Ghana and Gold Standard compliance
              </div>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle className="text-safe flex-shrink-0 mt-1" size={18} />
            <div>
              <div className="text-sm font-medium text-text-primary">Audit-Ready Data Structures</div>
              <div className="text-xs text-text-secondary mt-1">
                Full traceability with timestamps, data sources, and quality flags for verification
              </div>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle className="text-safe flex-shrink-0 mt-1" size={18} />
            <div>
              <div className="text-sm font-medium text-text-primary">Real-Time Validation</div>
              <div className="text-xs text-text-secondary mt-1">
                Immediate feedback on data quality and blocked states requiring resolution
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MRVDataCollection;
