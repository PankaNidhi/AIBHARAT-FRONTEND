import { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Activity, Droplets, Flame, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';

// Simple types
interface SensorData {
  facilityId?: string;
  timestamp?: string;
  deviceId?: string;
  gasDetected?: boolean;
  gasType?: string;
  concentration?: number;
  severity?: string;
  flameDetected?: boolean;
  intensity?: number;
  binId?: string;
  fillLevel?: number;
  distanceCm?: number;
  binStatus?: string;
  binCapacityLiters?: number;
}

const WasteManagementDashboard = () => {
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [gasSensor, setGasSensor] = useState<SensorData | null>(null);
  const [flameSensor, setFlameSensor] = useState<SensorData | null>(null);
  const [wasteBins, setWasteBins] = useState<SensorData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'https://jbljrvuy95.execute-api.ap-south-1.amazonaws.com';
        
        console.log('Fetching from API:', apiUrl);
        
        const [gasRes, flameRes, binsRes] = await Promise.all([
          fetch(`${apiUrl}/api/facilities/facility001/gas-sensors/latest`).catch(e => {
            console.error('Gas sensor fetch error:', e);
            return null;
          }),
          fetch(`${apiUrl}/api/facilities/facility001/flame-sensors/latest`).catch(e => {
            console.error('Flame sensor fetch error:', e);
            return null;
          }),
          fetch(`${apiUrl}/api/facilities/facility001/waste-bins`).catch(e => {
            console.error('Waste bins fetch error:', e);
            return null;
          }),
        ]);

        if (gasRes && gasRes.ok) {
          const gasData = await gasRes.json();
          console.log('Gas sensor data:', gasData);
          setGasSensor(gasData);
        } else if (gasRes) {
          console.warn('Gas sensor response not OK:', gasRes.status);
        }

        if (flameRes && flameRes.ok) {
          const flameData = await flameRes.json();
          console.log('Flame sensor data:', flameData);
          setFlameSensor(flameData);
        } else if (flameRes) {
          console.warn('Flame sensor response not OK:', flameRes.status);
        }

        if (binsRes && binsRes.ok) {
          const binsData = await binsRes.json();
          console.log('Waste bins data:', binsData);
          setWasteBins(binsData.bins || []);
        } else if (binsRes) {
          console.warn('Waste bins response not OK:', binsRes.status);
        }

        setLastUpdate(new Date());
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return 'N/A';
    return new Date(parseInt(timestamp)).toLocaleString();
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Activity className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Climate Control Dashboard</h1>
          <p className="text-gray-600 mt-2">Real-time environmental monitoring and waste management</p>
        </div>
        <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          <Activity className="text-blue-600 animate-pulse" size={20} />
          <div className="text-sm">
            <div className="text-gray-500">Last Updated</div>
            <div className="font-semibold text-gray-900">{lastUpdate.toLocaleTimeString()}</div>
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Gas Sensor */}
        <Card className={`border-2 ${gasSensor?.gasDetected ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'}`}>
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className={`p-3 rounded-full ${gasSensor?.gasDetected ? 'bg-red-100' : 'bg-green-100'}`}>
                <Droplets className={gasSensor?.gasDetected ? 'text-red-600' : 'text-green-600'} size={28} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Gas Detection</h3>
                <p className="text-sm text-gray-600">Environmental Safety</p>
              </div>
            </div>
            
            {gasSensor ? (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className={`font-bold ${gasSensor.gasDetected ? 'text-red-600' : 'text-green-600'}`}>
                    {gasSensor.gasDetected ? '🔴 DETECTED' : '🟢 SAFE'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Type</span>
                  <span className="text-sm font-semibold">{gasSensor.gasType || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Concentration</span>
                  <span className="text-sm font-semibold">{gasSensor.concentration || 0} ppm</span>
                </div>
                <div className="text-xs text-gray-500 mt-3 pt-3 border-t">
                  {formatTime(gasSensor.timestamp)}
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <AlertTriangle className="text-gray-400 mx-auto mb-2" size={32} />
                <p className="text-sm text-gray-500">No sensor data</p>
              </div>
            )}
          </div>
        </Card>

        {/* Flame Sensor */}
        <Card className={`border-2 ${flameSensor?.flameDetected ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'}`}>
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className={`p-3 rounded-full ${flameSensor?.flameDetected ? 'bg-red-100' : 'bg-green-100'}`}>
                <Flame className={flameSensor?.flameDetected ? 'text-red-600' : 'text-green-600'} size={28} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Fire Detection</h3>
                <p className="text-sm text-gray-600">Fire Safety System</p>
              </div>
            </div>
            
            {flameSensor ? (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className={`font-bold ${flameSensor.flameDetected ? 'text-red-600' : 'text-green-600'}`}>
                    {flameSensor.flameDetected ? '🔴 FIRE' : '🟢 SAFE'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Intensity</span>
                  <span className="text-sm font-semibold">{flameSensor.intensity || 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Severity</span>
                  <span className={`text-sm font-semibold ${flameSensor.severity === 'Safe' ? 'text-green-600' : 'text-red-600'}`}>
                    {flameSensor.severity || 'N/A'}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-3 pt-3 border-t">
                  {formatTime(flameSensor.timestamp)}
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <AlertTriangle className="text-gray-400 mx-auto mb-2" size={32} />
                <p className="text-sm text-gray-500">No sensor data</p>
              </div>
            )}
          </div>
        </Card>

        {/* Waste Bins */}
        <Card className="border-2 border-blue-500 bg-blue-50">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 rounded-full bg-blue-100">
                <Trash2 className="text-blue-600" size={28} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Waste Bins</h3>
                <p className="text-sm text-gray-600">Collection Status</p>
              </div>
            </div>
            
            {wasteBins.length > 0 ? (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Bins</span>
                  <span className="font-bold text-blue-600">{wasteBins.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Full</span>
                  <span className="text-sm font-semibold text-red-600">
                    {wasteBins.filter(b => b.binStatus === 'Full').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Nearly Full</span>
                  <span className="text-sm font-semibold text-yellow-600">
                    {wasteBins.filter(b => b.binStatus === 'NearlyFull').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Average Fill</span>
                  <span className="text-sm font-semibold">
                    {(wasteBins.reduce((sum, b) => sum + (b.fillLevel || 0), 0) / wasteBins.length).toFixed(0)}%
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <AlertTriangle className="text-gray-400 mx-auto mb-2" size={32} />
                <p className="text-sm text-gray-500">No bin data</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Waste Bins Table */}
      {wasteBins.length > 0 && (
        <Card>
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Waste Bin Details</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-semibold">Bin ID</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold">Fill Level</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold">Distance</th>
                  </tr>
                </thead>
                <tbody>
                  {wasteBins.map((bin, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-sm">{bin.binId}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-full rounded-full ${
                                (bin.fillLevel || 0) >= 90 ? 'bg-red-500' :
                                (bin.fillLevel || 0) >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${bin.fillLevel || 0}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold">{(bin.fillLevel || 0).toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          bin.binStatus === 'Full' ? 'bg-red-100 text-red-800' :
                          bin.binStatus === 'NearlyFull' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {bin.binStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">{(bin.distanceCm || 0).toFixed(1)} cm</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}

      {/* Linked Devices Section */}
      <Card>
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Linked Sensors & Devices</h3>
          <div className="space-y-3">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-900">Device: rpi5-facility001</p>
                  <p className="text-sm text-gray-600 mt-1">Location: Cement Plant B – Chennai</p>
                  <p className="text-sm text-gray-600">Project: Cement Plant B – Chennai (PROJ-2024-001)</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                  ✓ Connected
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* System Status */}
      <Card className="border-2 border-blue-500">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <CheckCircle className="text-blue-600" size={24} />
            <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm text-gray-700">MRV Status</span>
              <span className="text-sm font-semibold text-green-600">✓ Ready</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm text-gray-700">Sensors Connected</span>
              <span className="text-sm font-semibold text-green-600">✓ Active</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm text-gray-700">Compliance Active</span>
              <span className="text-sm font-semibold text-green-600">✓ Verified</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default WasteManagementDashboard;
