import { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import { GasSensorData, FlameSensorData } from '../types';
import apiClient from '../services/api';
import { API_ENDPOINTS, API_CONFIG } from '../config/api';
import { Wind, Flame } from 'lucide-react';

const SafetyPage = () => {
  const [gasData, setGasData] = useState<GasSensorData | null>(null);
  const [flameData, setFlameData] = useState<FlameSensorData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [gas, flame] = await Promise.all([
        apiClient.get(API_ENDPOINTS.GAS_SENSORS_LATEST),
        apiClient.get(API_ENDPOINTS.FLAME_SENSORS_LATEST)
      ]);
      
      setGasData(gas as unknown as GasSensorData);
      setFlameData(flame as unknown as FlameSensorData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching safety data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, API_CONFIG.REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="text-text-secondary">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-text-primary">Environmental Safety</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gas Sensor */}
        <Card>
          <div className="flex items-center space-x-3 mb-4">
            <Wind className="text-info" size={32} />
            <h3 className="text-xl font-semibold text-text-primary">Gas Sensor</h3>
          </div>
          {gasData ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Status</span>
                <StatusBadge status={gasData.severity} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Gas Level</span>
                <span className="text-text-primary font-bold">{gasData.gasLevel} ppm</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Temperature</span>
                <span className="text-text-primary font-bold">{gasData.temperature.toFixed(1)}°C</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Humidity</span>
                <span className="text-text-primary font-bold">{gasData.humidity.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Device</span>
                <span className="text-text-primary text-sm">{gasData.deviceId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Last Update</span>
                <span className="text-text-primary text-sm">
                  {new Date(gasData.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-text-secondary">No data available</p>
          )}
        </Card>

        {/* Flame Sensor */}
        <Card>
          <div className="flex items-center space-x-3 mb-4">
            <Flame className="text-danger" size={32} />
            <h3 className="text-xl font-semibold text-text-primary">Flame Sensor</h3>
          </div>
          {flameData ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Status</span>
                <StatusBadge status={flameData.flameDetected ? 'Critical' : 'Safe'} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Flame Detected</span>
                <span className={`font-bold ${flameData.flameDetected ? 'text-danger' : 'text-safe'}`}>
                  {flameData.flameDetected ? 'YES' : 'NO'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Temperature</span>
                <span className="text-text-primary font-bold">{flameData.temperature.toFixed(1)}°C</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Device</span>
                <span className="text-text-primary text-sm">{flameData.deviceId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Last Update</span>
                <span className="text-text-primary text-sm">
                  {new Date(flameData.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-text-secondary">No data available</p>
          )}
        </Card>
      </div>

      {/* Safety Guidelines */}
      <Card>
        <h3 className="text-xl font-semibold text-text-primary mb-4">Safety Guidelines</h3>
        <div className="space-y-3 text-text-secondary">
          <div className="flex items-start space-x-2">
            <span className="text-safe font-bold">Safe:</span>
            <span>Gas level below 200 ppm. Normal operations.</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-info font-bold">Low:</span>
            <span>Gas level 200-500 ppm. Monitor closely.</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-warning font-bold">Medium:</span>
            <span>Gas level 500-1000 ppm. Increase ventilation.</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-danger font-bold">High:</span>
            <span>Gas level 1000-2000 ppm. Evacuate non-essential personnel.</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-danger font-bold">Critical:</span>
            <span>Gas level above 2000 ppm or fire detected. Immediate evacuation required!</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SafetyPage;
