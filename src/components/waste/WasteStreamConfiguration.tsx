import { useState, useEffect } from 'react';
import { Card } from '../Card';
import { AlertCircle, CheckCircle2, Leaf, Flame, Truck, Activity, Droplets, Trash2 } from 'lucide-react';
import WasteManagementService, { WasteStreamConfig } from '../../services/WasteManagementService';
import IoTDataService, { GasSensorData, FlameSensorData, WasteBinData } from '../../services/IoTDataService';

interface WasteStreamConfigurationProps {
  onDataUpdate: () => void;
}

const WasteStreamConfiguration = ({ onDataUpdate }: WasteStreamConfigurationProps) => {
  const [project, setProject] = useState(WasteManagementService.getProject());
  const [organicPercentage, setOrganicPercentage] = useState(62.5);
  const [collectionPercentage, setCollectionPercentage] = useState(27.5);
  const [biogasOption, setBiogasOption] = useState<'cooking_gas' | 'chp_electricity'>('chp_electricity');
  const [errors, setErrors] = useState<string[]>([]);
  
  // Real-time IoT sensor data
  const [gasSensor, setGasSensor] = useState<GasSensorData | null>(null);
  const [flameSensor, setFlameSensor] = useState<FlameSensorData | null>(null);
  const [wasteBins, setWasteBins] = useState<WasteBinData[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Load existing configuration
  useEffect(() => {
    const organicStream = project.wasteStreams.find(s => s.streamType === 'organic');
    const collectionStream = project.wasteStreams.find(s => s.streamType === 'collection');
    
    if (organicStream) {
      setOrganicPercentage(organicStream.percentageAllocation);
      setBiogasOption(organicStream.biogasOption || 'chp_electricity');
    }
    if (collectionStream) {
      setCollectionPercentage(collectionStream.percentageAllocation);
    }
  }, []);

  // Fetch real-time IoT sensor data
  useEffect(() => {
    const fetchIoTData = async () => {
      try {
        const [gas, flame, bins] = await Promise.all([
          IoTDataService.getLatestGasSensor(),
          IoTDataService.getLatestFlameSensor(),
          IoTDataService.getWasteBins(),
        ]);
        
        setGasSensor(gas);
        setFlameSensor(flame);
        setWasteBins(bins.bins || []);
        setLastUpdate(new Date());
      } catch (error) {
        console.error('Error fetching IoT data:', error);
      }
    };

    // Initial fetch
    fetchIoTData();

    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchIoTData, 5000);

    return () => clearInterval(interval);
  }, []);

  // Validate and save configuration
  const validateAndSave = () => {
    const validationErrors: string[] = [];
    const hazardousPercentage = 10;
    const total = organicPercentage + hazardousPercentage + collectionPercentage;

    // Validate ranges
    if (organicPercentage < 60 || organicPercentage > 65) {
      validationErrors.push('Organic waste must be 60-65% of total waste');
    }
    if (collectionPercentage < 25 || collectionPercentage > 30) {
      validationErrors.push('Collection stream must be 25-30% of total waste');
    }
    if (Math.abs(total - 100) > 0.1) {
      validationErrors.push(`Total allocation must equal 100% (currently ${total.toFixed(1)}%)`);
    }

    setErrors(validationErrors);

    // Save if valid
    if (validationErrors.length === 0) {
      const streams: WasteStreamConfig[] = [
        {
          id: WasteManagementService['generateId'](),
          streamType: 'organic',
          percentageAllocation: organicPercentage,
          technology: 'Anaerobic Digestion',
          biogasOption,
          status: 'active',
        },
        {
          id: WasteManagementService['generateId'](),
          streamType: 'hazardous',
          percentageAllocation: hazardousPercentage,
          technology: 'Controlled Incineration',
          status: 'active',
        },
        {
          id: WasteManagementService['generateId'](),
          streamType: 'collection',
          percentageAllocation: collectionPercentage,
          technology: 'Improved Collection System',
          status: 'active',
        },
      ];

      WasteManagementService.updateWasteStreams(streams);
      setProject(WasteManagementService.getProject());
      onDataUpdate();
    }
  };

  // Auto-save on changes
  useEffect(() => {
    validateAndSave();
  }, [organicPercentage, collectionPercentage, biogasOption]);

  const hazardousPercentage = 10;
  const totalPercentage = organicPercentage + hazardousPercentage + collectionPercentage;
  const isValid = errors.length === 0;

  return (
    <div className="space-y-6">
      {/* Real-Time IoT Sensor Data */}
      <Card className="border-2 border-info">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-lg font-semibold text-text-primary">Real-Time Sensor Data</h4>
            <p className="text-sm text-text-secondary">Live data from DynamoDB - Auto-refreshing every 5 seconds</p>
          </div>
          <div className="flex items-center space-x-2">
            <Activity className="text-info animate-pulse" size={20} />
            <span className="text-sm text-text-secondary">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Gas Sensor Status */}
          <div className={`p-4 rounded-lg border-2 ${
            gasSensor?.gasDetected ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'
          }`}>
            <div className="flex items-center space-x-3 mb-3">
              <Droplets className={gasSensor?.gasDetected ? 'text-red-600' : 'text-green-600'} size={24} />
              <div>
                <div className="text-sm font-medium text-gray-700">Gas Sensor</div>
                <div className={`text-xs ${gasSensor?.gasDetected ? 'text-red-600' : 'text-green-600'}`}>
                  {gasSensor?.gasDetected ? '🔴 GAS DETECTED' : '🟢 Safe'}
                </div>
              </div>
            </div>
            {gasSensor ? (
              <div className="space-y-1 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span className="font-semibold">{gasSensor.gasType}</span>
                </div>
                <div className="flex justify-between">
                  <span>Concentration:</span>
                  <span className="font-semibold">{gasSensor.concentration} ppm</span>
                </div>
                <div className="flex justify-between">
                  <span>Severity:</span>
                  <span className={`font-semibold ${
                    gasSensor.severity === 'Safe' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {gasSensor.severity}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-gray-500">No data available</div>
            )}
          </div>

          {/* Flame Sensor Status */}
          <div className={`p-4 rounded-lg border-2 ${
            flameSensor?.flameDetected ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'
          }`}>
            <div className="flex items-center space-x-3 mb-3">
              <Flame className={flameSensor?.flameDetected ? 'text-red-600' : 'text-green-600'} size={24} />
              <div>
                <div className="text-sm font-medium text-gray-700">Flame Sensor</div>
                <div className={`text-xs ${flameSensor?.flameDetected ? 'text-red-600' : 'text-green-600'}`}>
                  {flameSensor?.flameDetected ? '🔴 FIRE DETECTED' : '🟢 No Flame'}
                </div>
              </div>
            </div>
            {flameSensor ? (
              <div className="space-y-1 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Intensity:</span>
                  <span className="font-semibold">{flameSensor.intensity}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Severity:</span>
                  <span className={`font-semibold ${
                    flameSensor.severity === 'Safe' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {flameSensor.severity}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Device:</span>
                  <span className="font-semibold text-xs truncate">{flameSensor.deviceId.split('-').pop()}</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-gray-500">No data available</div>
            )}
          </div>

          {/* Waste Bin Status */}
          <div className="p-4 rounded-lg border-2 border-blue-500 bg-blue-50">
            <div className="flex items-center space-x-3 mb-3">
              <Trash2 className="text-blue-600" size={24} />
              <div>
                <div className="text-sm font-medium text-gray-700">Waste Bins</div>
                <div className="text-xs text-blue-600">
                  {wasteBins.length} bin{wasteBins.length !== 1 ? 's' : ''} monitored
                </div>
              </div>
            </div>
            {wasteBins.length > 0 ? (
              <div className="space-y-2">
                {wasteBins.slice(0, 2).map((bin) => (
                  <div key={bin.binId} className="text-xs text-gray-600 bg-white rounded p-2">
                    <div className="flex justify-between mb-1">
                      <span className="font-semibold">{bin.binId}</span>
                      <span className={`font-semibold ${
                        bin.binStatus === 'Full' ? 'text-red-600' :
                        bin.binStatus === 'NearlyFull' ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {bin.fillLevel.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className={`h-full rounded-full ${
                          bin.binStatus === 'Full' ? 'bg-red-500' :
                          bin.binStatus === 'NearlyFull' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${bin.fillLevel}%` }}
                      />
                    </div>
                  </div>
                ))}
                {wasteBins.length > 2 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{wasteBins.length - 2} more bins
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-gray-500">No bins detected</div>
            )}
          </div>
        </div>
      </Card>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-text-primary">Waste Stream Configuration</h3>
          <p className="text-text-secondary mt-1">
            Configure three parallel treatment streams for optimal waste processing
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {isValid ? (
            <>
              <CheckCircle2 className="text-safe" size={24} />
              <span className="text-safe font-semibold">Valid Configuration</span>
            </>
          ) : (
            <>
              <AlertCircle className="text-danger" size={24} />
              <span className="text-danger font-semibold">Invalid Configuration</span>
            </>
          )}
        </div>
      </div>

      {/* Total Allocation Summary */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-text-primary">Total Allocation</h4>
          <div className={`text-2xl font-bold ${
            Math.abs(totalPercentage - 100) < 0.1 ? 'text-safe' : 'text-danger'
          }`}>
            {totalPercentage.toFixed(1)}%
          </div>
        </div>
        <div className="w-full bg-bg-secondary rounded-full h-6 overflow-hidden">
          <div className="h-full flex">
            <div 
              className="bg-green-500 transition-all duration-300"
              style={{ width: `${organicPercentage}%` }}
              title={`Organic: ${organicPercentage}%`}
            />
            <div 
              className="bg-red-500 transition-all duration-300"
              style={{ width: `${hazardousPercentage}%` }}
              title={`Hazardous: ${hazardousPercentage}%`}
            />
            <div 
              className="bg-blue-500 transition-all duration-300"
              style={{ width: `${collectionPercentage}%` }}
              title={`Collection: ${collectionPercentage}%`}
            />
          </div>
        </div>
      </Card>

      {/* Validation Errors */}
      {errors.length > 0 && (
        <Card className="border-2 border-danger">
          <div className="flex items-start space-x-3">
            <AlertCircle className="text-danger flex-shrink-0 mt-1" size={20} />
            <div className="flex-1">
              <h4 className="font-semibold text-danger mb-2">Configuration Errors</h4>
              <ul className="space-y-1">
                {errors.map((error, index) => (
                  <li key={index} className="text-sm text-text-secondary">
                    • {error}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Organic Waste Stream */}
      <Card>
        <div className="flex items-center space-x-3 mb-4">
          <Leaf className="text-green-500" size={28} />
          <div>
            <h4 className="text-lg font-semibold text-text-primary">Organic Waste Stream</h4>
            <p className="text-sm text-text-secondary">Anaerobic Digestion (60-65%)</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Allocation Percentage: {organicPercentage.toFixed(1)}%
            </label>
            <input
              type="range"
              min="55"
              max="70"
              step="0.5"
              value={organicPercentage}
              onChange={(e) => setOrganicPercentage(parseFloat(e.target.value))}
              className="w-full h-2 bg-bg-secondary rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-text-secondary mt-1">
              <span>55%</span>
              <span className="text-safe">60-65% (Target)</span>
              <span>70%</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Biogas Pathway
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setBiogasOption('cooking_gas')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  biogasOption === 'cooking_gas'
                    ? 'border-info bg-info bg-opacity-10'
                    : 'border-bg-secondary hover:border-info'
                }`}
              >
                <div className="text-sm font-semibold text-text-primary">Clean Cooking Gas</div>
                <div className="text-xs text-text-secondary mt-1">Direct biogas distribution</div>
              </button>
              <button
                onClick={() => setBiogasOption('chp_electricity')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  biogasOption === 'chp_electricity'
                    ? 'border-info bg-info bg-opacity-10'
                    : 'border-bg-secondary hover:border-info'
                }`}
              >
                <div className="text-sm font-semibold text-text-primary">CHP Electricity</div>
                <div className="text-xs text-text-secondary mt-1">Combined heat & power</div>
              </button>
            </div>
          </div>

          <div className="bg-bg-secondary rounded p-3">
            <div className="text-sm text-text-secondary">Daily Volume</div>
            <div className="text-xl font-bold text-text-primary">
              {(project.dailyWasteVolume * organicPercentage / 100).toFixed(1)} tonnes
            </div>
          </div>
        </div>
      </Card>

      {/* Hazardous Waste Stream */}
      <Card>
        <div className="flex items-center space-x-3 mb-4">
          <Flame className="text-red-500" size={28} />
          <div>
            <h4 className="text-lg font-semibold text-text-primary">Hazardous Waste Stream</h4>
            <p className="text-sm text-text-secondary">Controlled Incineration (10%)</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-bg-secondary rounded p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-secondary">Fixed Allocation</span>
              <span className="text-2xl font-bold text-text-primary">10%</span>
            </div>
            <p className="text-xs text-text-secondary">
              Hazardous waste allocation is fixed at 10% for safety and regulatory compliance
            </p>
          </div>

          <div className="bg-bg-secondary rounded p-3">
            <div className="text-sm text-text-secondary">Daily Volume</div>
            <div className="text-xl font-bold text-text-primary">
              {(project.dailyWasteVolume * hazardousPercentage / 100).toFixed(1)} tonnes
            </div>
          </div>

          <div className="bg-bg-secondary rounded p-3">
            <div className="text-sm text-text-secondary">Technology</div>
            <div className="text-base font-semibold text-text-primary">
              Waste-to-Energy
            </div>
            <div className="text-xs text-text-secondary mt-1">
              With waste heat recovery for electricity generation
            </div>
          </div>
        </div>
      </Card>

      {/* Collection Stream */}
      <Card>
        <div className="flex items-center space-x-3 mb-4">
          <Truck className="text-blue-500" size={28} />
          <div>
            <h4 className="text-lg font-semibold text-text-primary">Improved Collection Stream</h4>
            <p className="text-sm text-text-secondary">Enhanced Collection Systems (25-30%)</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Allocation Percentage: {collectionPercentage.toFixed(1)}%
            </label>
            <input
              type="range"
              min="20"
              max="35"
              step="0.5"
              value={collectionPercentage}
              onChange={(e) => setCollectionPercentage(parseFloat(e.target.value))}
              className="w-full h-2 bg-bg-secondary rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-text-secondary mt-1">
              <span>20%</span>
              <span className="text-safe">25-30% (Target)</span>
              <span>35%</span>
            </div>
          </div>

          <div className="bg-bg-secondary rounded p-3">
            <div className="text-sm text-text-secondary">Daily Volume</div>
            <div className="text-xl font-bold text-text-primary">
              {(project.dailyWasteVolume * collectionPercentage / 100).toFixed(1)} tonnes
            </div>
          </div>

          <div className="bg-bg-secondary rounded p-3">
            <div className="text-sm text-text-secondary">Climate Benefit</div>
            <div className="text-base font-semibold text-text-primary">
              Prevents Bush Dumping & Methane Emissions
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default WasteStreamConfiguration;
