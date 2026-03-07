import { useState } from 'react';
import { useModuleContext } from '../contexts/ModuleContext';
import { Filter, X, ChevronDown } from 'lucide-react';

const ModuleSelector = () => {
  const { modules, selectedModules, setSelectedModules, isModuleSelected } = useModuleContext();
  const [isOpen, setIsOpen] = useState(false);

  const toggleModule = (moduleId: string) => {
    if (isModuleSelected(moduleId)) {
      setSelectedModules(selectedModules.filter(id => id !== moduleId));
    } else {
      setSelectedModules([...selectedModules, moduleId]);
    }
  };

  const clearFilters = () => {
    setSelectedModules([]);
    setIsOpen(false);
  };

  const hasFilters = selectedModules.length > 0;

  return (
    <div className="relative">
      {/* Module Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
          hasFilters
            ? 'bg-info text-white'
            : 'bg-bg-secondary text-text-primary hover:bg-bg-primary'
        }`}
      >
        <Filter size={18} />
        <span>
          {hasFilters
            ? `${selectedModules.length} Module${selectedModules.length > 1 ? 's' : ''}`
            : 'All Modules'}
        </span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full mt-2 right-0 bg-bg-secondary border border-bg-primary rounded-lg shadow-lg z-50 min-w-[280px]">
          <div className="p-3 border-b border-bg-primary">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-text-primary">Filter by Industry</span>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-text-secondary hover:text-danger transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>
            <p className="text-xs text-text-secondary">
              Select modules to filter data and processes
            </p>
          </div>

          <div className="p-2">
            {modules.map((module) => (
              <button
                key={module.id}
                onClick={() => toggleModule(module.id)}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  isModuleSelected(module.id)
                    ? 'bg-info bg-opacity-10 border-2 border-info'
                    : 'hover:bg-bg-primary border-2 border-transparent'
                }`}
              >
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-2xl"
                  style={{ backgroundColor: `${module.color}20` }}
                >
                  {module.icon}
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-semibold text-text-primary">{module.name}</div>
                  <div className="text-xs text-text-secondary">{module.description}</div>
                </div>
                {isModuleSelected(module.id) && (
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-info flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Active Filter Banner */}
      {hasFilters && (
        <div className="absolute top-full mt-2 left-0 right-0">
          <div className="bg-info bg-opacity-10 border border-info rounded-lg p-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 flex-wrap gap-1">
                <span className="text-xs font-medium text-info">Active Filters:</span>
                {selectedModules.map((moduleId) => {
                  const module = modules.find(m => m.id === moduleId);
                  return module ? (
                    <span
                      key={moduleId}
                      className="inline-flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium text-white"
                      style={{ backgroundColor: module.color }}
                    >
                      <span>{module.icon}</span>
                      <span>{module.name}</span>
                      <button
                        onClick={() => toggleModule(moduleId)}
                        className="ml-1 hover:bg-white hover:bg-opacity-20 rounded-full p-0.5"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModuleSelector;
