import { useEffect, useState } from 'react';
import { FileText, DollarSign, Target, TrendingUp, Activity, Zap, BarChart3, TrendingDown } from 'lucide-react';
import { MetricCard, Card } from '../components/Card';
import { useProjectContext } from '../contexts/ProjectContext';
import { useModuleContext } from '../contexts/ModuleContext';
import EmissionsService, { FacilitySummary } from '../services/EmissionsService';
import { API_CONFIG } from '../config/api';

const Dashboard = () => {
  const { selectedProject, projects } = useProjectContext();
  const { selectedModules, modules } = useModuleContext();
  const [facilitySummary, setFacilitySummary] = useState<FacilitySummary | null>(null);
  const [loading, setLoading] = useState(true);

  console.log('Dashboard - projects from context:', projects);
  console.log('Dashboard - selectedProject:', selectedProject);
  console.log('Dashboard - selectedModules:', selectedModules);

  // Fetch facility summary data
  useEffect(() => {
    const fetchData = async () => {
      const summary = await EmissionsService.getFacilitySummary();
      setFacilitySummary(summary);
      setLoading(false);
    };

    fetchData();
    const interval = setInterval(fetchData, API_CONFIG.REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  // Filter projects based on selected modules and project
  const filteredProjects = projects.filter(project => {
    // If a specific project is selected, only show that project
    if (selectedProject) {
      return project.id === selectedProject.id;
    }
    
    // If modules are selected, filter by module/sector
    if (selectedModules.length > 0) {
      const selectedModuleNames = selectedModules.map(id => 
        modules.find(m => m.id === id)?.name.toLowerCase()
      );
      return selectedModuleNames.some(name => 
        project.sector.toLowerCase().includes(name || '') ||
        project.plantType.toLowerCase().includes(name || '')
      );
    }
    
    return true;
  });

  // Calculate metrics based on filtered projects
  const metrics = {
    totalProjects: filteredProjects.length,
    activeProjects: filteredProjects.filter(p => p.status === 'implementation' || p.status === 'scaling').length,
    totalInvestment: filteredProjects.reduce((sum, p) => sum + p.investmentValue, 0),
    avgInvestment: filteredProjects.length > 0 ? (filteredProjects.reduce((sum, p) => sum + p.investmentValue, 0) / filteredProjects.length) : 0,
    co2Reduction: filteredProjects.reduce((sum, p) => sum + p.co2Reduction, 0),
    co2ReductionAvg: filteredProjects.length > 0 ? (filteredProjects.reduce((sum, p) => sum + p.co2Reduction, 0) / filteredProjects.length) : 0,
    avgROI: 12.5,
    complianceRate: 98.5,
    coalDisplacement: 1234,
    steelProduction: 45678,
    energyEfficiency: 87.3
  };

  // Real-time emissions data from DynamoDB
  const emissionsData = facilitySummary?.latestEmissions;
  const activeAlertsCount = facilitySummary ? 
    facilitySummary.activeAlerts.critical + 
    facilitySummary.activeAlerts.high + 
    facilitySummary.activeAlerts.medium + 
    facilitySummary.activeAlerts.low : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading real-time data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Module Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-blue-900">
              {selectedProject ? selectedProject.name : 
                selectedModules.length > 0 
                  ? modules.filter(m => selectedModules.includes(m.id)).map(m => m.name).join(', ')
                  : 'All Modules'}
            </h3>
            <p className="text-xs text-blue-700 mt-1">
              <span className="font-medium">{filteredProjects.length} total projects</span> • <span className="font-medium">{metrics.activeProjects} active projects</span>
              {emissionsData && (
                <span> • <span className="font-medium text-green-700">Live Data Connected</span></span>
              )}
            </p>
          </div>
          {activeAlertsCount > 0 && (
            <div className="flex items-center space-x-2 px-3 py-1 bg-red-100 rounded-full">
              <Activity size={16} className="text-red-600" />
              <span className="text-sm font-medium text-red-700">{activeAlertsCount} Active Alerts</span>
            </div>
          )}
        </div>
      </div>

      {/* Real-time Emissions Data */}
      {emissionsData && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Real-Time Emissions Monitor</h3>
            <span className="text-xs text-gray-600">
              Last updated: {new Date(parseInt(emissionsData.timestamp)).toLocaleTimeString()}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-600">CO₂ Level</p>
              <p className="text-lg font-bold text-gray-900">{emissionsData.co2Level.toFixed(1)} ppm</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Temperature</p>
              <p className="text-lg font-bold text-gray-900">{emissionsData.temperature.toFixed(1)}°C</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Pressure</p>
              <p className="text-lg font-bold text-gray-900">{emissionsData.pressure.toFixed(1)} kPa</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Flow Rate</p>
              <p className="text-lg font-bold text-gray-900">{emissionsData.flowRate.toFixed(0)} m³/h</p>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Device: {emissionsData.deviceId} • Facility: {emissionsData.facilityId}
          </div>
        </div>
      )}

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Projects"
          value={metrics.totalProjects}
          subtitle={`${metrics.activeProjects} active projects running`}
          icon={<FileText size={24} />}
          color="blue"
        />
        
        <MetricCard
          title="Total Investment"
          value={`$${metrics.totalInvestment.toFixed(1)}M`}
          subtitle={`$${metrics.avgInvestment.toFixed(1)}M avg per project`}
          icon={<DollarSign size={24} />}
          color="green"
        />
        
        <MetricCard
          title="CO₂ Reduction"
          value={`${(metrics.co2Reduction / 1000).toFixed(0)}k tCO₂e`}
          subtitle={`${(metrics.co2ReductionAvg / 1000).toFixed(0)}k tCO₂e avg per project`}
          icon={<Target size={24} />}
          color="green"
        />
        
        <MetricCard
          title="Average ROI"
          value={`${metrics.avgROI}%`}
          subtitle={`${metrics.complianceRate}% compliance rate`}
          icon={<TrendingUp size={24} />}
          color="purple"
        />
      </div>

      {/* Bottom Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="CO₂ Reduction"
          value={`${(metrics.co2Reduction / 1000).toFixed(0)}k tCO₂e`}
          icon={<TrendingDown size={24} />}
          color="green"
          trend={{
            value: '-12.3%',
            isPositive: false,
            label: 'vs last month'
          }}
        />
        
        <MetricCard
          title="Coal Displacement"
          value={`${metrics.coalDisplacement} tons`}
          icon={<Activity size={24} />}
          color="blue"
          trend={{
            value: '+8.7%',
            isPositive: true,
            label: 'vs last month'
          }}
        />
        
        <MetricCard
          title="Steel Production"
          value={`${metrics.steelProduction} tons`}
          icon={<BarChart3 size={24} />}
          color="purple"
          trend={{
            value: '+5.2%',
            isPositive: true,
            label: 'vs last month'
          }}
        />
        
        <MetricCard
          title="Energy Efficiency"
          value={`${metrics.energyEfficiency}%`}
          icon={<Zap size={24} />}
          color="yellow"
          trend={{
            value: '+2.1%',
            isPositive: true,
            label: 'vs last month'
          }}
        />
      </div>

      {/* Active Projects Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Active Projects</h3>
              {selectedModules.length > 0 && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                  {modules.filter(m => selectedModules.includes(m.id)).map(m => m.name).join(', ')}
                </span>
              )}
            </div>
            {filteredProjects.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-gray-400">
                <div className="text-center">
                  <FileText size={48} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No active projects</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredProjects.slice(0, 3).map(project => (
                  <div key={project.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{project.name}</p>
                        <p className="text-xs text-gray-600">{project.sector}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        project.status === 'implementation' ? 'bg-yellow-100 text-yellow-800' :
                        project.status === 'scaling' ? 'bg-green-100 text-green-800' :
                        project.status === 'pilot' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Plant Status</h3>
            {filteredProjects.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-gray-400">
                <div className="text-center">
                  <Activity size={48} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No plants configured</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProjects.slice(0, 2).map(project => (
                  <div key={project.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{project.plantType} - {project.location.city}</p>
                      <p className="text-sm text-gray-600">Status: <span className="text-green-600 font-medium">Active</span></p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">94% Efficiency</p>
                      <p className="text-xs text-gray-500">{(project.co2Reduction / 1000).toFixed(0)}k tCO₂e saved</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
