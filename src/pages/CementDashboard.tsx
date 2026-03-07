import { Card } from '../components/Card';
import { useModuleContext } from '../contexts/ModuleContext';
import { Flame, Gauge, TrendingDown, Activity, AlertCircle } from 'lucide-react';

const CementDashboard = () => {
  const { getIndustryData } = useModuleContext();
  const cementData = getIndustryData('cement');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-text-primary">Cement Manufacturing Module</h2>
        <p className="text-text-secondary mt-1">
          Rotary Kiln & Clinker Production Monitoring
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center space-x-3">
            <Flame className="text-orange-500" size={32} />
            <div>
              <div className="text-text-secondary text-sm">Kiln Temperature</div>
              <div className="text-2xl font-bold text-text-primary">1,450°C</div>
              <div className="text-xs text-safe">Optimal Range</div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3">
            <Gauge className="text-blue-500" size={32} />
            <div>
              <div className="text-text-secondary text-sm">Clinker Quality</div>
              <div className="text-2xl font-bold text-text-primary">98.5%</div>
              <div className="text-xs text-safe">Within Spec</div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3">
            <TrendingDown className="text-green-500" size={32} />
            <div>
              <div className="text-text-secondary text-sm">RDF Substitution</div>
              <div className="text-2xl font-bold text-text-primary">25%</div>
              <div className="text-xs text-safe">Alternative Fuels</div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3">
            <Activity className="text-purple-500" size={32} />
            <div>
              <div className="text-text-secondary text-sm">Production Rate</div>
              <div className="text-2xl font-bold text-text-primary">120 t/h</div>
              <div className="text-xs text-text-secondary">Clinker Output</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Processes */}
      <Card>
        <h3 className="text-xl font-semibold text-text-primary mb-4">Active Processes</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {cementData.processes.map((process, index) => (
            <div
              key={index}
              className="p-3 rounded-lg bg-bg-secondary border border-bg-primary"
            >
              <div className="text-sm font-medium text-text-primary">{process}</div>
              <div className="text-xs text-safe mt-1">Active</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Waste Streams */}
      <Card>
        <h3 className="text-xl font-semibold text-text-primary mb-4">Waste Stream Management</h3>
        <div className="space-y-3">
          {cementData.wasteStreams.map((stream, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg bg-bg-secondary"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-info bg-opacity-20 flex items-center justify-center">
                  <AlertCircle className="text-info" size={20} />
                </div>
                <div>
                  <div className="text-sm font-medium text-text-primary">{stream}</div>
                  <div className="text-xs text-text-secondary">Operational</div>
                </div>
              </div>
              <div className="text-sm font-semibold text-safe">Active</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Compliance */}
      <Card>
        <h3 className="text-xl font-semibold text-text-primary mb-4">Compliance Frameworks</h3>
        <div className="flex flex-wrap gap-2">
          {cementData.complianceFrameworks.map((framework, index) => (
            <span
              key={index}
              className="px-3 py-1 rounded-full bg-safe bg-opacity-20 text-safe text-sm font-medium"
            >
              {framework}
            </span>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default CementDashboard;
