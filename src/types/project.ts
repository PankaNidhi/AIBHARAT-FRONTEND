/**
 * Project and Portfolio type definitions for NxES Neutral Platform v2
 */

export type ProjectStatus = 'concept' | 'pilot' | 'implementation' | 'scaling';
export type UserRole = 'admin' | 'project_manager' | 'viewer';

export interface Project {
  id: string;
  projectId: string;
  name: string;
  description: string;
  country: string;
  countryCode: string;
  sector: string;
  plantType: string;
  status: ProjectStatus;
  trlLevel: number;
  implementingPartner: string;
  co2Reduction: number;
  investmentValue: number;
  startDate: string;
  location: {
    city: string;
    region: string;
    latitude: number;
    longitude: number;
  };
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  assignedProjects: string[];
}

export interface PortfolioAnalytics {
  totalProjects: number;
  countriesCount: number;
  totalCO2Reduction: number;
  totalInvestment: number;
  statusDistribution: { status: string; count: number }[];
  trlDistribution: { level: number; count: number }[];
  sectorDistribution: { sector: string; count: number }[];
}

// Demo projects for hackathon showcase
export const DEMO_PROJECTS: Project[] = [
  {
    id: 'proj-cement-b-chennai',
    projectId: 'PROJ-2024-001',
    name: 'Cement Plant B – Chennai',
    description: 'Industrial Decarbonization Initiative',
    country: 'India',
    countryCode: 'IN',
    sector: 'Cement Manufacturing',
    plantType: 'Cement Plant',
    status: 'scaling',
    trlLevel: 8,
    implementingPartner: 'ACC Limited',
    co2Reduction: 892,
    investmentValue: 2.5,
    startDate: '2023-06-15',
    location: {
      city: 'Chennai',
      region: 'Tamil Nadu',
      latitude: 13.0827,
      longitude: 80.2707,
    },
  },
  {
    id: 'proj-cement-d-bangalore',
    projectId: 'PROJ-2024-002',
    name: 'Cement Plant D – Bangalore',
    description: 'Industrial Efficiency Enhancement',
    country: 'India',
    countryCode: 'IN',
    sector: 'Cement Manufacturing',
    plantType: 'Cement Plant',
    status: 'implementation',
    trlLevel: 7,
    implementingPartner: 'Ultratech Cement',
    co2Reduction: 708,
    investmentValue: 1.8,
    startDate: '2023-09-20',
    location: {
      city: 'Bangalore',
      region: 'Karnataka',
      latitude: 12.9716,
      longitude: 77.5946,
    },
  },
];

export const MOCK_USER: User = {
  id: 'user-1',
  username: 'admin',
  email: 'admin@aiclimate.com',
  role: 'admin',
  assignedProjects: ['proj-cement-b-chennai', 'proj-cement-d-bangalore'],
};
