import { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import { WasteBinData } from '../types';
import apiClient from '../services/api';
import { API_ENDPOINTS, API_CONFIG } from '../config/api';
import { Trash2 } from 'lucide-react';

const WastePage = () => {
  const [bins, setBins] = useState<WasteBinData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const data = await apiClient.get(API_ENDPOINTS.WASTE_BINS);
      setBins((data as any).bins || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching waste bin data:', error);
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

  const stats = {
    total: bins.length,
    full: bins.filter(b => b.binStatus === 'Full').length,
    nearlyFull: bins.filter(b => b.binStatus === 'NearlyFull').length,
    partial: bins.filter(b => b.binStatus === 'Partial').length,
    empty: bins.filter(b => b.binStatus === 'Empty').length,
    avgFill: bins.length > 0 
      ? bins.reduce((sum, b) => sum + b.fillLevel, 0) / bins.length 
      : 0,
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-text-primary">Waste Management</h2>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <div className="text-text-secondary text-sm mb-1">Total Bins</div>
          <div className="text-3xl font-bold text-info">{stats.total}</div>
        </Card>
        <Card>
          <div className="text-text-secondary text-sm mb-1">Full</div>
          <div className="text-3xl font-bold text-danger">{stats.full}</div>
        </Card>
        <Card>
          <div className="text-text-secondary text-sm mb-1">Nearly Full</div>
          <div className="text-3xl font-bold text-warning">{stats.nearlyFull}</div>
        </Card>
        <Card>
          <div className="text-text-secondary text-sm mb-1">Partial</div>
          <div className="text-3xl font-bold text-safe">{stats.partial}</div>
        </Card>
        <Card>
          <div className="text-text-secondary text-sm mb-1">Avg Fill</div>
          <div className="text-3xl font-bold text-info">{stats.avgFill.toFixed(0)}%</div>
        </Card>
      </div>

      {/* Bins Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bins.length === 0 ? (
          <Card className="col-span-full">
            <p className="text-text-secondary text-center py-8">No waste bins found</p>
          </Card>
        ) : (
          bins.map((bin) => (
            <Card key={bin.binId}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Trash2 className="text-info" size={24} />
                  <h3 className="text-lg font-semibold text-text-primary">{bin.binId}</h3>
                </div>
                <StatusBadge status={bin.binStatus} size="sm" />
              </div>

              {/* Fill Level Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-text-secondary mb-1">
                  <span>Fill Level</span>
                  <span className="font-bold text-text-primary">{bin.fillLevel.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-bg-secondary rounded-full h-4 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      bin.fillLevel >= 90 ? 'bg-danger' :
                      bin.fillLevel >= 70 ? 'bg-warning' :
                      bin.fillLevel >= 30 ? 'bg-info' :
                      'bg-safe'
                    }`}
                    style={{ width: `${bin.fillLevel}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Distance</span>
                  <span className="text-text-primary">{bin.distance.toFixed(1)} cm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Last Update</span>
                  <span className="text-text-primary text-xs">
                    {new Date(bin.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Collection Priority */}
      {stats.full > 0 || stats.nearlyFull > 0 ? (
        <Card>
          <h3 className="text-xl font-semibold text-text-primary mb-4">Collection Priority</h3>
          <div className="space-y-2">
            {bins
              .filter(b => b.binStatus === 'Full' || b.binStatus === 'NearlyFull')
              .sort((a, b) => b.fillLevel - a.fillLevel)
              .map((bin, index) => (
                <div key={bin.binId} className="flex items-center justify-between bg-bg-secondary rounded p-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-text-primary font-bold">#{index + 1}</span>
                    <span className="text-text-primary">{bin.binId}</span>
                    <StatusBadge status={bin.binStatus} size="sm" />
                  </div>
                  <span className="text-text-primary font-bold">{bin.fillLevel.toFixed(0)}%</span>
                </div>
              ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
};

export default WastePage;
