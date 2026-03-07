import { useEffect, useState } from 'react';
import EmissionsService, { EmissionData } from '../services/EmissionsService';
import { API_CONFIG } from '../config/api';
import { AlertTriangle, Bell, Clock, RefreshCw, Activity, Thermometer, Gauge, Wind } from 'lucide-react';

interface EmissionAlert {
  id: string;
  facilityId: string;
  deviceId: string;
  timestamp: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  type: 'CO2' | 'Temperature' | 'Pressure' | 'FlowRate';
  value: number;
  threshold: number;
  unit: string;
  message: string;
}

const AlertsPage = () => {
  const [alerts, setAlerts] = useState<EmissionAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'All' | 'Critical' | 'High' | 'Medium' | 'Low'>('All');
  const [typeFilter, setTypeFilter] = useState<'All' | 'CO2' | 'Temperature' | 'Pressure' | 'FlowRate'>('All');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const generateAlertsFromEmissions = (emissionsData: EmissionData[]): EmissionAlert[] => {
    const generatedAlerts: EmissionAlert[] = [];

    emissionsData.forEach((emission) => {
      // CO2 Level Alerts
      if (emission.co2Level > 0) {
        let severity: 'Critical' | 'High' | 'Medium' | 'Low' = 'Low';
        let threshold = 400;
        
        if (emission.co2Level >= 800) {
          severity = 'Critical';
          threshold = 800;
        } else if (emission.co2Level >= 600) {
          severity = 'High';
          threshold = 600;
        } else if (emission.co2Level >= 400) {
          severity = 'Medium';
          threshold = 400;
        }

        if (emission.co2Level >= 400) {
          generatedAlerts.push({
            id: `${emission.timestamp}-co2`,
            facilityId: emission.facilityId,
            deviceId: emission.deviceId,
            timestamp: emission.timestamp,
            severity,
            type: 'CO2',
            value: emission.co2Level,
            threshold,
            unit: 'ppm',
            message: `CO₂ level ${severity.toLowerCase()} threshold exceeded: ${emission.co2Level.toFixed(1)} ppm (threshold: ${threshold} ppm)`
          });
        }
      }

      // Temperature Alerts
      if (emission.temperature > 0) {
        let severity: 'Critical' | 'High' | 'Medium' | 'Low' = 'Low';
        let threshold = 30;
        
        if (emission.temperature >= 50) {
          severity = 'Critical';
          threshold = 50;
        } else if (emission.temperature >= 40) {
          severity = 'High';
          threshold = 40;
        } else if (emission.temperature >= 30) {
          severity = 'Medium';
          threshold = 30;
        }

        if (emission.temperature >= 30) {
          generatedAlerts.push({
            id: `${emission.timestamp}-temp`,
            facilityId: emission.facilityId,
            deviceId: emission.deviceId,
            timestamp: emission.timestamp,
            severity,
            type: 'Temperature',
            value: emission.temperature,
            threshold,
            unit: '°C',
            message: `Temperature ${severity.toLowerCase()} threshold exceeded: ${emission.temperature.toFixed(1)}°C (threshold: ${threshold}°C)`
          });
        }
      }

      // Pressure Alerts (abnormal if outside 95-105 kPa range)
      if (emission.pressure > 0) {
        if (emission.pressure < 95 || emission.pressure > 105) {
          const severity: 'Critical' | 'High' | 'Medium' | 'Low' = 
            emission.pressure < 90 || emission.pressure > 110 ? 'Critical' :
            emission.pressure < 93 || emission.pressure > 107 ? 'High' : 'Medium';
          
          generatedAlerts.push({
            id: `${emission.timestamp}-pressure`,
            facilityId: emission.facilityId,
            deviceId: emission.deviceId,
            timestamp: emission.timestamp,
            severity,
            type: 'Pressure',
            value: emission.pressure,
            threshold: emission.pressure < 95 ? 95 : 105,
            unit: 'kPa',
            message: `Pressure ${severity.toLowerCase()} - abnormal reading: ${emission.pressure.toFixed(1)} kPa (normal range: 95-105 kPa)`
          });
        }
      }

      // Flow Rate Alerts (abnormal if outside 1000-2000 m³/h range)
      if (emission.flowRate > 0) {
        if (emission.flowRate < 1000 || emission.flowRate > 2000) {
          const severity: 'Critical' | 'High' | 'Medium' | 'Low' = 
            emission.flowRate < 800 || emission.flowRate > 2200 ? 'Critical' :
            emission.flowRate < 900 || emission.flowRate > 2100 ? 'High' : 'Medium';
          
          generatedAlerts.push({
            id: `${emission.timestamp}-flow`,
            facilityId: emission.facilityId,
            deviceId: emission.deviceId,
            timestamp: emission.timestamp,
            severity,
            type: 'FlowRate',
            value: emission.flowRate,
            threshold: emission.flowRate < 1000 ? 1000 : 2000,
            unit: 'm³/h',
            message: `Flow rate ${severity.toLowerCase()} - abnormal reading: ${emission.flowRate.toFixed(0)} m³/h (normal range: 1000-2000 m³/h)`
          });
        }
      }
    });

    return generatedAlerts.sort((a, b) => parseInt(b.timestamp) - parseInt(a.timestamp));
  };

  const fetchData = async () => {
    try {
      const data = await EmissionsService.getEmissionsHistory(100);
      const generatedAlerts = generateAlertsFromEmissions(data);
      setAlerts(generatedAlerts);
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

  const filteredAlerts = alerts.filter(alert => {
    const severityMatch = filter === 'All' || alert.severity === filter;
    const typeMatch = typeFilter === 'All' || alert.type === typeFilter;
    return severityMatch && typeMatch;
  });

  const stats = {
    total: alerts.length,
    critical: alerts.filter(a => a.severity === 'Critical').length,
    high: alerts.filter(a => a.severity === 'High').length,
    medium: alerts.filter(a => a.severity === 'Medium').length,
    low: alerts.filter(a => a.severity === 'Low').length,
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'Critical': return '🔴';
      case 'High': return '🟠';
      case 'Medium': return '🔵';
      case 'Low': return '🟢';
      default: return '⚪';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'CO2': return <Activity size={16} className="text-blue-600" />;
      case 'Temperature': return <Thermometer size={16} className="text-orange-600" />;
      case 'Pressure': return <Gauge size={16} className="text-purple-600" />;
      case 'FlowRate': return <Wind size={16} className="text-cyan-600" />;
      default: return <Bell size={16} />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-3">
          <RefreshCw className="animate-spin text-blue-600" size={32} />
          <p className="text-gray-600">Loading alerts from emissions data...</p>
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
              <Bell className="text-blue-600" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Smart Alerts</h1>
              <p className="text-sm text-gray-600 mt-1">Emissions threshold violations from AIClimateControl-Emissions</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock size={16} />
              <span>Last updated</span>
            </div>
            <div className="text-sm font-medium text-gray-900">
              {lastUpdate.toLocaleString('en-US', { 
                month: '2-digit', 
                day: '2-digit', 
                year: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
              })}
            </div>
            {stats.critical > 0 && (
              <div className="flex items-center space-x-2 px-4 py-2 bg-red-100 rounded-lg">
                <AlertTriangle className="text-red-600" size={20} />
                <span className="text-sm font-semibold text-red-800">{stats.critical} Critical</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">Total Alerts</div>
          <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-4">
          <div className="text-sm text-gray-600 mb-1">Critical</div>
          <div className="text-3xl font-bold text-red-600">{stats.critical}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-orange-200 p-4">
          <div className="text-sm text-gray-600 mb-1">High</div>
          <div className="text-3xl font-bold text-orange-600">{stats.high}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-4">
          <div className="text-sm text-gray-600 mb-1">Medium</div>
          <div className="text-3xl font-bold text-blue-600">{stats.medium}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-green-200 p-4">
          <div className="text-sm text-gray-600 mb-1">Low</div>
          <div className="text-3xl font-bold text-green-600">{stats.low}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-1 h-6 bg-blue-600 rounded"></div>
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-3 block">Severity</label>
            <div className="flex flex-wrap gap-2">
              {['All', 'Critical', 'High', 'Medium', 'Low'].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setFilter(sev as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filter === sev
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-3 block">Alert Type</label>
            <div className="flex flex-wrap gap-2">
              {['All', 'CO2', 'Temperature', 'Pressure', 'FlowRate'].map((type) => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    typeFilter === type
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type === 'FlowRate' ? 'Flow Rate' : type}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <Bell className="text-gray-400" size={32} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No alerts found</h3>
              <p className="text-sm text-gray-600">
                {filter !== 'All' || typeFilter !== 'All' 
                  ? 'Try adjusting your filters to see more alerts'
                  : 'All emission readings are within normal thresholds'}
              </p>
            </div>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div 
              key={alert.id}
              className={`bg-white rounded-lg shadow-sm border-l-4 p-5 hover:shadow-md transition-shadow ${
                alert.severity === 'Critical' ? 'border-l-red-500' :
                alert.severity === 'High' ? 'border-l-orange-500' :
                alert.severity === 'Medium' ? 'border-l-blue-500' :
                'border-l-green-500'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getSeverityIcon(alert.severity)}</span>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getSeverityColor(alert.severity)}`}>
                        {alert.severity}
                      </span>
                      <span className="flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                        {getTypeIcon(alert.type)}
                        <span className="ml-1">{alert.type === 'FlowRate' ? 'Flow Rate' : alert.type}</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">
                    {new Date(parseInt(alert.timestamp)).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(parseInt(alert.timestamp)).toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: true 
                    })}
                  </div>
                </div>
              </div>
              
              <p className="text-gray-900 font-medium text-base mb-3">{alert.message}</p>
              
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center space-x-6 text-sm">
                  <div>
                    <span className="text-gray-500">Device:</span>
                    <span className="ml-2 text-gray-900 font-medium">{alert.deviceId}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Facility:</span>
                    <span className="ml-2 text-gray-900 font-medium">{alert.facilityId}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Value:</span>
                    <span className="ml-2 text-gray-900 font-medium">{alert.value.toFixed(alert.type === 'FlowRate' ? 0 : 1)} {alert.unit}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AlertsPage;
