import { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { EmissionData } from '../types';
import apiClient from '../services/api';
import { API_ENDPOINTS, API_CONFIG } from '../config/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const EmissionsPage = () => {
  const [latestData, setLatestData] = useState<EmissionData | null>(null);
  const [historyData, setHistoryData] = useState<EmissionData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [latest, history] = await Promise.all([
        apiClient.get(API_ENDPOINTS.EMISSIONS_LATEST),
        apiClient.get(`${API_ENDPOINTS.EMISSIONS_HISTORY}?limit=50`)
      ]);
      
      setLatestData(latest as unknown as EmissionData);
      setHistoryData((history as any).emissions || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching emissions data:', error);
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

  const chartData = historyData.map(d => ({
    time: new Date(d.timestamp).toLocaleTimeString(),
    co2: d.co2Level,
    temp: d.temperature,
    pressure: d.pressure,
  })).reverse();

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-text-primary">Emissions Monitoring</h2>

      {/* Latest Readings */}
      {latestData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <div className="text-text-secondary text-sm mb-1">CO2 Level</div>
            <div className="text-3xl font-bold text-info">{latestData.co2Level.toFixed(1)}</div>
            <div className="text-text-secondary text-xs">ppm</div>
          </Card>
          <Card>
            <div className="text-text-secondary text-sm mb-1">Temperature</div>
            <div className="text-3xl font-bold text-warning">{latestData.temperature.toFixed(1)}</div>
            <div className="text-text-secondary text-xs">°C</div>
          </Card>
          <Card>
            <div className="text-text-secondary text-sm mb-1">Pressure</div>
            <div className="text-3xl font-bold text-safe">{latestData.pressure.toFixed(1)}</div>
            <div className="text-text-secondary text-xs">Pa</div>
          </Card>
          <Card>
            <div className="text-text-secondary text-sm mb-1">Flow Rate</div>
            <div className="text-3xl font-bold text-info">{latestData.flowRate.toFixed(2)}</div>
            <div className="text-text-secondary text-xs">m³/s</div>
          </Card>
        </div>
      )}

      {/* Charts */}
      <Card>
        <h3 className="text-xl font-semibold text-text-primary mb-4">Historical Trends</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="time" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #374151' }}
              labelStyle={{ color: '#f1f5f9' }}
            />
            <Legend />
            <Line type="monotone" dataKey="co2" stroke="#3b82f6" name="CO2 (ppm)" />
            <Line type="monotone" dataKey="temp" stroke="#f59e0b" name="Temperature (°C)" />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

export default EmissionsPage;
