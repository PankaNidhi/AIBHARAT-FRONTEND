import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, BarChart3, List, Recycle, Trophy, 
  TrendingUp, Activity, Bell, FileCheck, Settings as SettingsIcon, LogOut, ChevronDown
} from 'lucide-react';
import { useModuleContext } from '../contexts/ModuleContext';
import { useProjectContext } from '../contexts/ProjectContext';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const { selectedModules, setSelectedModules, modules } = useModuleContext();
  const { selectedProject, user } = useProjectContext();
  const [moduleDropdownOpen, setModuleDropdownOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/portfolio', label: 'Portfolio Overview', icon: BarChart3 },
    { path: '/projects', label: 'Project List', icon: List },
    { path: '/emissions-monitor', label: 'Emissions Monitor', icon: Activity },
    { path: '/waste-management', label: 'Waste Management', icon: Recycle },
    { path: '/champion', label: 'CHAMPION Module', icon: Trophy },
    { path: '/mrv-flows', label: 'MRV Flows', icon: TrendingUp },
    { path: '/climate-metrics', label: 'Climate Metrics', icon: Activity },
    { path: '/alerts', label: 'Smart Alerts', icon: Bell },
    { path: '/mrv-generator', label: 'MRV Report Generator', icon: FileCheck },
    { path: '/project-config', label: 'Project Configuration', icon: SettingsIcon },
  ];

  const handleModuleToggle = (moduleId: string) => {
    if (selectedModules.includes(moduleId)) {
      setSelectedModules(selectedModules.filter(id => id !== moduleId));
    } else {
      setSelectedModules([...selectedModules, moduleId]);
    }
  };

  const getPageTitle = () => {
    const currentNav = navItems.find(item => item.path === location.pathname);
    return currentNav?.label || 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#F5F5F5] border-r border-gray-200 flex flex-col fixed h-full z-50">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">NxES Platform</h1>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-sm font-semibold text-blue-600">{user.username.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
              <p className="text-xs text-gray-600 truncate">{user.role}</p>
            </div>
          </div>
        </div>

        {/* Module Selector */}
        <div className="px-4 py-4 border-b border-gray-200">
          <div className="relative">
            <button
              onClick={() => setModuleDropdownOpen(!moduleDropdownOpen)}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <span className="text-sm font-medium text-gray-700">
                {selectedModules.length > 0 
                  ? `${selectedModules.length} module${selectedModules.length > 1 ? 's' : ''} selected`
                  : 'Select Module'}
              </span>
              <ChevronDown size={16} className={`text-gray-600 transition-transform ${moduleDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {moduleDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg py-2 z-50 max-h-64 overflow-y-auto border border-gray-200">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Select Module</div>
                {modules.map((module) => (
                  <label
                    key={module.id}
                    className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer text-gray-700"
                  >
                    <input
                      type="checkbox"
                      checked={selectedModules.includes(module.id)}
                      onChange={() => handleModuleToggle(module.id)}
                      className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">{module.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white font-medium'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon size={18} />
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sign Out */}
        <div className="p-4 border-t border-gray-200">
          <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors">
            <LogOut size={16} />
            <span className="text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{getPageTitle()}</h2>
                {selectedProject && (
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-sm text-gray-600">{selectedProject.name}</span>
                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                      {selectedProject.sector}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-xs text-gray-500">Last updated</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date().toLocaleString('en-US', { 
                      month: '2-digit', 
                      day: '2-digit', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true 
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
