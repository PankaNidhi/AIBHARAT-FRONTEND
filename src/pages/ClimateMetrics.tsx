import { Target, DollarSign, FileText, TrendingUp, TrendingDown, Globe, Award } from 'lucide-react';
import { Card } from '../components/Card';

const ClimateMetrics = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Climate Compensation Metrics</h1>
        </div>
        <div className="flex space-x-2">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
            COP30 Compliant
          </span>
          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-medium rounded-full">
            Gold Standard Verified
          </span>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-2">Total CO₂ Avoided</p>
                <p className="text-3xl font-bold text-gray-900">0 tCO₂e</p>
                <p className="text-sm text-gray-500 mt-1">Target: 15,000 tCO₂e</p>
                <p className="text-sm font-medium text-gray-600 mt-2">0.0%</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <Target size={24} className="text-green-600" />
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '0%' }}></div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-2">Climate Finance Generated</p>
                <p className="text-3xl font-bold text-gray-900">$0K</p>
                <p className="text-sm text-gray-500 mt-1">Target: $3.0M</p>
                <p className="text-sm font-medium text-gray-600 mt-2">0.0%</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <DollarSign size={24} className="text-blue-600" />
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '0%' }}></div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-2">Active Projects</p>
                <p className="text-3xl font-bold text-gray-900">0</p>
                <p className="text-sm text-gray-500 mt-1">Total: 0</p>
                <p className="text-sm font-medium text-green-600 mt-2">98.7% compliant</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <FileText size={24} className="text-purple-600" />
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-purple-600 h-2 rounded-full" style={{ width: '98.7%' }}></div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-2">Average ROI</p>
                <p className="text-3xl font-bold text-gray-900">0.0%</p>
                <p className="text-sm text-gray-500 mt-1">Target: 15%</p>
                <p className="text-sm font-medium text-gray-600 mt-2">0.0%</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <TrendingUp size={24} className="text-yellow-600" />
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '0%' }}></div>
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-2">Total CO₂ Avoided</p>
                <p className="text-3xl font-bold text-gray-900">12,847 tCO₂e</p>
                <p className="text-sm text-gray-500 mt-1">Target: 15,000 tCO₂e</p>
                <p className="text-sm font-medium text-green-600 mt-2">85.6%</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <TrendingDown size={24} className="text-green-600" />
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '85.6%' }}></div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-2">Climate Finance Generated</p>
                <p className="text-3xl font-bold text-gray-900">$2.4M</p>
                <p className="text-sm text-gray-500 mt-1">Target: $3.0M</p>
                <p className="text-sm font-medium text-blue-600 mt-2">80%</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <DollarSign size={24} className="text-blue-600" />
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '80%' }}></div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-2">International Partnerships</p>
                <p className="text-3xl font-bold text-gray-900">4 Countries</p>
                <p className="text-sm text-gray-500 mt-1">Target: 6 Countries</p>
                <p className="text-sm font-medium text-purple-600 mt-2">66.7%</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <Globe size={24} className="text-purple-600" />
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-purple-600 h-2 rounded-full" style={{ width: '66.7%' }}></div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-2">Gold Standard Credits</p>
                <p className="text-3xl font-bold text-gray-900">8,234 VCUs</p>
                <p className="text-sm text-gray-500 mt-1">Target: 10,000 VCUs</p>
                <p className="text-sm font-medium text-yellow-600 mt-2">82.3%</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <Award size={24} className="text-yellow-600" />
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '82.3%' }}></div>
            </div>
          </div>
        </Card>
      </div>

      {/* Additional Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Climate Impact</h3>
            <div className="h-48 flex items-center justify-center text-gray-400">
              <p>Chart visualization area</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">International Partnerships</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-900">Sweden</span>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                  Active
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ClimateMetrics;
