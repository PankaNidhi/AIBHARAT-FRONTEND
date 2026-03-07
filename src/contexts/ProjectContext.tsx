import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Project, DEMO_PROJECTS, MOCK_USER, User, PortfolioAnalytics } from '../types/project';

interface ProjectContextType {
  projects: Project[];
  selectedProject: Project | null;
  setSelectedProject: (project: Project | null) => void;
  user: User;
  getProjectById: (id: string) => Project | undefined;
  getPortfolioAnalytics: () => PortfolioAnalytics;
  filterProjectsByStatus: (status: string) => Project[];
  addProject: (project: Project) => void;
  refreshProjects: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProjectContext = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjectContext must be used within ProjectProvider');
  }
  return context;
};

interface ProjectProviderProps {
  children: ReactNode;
}

export const ProjectProvider: React.FC<ProjectProviderProps> = ({ children }) => {
  // Initialize projects - ALWAYS use DEMO_PROJECTS for demo
  const initializeProjects = (): Project[] => {
    // Always initialize with demo projects
    console.log('🚀 Initializing with DEMO_PROJECTS:', DEMO_PROJECTS);
    
    // Save to localStorage for persistence
    try {
      localStorage.setItem('projects', JSON.stringify(DEMO_PROJECTS));
      console.log('✅ Saved DEMO_PROJECTS to localStorage');
    } catch (e) {
      console.error('❌ Error saving to localStorage:', e);
    }
    
    return DEMO_PROJECTS;
  };

  const [projects, setProjects] = useState<Project[]>(initializeProjects());
  console.log('✅ ProjectProvider initialized with', projects.length, 'projects');
  
  const [selectedProject, setSelectedProjectState] = useState<Project | null>(() => {
    const stored = localStorage.getItem('selectedProject');
    if (stored) {
      const projectId = JSON.parse(stored);
      try {
        const allProjects = localStorage.getItem('projects') 
          ? JSON.parse(localStorage.getItem('projects')!) 
          : DEMO_PROJECTS;
        return allProjects.find((p: Project) => p.id === projectId) || null;
      } catch (e) {
        console.error('Error loading selected project:', e);
        return null;
      }
    }
    return null;
  });
  const [user] = useState<User>(MOCK_USER);

  // Refresh projects when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const stored = localStorage.getItem('projects');
        const newProjects = stored ? JSON.parse(stored) : DEMO_PROJECTS;
        setProjects(newProjects);
      } catch (e) {
        console.error('Error loading projects from localStorage:', e);
        setProjects(DEMO_PROJECTS);
      }
    };

    // Listen for both storage events and custom projectsUpdated event
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('projectsUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('projectsUpdated', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (selectedProject) {
      localStorage.setItem('selectedProject', JSON.stringify(selectedProject.id));
    } else {
      localStorage.removeItem('selectedProject');
    }
  }, [selectedProject]);

  const setSelectedProject = (project: Project | null) => {
    setSelectedProjectState(project);
  };

  const getProjectById = (id: string): Project | undefined => {
    return projects.find(p => p.id === id);
  };

  const getPortfolioAnalytics = (): PortfolioAnalytics => {
    const statusDistribution = projects.reduce((acc, project) => {
      const existing = acc.find(item => item.status === project.status);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ status: project.status, count: 1 });
      }
      return acc;
    }, [] as { status: string; count: number }[]);

    const trlDistribution = projects.reduce((acc, project) => {
      const existing = acc.find(item => item.level === project.trlLevel);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ level: project.trlLevel, count: 1 });
      }
      return acc;
    }, [] as { level: number; count: number }[]);

    const sectorDistribution = projects.reduce((acc, project) => {
      const existing = acc.find(item => item.sector === project.sector);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ sector: project.sector, count: 1 });
      }
      return acc;
    }, [] as { sector: string; count: number }[]);

    const uniqueCountries = new Set(projects.map(p => p.countryCode));

    return {
      totalProjects: projects.length,
      countriesCount: uniqueCountries.size,
      totalCO2Reduction: projects.reduce((sum, p) => sum + p.co2Reduction, 0),
      totalInvestment: projects.reduce((sum, p) => sum + p.investmentValue, 0),
      statusDistribution,
      trlDistribution,
      sectorDistribution,
    };
  };

  const filterProjectsByStatus = (status: string): Project[] => {
    return projects.filter(p => p.status === status);
  };

  const addProject = (project: Project) => {
    // Update state immediately
    setProjects(prev => {
      const newProjects = [...prev, project];
      return newProjects;
    });
    
    // Save to localStorage
    const storedProjects = JSON.parse(localStorage.getItem('projects') || '[]');
    storedProjects.push(project);
    localStorage.setItem('projects', JSON.stringify(storedProjects));
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('projectsUpdated'));
  };

  const refreshProjects = () => {
    try {
      const stored = localStorage.getItem('projects');
      const newProjects = stored ? JSON.parse(stored) : DEMO_PROJECTS;
      setProjects(newProjects);
    } catch (e) {
      console.error('Error refreshing projects:', e);
      setProjects(DEMO_PROJECTS);
    }
  };

  const value: ProjectContextType = {
    projects,
    selectedProject,
    setSelectedProject,
    user,
    getProjectById,
    getPortfolioAnalytics,
    filterProjectsByStatus,
    addProject,
    refreshProjects,
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};
