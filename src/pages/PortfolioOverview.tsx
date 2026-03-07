import { Card } from '../components/Card';
import { useProjectContext } from '../contexts/ProjectContext';
import { Briefcase, Globe, TrendingDown, DollarSign, MapPin, Building2, Users } from 'lucide-react';

const PortfolioOverview = () => {
  const { projects, getPortfolioAnalytics, user } = useProjectContext();
  const analytics = getPortfolioAnalytics();

  const getStatusColor = (status: string) => {
    const colors = {
      concept: 'bg-purple-500',
      pilot: 'bg-blue-500',
      implementation: 'bg-yellow-500',
      scaling: 'bg-green-500',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Portfolio Overview</h1>
        <p className="text-gray-600 mt-2">
          Comprehensive view of all climate and circular economy projects
        </p>
      </div>

      {/* User Role Badge */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200">
          <Users size={18} className="text-blue-600" />
          <span className="text-sm font-medium text-blue-900 capitalize">{user.role.replace('_', ' ')}</span>
        </div>
        <span className="text-sm text-gray-600">
          Access to {user.assignedProjects.length} projects
        </span>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-2">Total Projects</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.totalProjects}</p>
                <p className="text-sm text-gray-500 mt-1">Active portfolio</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Briefcase size={24} className="text-blue-600" />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-2">Countries</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.countriesCount}</p>
                <p className="text-sm text-gray-500 mt-1">Geographic reach</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <Globe size={24} className="text-green-600" />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-2">CO₂ Reduction</p>
                <p className="text-3xl font-bold text-gray-900">
                  {(analytics.totalCO2Reduction / 1000).toFixed(0)}k
                </p>
                <p className="text-sm text-gray-500 mt-1">tCO₂e/year</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg">
                <TrendingDown size={24} className="text-emerald-600" />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-2">Investment</p>
                <p className="text-3xl font-bold text-gray-900">
                  ${analytics.totalInvestment.toFixed(1)}M
                </p>
                <p className="text-sm text-gray-500 mt-1">Total value</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <DollarSign size={24} className="text-purple-600" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Status Distribution */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Projects by Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {analytics.statusDistribution.map((item) => (
              <div key={item.status} className="text-center">
                <div className={`w-20 h-20 rounded-full ${getStatusColor(item.status)} mx-auto flex items-center justify-center mb-3`}>
                  <span className="text-3xl font-bold text-white">{item.count}</span>
                </div>
                <div className="text-base font-medium text-gray-900 capitalize">{item.status}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Sector Distribution */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Projects by Sector</h3>
          <div className="space-y-4">
            {analytics.sectorDistribution.map((item) => {
              const percentage = (item.count / analytics.totalProjects) * 100;
              return (
                <div key={item.sector}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-base font-medium text-gray-900">{item.sector}</span>
                    <span className="text-sm text-gray-600">{item.count} projects ({percentage.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Project List */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">All Projects</h3>
          <div className="space-y-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className="p-5 rounded-lg bg-gray-50 border border-gray-200 hover:border-blue-400 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-base font-semibold text-gray-900">{project.name}</h4>
                      <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                        project.status === 'concept' ? 'bg-purple-100 text-purple-800' :
                        project.status === 'pilot' ? 'bg-blue-100 text-blue-800' :
                        project.status === 'implementation' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{project.description}</p>
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <MapPin size={14} />
                        <span>{project.location.city}, {project.country}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Building2 size={14} />
                        <span>{project.sector}</span>
                      </div>
                      <span className="font-medium">TRL {project.trlLevel}</span>
                    </div>
                  </div>
                  <div className="text-right ml-6">
                    <div className="text-base font-semibold text-green-600">
                      {(project.co2Reduction / 1000).toFixed(0)}k tCO₂e
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      ${project.investmentValue}M
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <span className="text-sm text-gray-600">
                    {project.implementingPartner}
                  </span>
                  <span className="text-sm text-gray-600">
                    Started: {new Date(project.startDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PortfolioOverview;
