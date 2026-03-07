import { useState } from 'react';
import { useProjectContext } from '../contexts/ProjectContext';
import { Briefcase, ChevronDown, X, MapPin } from 'lucide-react';

const ProjectSelector = () => {
  const { projects, selectedProject, setSelectedProject } = useProjectContext();
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    setSelectedProject(project || null);
    setIsOpen(false);
  };

  const clearSelection = () => {
    setSelectedProject(null);
    setIsOpen(false);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      concept: 'bg-purple-100 text-purple-800',
      pilot: 'bg-blue-100 text-blue-800',
      implementation: 'bg-yellow-100 text-yellow-800',
      scaling: 'bg-green-100 text-green-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="relative">
      {/* Project Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
          selectedProject
            ? 'bg-info text-white'
            : 'bg-bg-secondary text-text-primary hover:bg-bg-primary'
        }`}
      >
        <Briefcase size={18} />
        <span>
          {selectedProject ? selectedProject.name : 'All Projects'}
        </span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full mt-2 right-0 bg-bg-secondary border border-bg-primary rounded-lg shadow-lg z-50 min-w-[400px] max-h-[500px] overflow-y-auto">
          <div className="p-3 border-b border-bg-primary sticky top-0 bg-bg-secondary">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-text-primary">Select Project</span>
              {selectedProject && (
                <button
                  onClick={clearSelection}
                  className="text-xs text-text-secondary hover:text-danger transition-colors"
                >
                  View All Projects
                </button>
              )}
            </div>
            <p className="text-xs text-text-secondary">
              Filter dashboard by specific project
            </p>
          </div>

          <div className="p-2">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => handleSelectProject(project.id)}
                className={`w-full flex items-start space-x-3 p-3 rounded-lg transition-colors ${
                  selectedProject?.id === project.id
                    ? 'bg-info bg-opacity-10 border-2 border-info'
                    : 'hover:bg-bg-primary border-2 border-transparent'
                }`}
              >
                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm font-semibold text-text-primary">{project.name}</div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </div>
                  <div className="text-xs text-text-secondary mb-1">{project.projectId}</div>
                  <div className="flex items-center space-x-2 text-xs text-text-secondary">
                    <MapPin size={12} />
                    <span>{project.location.city}, {project.country}</span>
                    <span>•</span>
                    <span>{project.sector}</span>
                  </div>
                  <div className="flex items-center space-x-3 mt-2 text-xs">
                    <span className="text-safe">
                      {(project.co2Reduction / 1000).toFixed(0)}k tCO₂e
                    </span>
                    <span className="text-info">
                      ${project.investmentValue}M
                    </span>
                    <span className="text-text-secondary">
                      TRL {project.trlLevel}
                    </span>
                  </div>
                </div>
                {selectedProject?.id === project.id && (
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

      {/* Active Project Banner */}
      {selectedProject && (
        <div className="absolute top-full mt-2 left-0 right-0">
          <div className="bg-info bg-opacity-10 border border-info rounded-lg p-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-medium text-info">Active Project:</span>
                <span className="text-xs font-semibold text-text-primary">{selectedProject.name}</span>
                <span className="text-xs text-text-secondary">({selectedProject.projectId})</span>
              </div>
              <button
                onClick={clearSelection}
                className="hover:bg-white hover:bg-opacity-20 rounded-full p-1"
              >
                <X size={14} className="text-info" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectSelector;
