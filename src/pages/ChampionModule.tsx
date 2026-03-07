import { Calculator, TreePine, FileText, BookOpen, DollarSign, Leaf } from 'lucide-react';
import { Card, MetricCard } from '../components/Card';

const ChampionModule = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">NxES CHAMPION</h1>
        <p className="text-sm text-gray-600 mt-1">Scenario-based learning and decision-making for climate project governance</p>
      </div>

      {/* Main Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card hover>
          <div className="p-6">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
              <Calculator className="text-blue-600" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Economic Modeling</h3>
            <p className="text-sm text-gray-600 mb-4">
              Calculate NPV, IRR, and payback period for climate projects
            </p>
          </div>
        </Card>

        <Card hover>
          <div className="p-6">
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mb-4">
              <TreePine className="text-green-600" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tree Project Simulation</h3>
            <p className="text-sm text-gray-600 mb-4">
              Model tree survival, carbon sequestration, and livelihood impacts
            </p>
          </div>
        </Card>

        <Card hover>
          <div className="p-6">
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mb-4">
              <FileText className="text-purple-600" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Decision Cards</h3>
            <p className="text-sm text-gray-600 mb-4">
              Explore 16 integrity-focused decision cards across 5 project stages
            </p>
          </div>
        </Card>

        <Card hover>
          <div className="p-6">
            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center mb-4">
              <BookOpen className="text-orange-600" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Scenario Library</h3>
            <p className="text-sm text-gray-600 mb-4">
              Browse pre-configured regional scenarios for learning
            </p>
          </div>
        </Card>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Economic Scenarios"
          value="3"
          icon={<DollarSign size={24} />}
          color="blue"
        />
        <MetricCard
          title="Tree Scenarios"
          value="2"
          icon={<Leaf size={24} />}
          color="green"
        />
        <MetricCard
          title="Decision Cards"
          value="16"
          icon={<FileText size={24} />}
          color="purple"
        />
      </div>

      {/* Recent Scenarios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Economic Scenarios</h3>
              <a href="#" className="text-sm text-blue-600 hover:text-blue-700">View All →</a>
            </div>
            <div className="space-y-3">
              <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                <h4 className="font-medium text-gray-900">Baseline Steel Production</h4>
                <p className="text-xs text-gray-500 mt-1">15 minutes ago</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Tree Scenarios</h3>
              <a href="#" className="text-sm text-blue-600 hover:text-blue-700">View All →</a>
            </div>
            <div className="space-y-3">
              <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                <h4 className="font-medium text-gray-900">Urban Reforestation - Kenya</h4>
                <p className="text-xs text-gray-500 mt-1">15 minutes ago</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ChampionModule;
