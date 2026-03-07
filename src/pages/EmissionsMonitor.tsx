import { useEffect, useState } from 'react';
import EmissionsService, { EmissionData } from '../services/EmissionsService';
import { API_CONFIG } from '../config/api';
import { Activity, Thermometer, Gauge, Wind, Calendar, Cpu, RefreshCw, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const EmissionsMonitor = () => {
  const [emissions, setEmissions] = useState<EmissionData[]>([]);
  const [latestEmission, setLatestEmission] = useState<EmissionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchData = async () => {
    try {
      const [latest, history] = await Promise.all([
        EmissionsService.getLatestEmissions(),
        EmissionsService.getEmissionsHistory(50)
      ]);
      
      setLatestEmission(latest);
      setEmissions(history);
      setLoading(false);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching emissions:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, API_CONFIG.REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (value: number, thresholds: { normal: number, elevated: number, high: number }) => {
    if (value < thresholds.normal) return 'text-green-600 bg-green-50 border-green-200';
    if (value < thresholds.elevated) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (value < thresholds.high) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getStatusLabel = (value: number, thresholds: { normal: number, elevated: number, high: number }) => {
    if (value < thresholds.normal) return 'Normal';
    if (value < thresholds.elevated) return 'Elevated';
    if (value < thresholds.high) return 'High';
    return 'Critical';
  };

  const getTrend = (current: number, previous: number) => {
    const diff = current - previous;
    if (Math.abs(diff) < 0.1) return { icon: <Minus size={16} />, label: 'Stable', color: 'text-gray-500' };
    if (diff > 0) return { icon: <TrendingUp size={16} />, label: 'Rising', color: 'text-red-500' };
    return { icon: <TrendingDown size={16} />, label: 'Falling', color: 'text-green-500' };
  };

  const calculateStats = () => {
    if (emissions.length === 0) return null;
    
    const co2Values = emissions.map(e => e.co2Level).filter(v => v > 0);
    const tempValues = emissions.map(e => e.temperature).filter(v => v > 0);
    const pressureValues = emissions.map(e => e.pressure).filter(v => v > 0);
    const flowValues = emissions.map(e => e.flowRate).filter(v => v > 0);

    return {
      co2: {
        avg: co2Values.length > 0 ? co2Values.reduce((a, b) => a + b, 0) / co2Values.length : 0,
        min: co2Values.length > 0 ? Math.min(...co2Values) : 0,
        max: co2Values.length > 0 ? Math.max(...co2Values) : 0,
      },
      temp: {
        avg: tempValues.length > 0 ? tempValues.reduce((a, b) => a + b, 0) / tempValues.length : 0,
        min: tempValues.length > 0 ? Math.min(...tempValues) : 0,
        max: tempValues.length > 0 ? Math.max(...tempValues) : 0,
      },
      pressure: {
        avg: pressureValues.length > 0 ? pressureValues.reduce((a, b) => a + b, 0) / pressureValues.length : 0,
        min: pressureValues.length > 0 ? Math.min(...pressureValues) : 0,
        max: pressureValues.length > 0 ? Math.max(...pressureValues) : 0,
      },
      flow: {
        avg: flowValues.length > 0 ? flowValues.reduce((a, b) => a + b, 0) / flowValues.length : 0,
        min: flowValues.length > 0 ? Math.min(...flowValues) : 0,
        max: flowValues.length > 0 ? Math.max(...flowValues) : 0,
      },
    };
  };

  const stats = calculateStats();
  const previousEmission = emissions.length > 1 ? emissions[1] : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-3">
          <RefreshCw className="animate-spin text-blue-600" size={32} />
          <p className="text-gray-600">Loading emissions data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Activity className="text-blue-600" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Emissions Monitor</h1>
              <p className="text-sm text-gray-600 mt-1">Real-time emissions data from AIClimateControl-Emissions</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 mb-1">Last Updated</div>
            <div className="text-sm font-medium text-gray-900">
              {lastUpdate.toLocaleString('en-US', { 
                month: '2-digit', 
                day: '2-digit', 
                year: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit',
                hour12: true 
              })}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {emissions.length} readings loaded
            </div>
          </div>
        </div>
      </div>

      {/* Latest Reading - Large Display */}
      {latestEmission && latestEmission.co2Level > 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm border border-blue-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Current Readings</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Calendar size={16} />
              <span>{new Date(parseInt(latestEmission.timestamp)).toLocaleString()}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* CO2 Level */}
            <div className={`bg-white rounded-lg p-4 border-2 ${getStatusColor(latestEmission.co2Level, { normal: 400, elevated: 600, high: 800 })}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Activity className="text-blue-600" size={20} />
                  <span className="text-sm font-medium text-gray-700">CO₂ Level</span>
                </div>
                {previousEmission && previousEmission.co2Level > 0 && (
                  <div className={`flex items-center space-x-1 ${getTrend(latestEmission.co2Level, previousEmission.co2Level).color}`}>
                    {getTrend(latestEmission.co2Level, previousEmission.co2Level).icon}
                  </div>
                )}
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {latestEmission.co2Level.toFixed(1)}
                <span className="text-lg font-normal text-gray-600 ml-2">ppm</span>
              </div>
              <div className="text-xs font-semibold">
                {getStatusLabel(latestEmission.co2Level, { normal: 400, elevated: 600, high: 800 })}
              </div>
            </div>

            {/* Temperature */}
            <div className={`bg-white rounded-lg p-4 border-2 ${getStatusColor(latestEmission.temperature, { normal: 30, elevated: 40, high: 50 })}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Thermometer className="text-orange-600" size={20} />
                  <span className="text-sm font-medium text-gray-700">Temperature</span>
                </div>
                {previousEmission && previousEmission.temperature > 0 && (
                  <div className={`flex items-center space-x-1 ${getTrend(latestEmission.temperature, previousEmission.temperature).color}`}>
                    {getTrend(latestEmission.temperature, previousEmission.temperature).icon}
                  </div>
                )}
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {latestEmission.temperature.toFixed(1)}
                <span className="text-lg font-normal text-gray-600 ml-2">°C</span>
              </div>
              <div className="text-xs font-semibold">
                {getStatusLabel(latestEmission.temperature, { normal: 30, elevated: 40, high: 50 })}
              </div>
            </div>

            {/* Pressure */}
            <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Gauge className="text-purple-600" size={20} />
                  <span className="text-sm font-medium text-gray-700">Pressure</span>
                </div>
                {previousEmission && previousEmission.pressure > 0 && (
                  <div className={`flex items-center space-x-1 ${getTrend(latestEmission.pressure, previousEmission.pressure).color}`}>
                    {getTrend(latestEmission.pressure, previousEmission.pressure).icon}
                  </div>
                )}
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {latestEmission.pressure.toFixed(1)}
                <span className="text-lg font-normal text-gray-600 ml-2">kPa</span>
              </div>
              <div className="text-xs text-gray-600">
                {latestEmission.pressure >= 95 && latestEmission.pressure <= 105 ? 'Normal' : 'Abnormal'}
              </div>
            </div>

            {/* Flow Rate */}
            <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Wind className="text-cyan-600" size={20} />
                  <span className="text-sm font-medium text-gray-700">Flow Rate</span>
                </div>
                {previousEmission && previousEmission.flowRate > 0 && (
                  <div className={`flex items-center space-x-1 ${getTrend(latestEmission.flowRate, previousEmission.flowRate).color}`}>
                    {getTrend(latestEmission.flowRate, previousEmission.flowRate).icon}
                  </div>
                )}
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {latestEmission.flowRate.toFixed(0)}
                <span className="text-lg font-normal text-gray-600 ml-2">m³/h</span>
              </div>
              <div className="text-xs text-gray-600">
                {latestEmission.flowRate >= 1000 && latestEmission.flowRate <= 2000 ? 'Normal' : 'Abnormal'}
              </div>
            </div>
          </div>

          {/* Device Info */}
          <div className="mt-4 pt-4 border-t border-blue-200">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Cpu size={16} className="text-gray-500" />
                  <span className="text-gray-600">Device:</span>
                  <span className="font-medium text-gray-900">{latestEmission.deviceId}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">Facility:</span>
                  <span className="font-medium text-gray-900">{latestEmission.facilityId}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      {stats && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistics (Last {emissions.length} Readings)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-2">CO₂ Level (ppm)</div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Average:</span>
                  <span className="font-medium">{stats.co2.avg.toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Min:</span>
                  <span className="font-medium">{stats.co2.min.toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Max:</span>
                  <span className="font-medium">{stats.co2.max.toFixed(1)}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-2">Temperature (°C)</div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Average:</span>
                  <span className="font-medium">{stats.temp.avg.toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Min:</span>
                  <span className="font-medium">{stats.temp.min.toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Max:</span>
                  <span className="font-medium">{stats.temp.max.toFixed(1)}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-2">Pressure (kPa)</div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Average:</span>
                  <span className="font-medium">{stats.pressure.avg.toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Min:</span>
                  <span className="font-medium">{stats.pressure.min.toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Max:</span>
                  <span className="font-medium">{stats.pressure.max.toFixed(1)}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-2">Flow Rate (m³/h)</div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Average:</span>
                  <span className="font-medium">{stats.flow.avg.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Min:</span>
                  <span className="font-medium">{stats.flow.min.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Max:</span>
                  <span className="font-medium">{stats.flow.max.toFixed(0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Historical Data Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Readings</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Timestamp</th>
                <th className="px-4 py-3 text-right font-medium text-gray-700">CO₂ (ppm)</th>
                <th className="px-4 py-3 text-right font-medium text-gray-700">Temp (°C)</th>
                <th className="px-4 py-3 text-right font-medium text-gray-700">Pressure (kPa)</th>
                <th className="px-4 py-3 text-right font-medium text-gray-700">Flow (m³/h)</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Device</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {emissions.filter(e => e.co2Level > 0).slice(0, 20).map((emission, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900">
                    {new Date(parseInt(emission.timestamp)).toLocaleString('en-US', {
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: true
                    })}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">
                    {emission.co2Level.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">
                    {emission.temperature.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">
                    {emission.pressure.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">
                    {emission.flowRate.toFixed(0)}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    {emission.deviceId}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmissionsMonitor;
