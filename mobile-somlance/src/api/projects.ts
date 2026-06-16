import apiClient from './client';

export interface Project {
  id: string;
  clientId: string;
  title: string;
  description: string;
  budget: string | number;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  category?: string;
  deadline?: string;
  createdAt: string;
  client?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
  _count?: {
    proposals: number;
  };
  progress?: number;
  milestones?: { id: string; title: string; status: string; price: number }[];
  timeline?: { title: string; time: string; desc: string }[];
  files?: { name: string; size: string; type: string; url: string }[];
  isPlanSubmitted?: boolean;
}

export const getProjects = async (params?: any): Promise<{ projects: Project[], total: number }> => {
  const response = await apiClient.get('/projects', { params });
  return response.data.data;
};

export const getMyProjects = async (): Promise<{ projects: Project[] }> => {
  const response = await apiClient.get('/projects/my');
  // API might return array or object based on controller, assuming array or object with projects
  return response.data.data.projects ? response.data.data : { projects: response.data.data };
};

export const getProjectById = async (id: string): Promise<Project> => {
  const response = await apiClient.get(`/projects/${id}`);
  return response.data.data;
};

export const updateProject = async (id: string, data: any): Promise<Project> => {
  const response = await apiClient.put(`/projects/${id}`, data);
  return response.data.data;
};

export const createProject = async (data: any): Promise<Project> => {
  const response = await apiClient.post('/projects', data);
  return response.data.data;
};

export const startProject = async (projectId: string, templateId: string): Promise<any> => {
  const response = await apiClient.post(`/projects/${projectId}/start`, { templateId });
  return response.data;
};
