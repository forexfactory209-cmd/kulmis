import apiClient from './client';

export interface ProgressTemplateStep {
  id?: string;
  name: string;
  orderIndex: number;
}

export interface ProgressTemplate {
  id: string;
  name: string;
  category?: string;
  steps: ProgressTemplateStep[];
}

export interface ProjectProgressStep {
  id: string;
  projectId: string;
  name: string;
  orderIndex: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

export const getTemplates = async (): Promise<ProgressTemplate[]> => {
  const response = await apiClient.get('/progress/templates');
  return response.data.data;
};

export const createTemplate = async (data: { name: string; category?: string; steps: { name: string }[] }): Promise<ProgressTemplate> => {
  const response = await apiClient.post('/progress/templates', data);
  return response.data.data;
};

export const updateTemplate = async (id: string, data: { name: string; category?: string; steps: { name: string }[] }): Promise<ProgressTemplate> => {
  const response = await apiClient.put(`/progress/templates/${id}`, data);
  return response.data.data;
};

export const deleteTemplate = async (id: string): Promise<void> => {
  await apiClient.delete(`/progress/templates/${id}`);
};

export const suggestSteps = async (category: string): Promise<string[]> => {
  const response = await apiClient.get(`/progress/suggest?category=${encodeURIComponent(category)}`);
  return response.data.data;
};

export const acceptJobWithTemplate = async (projectId: string, templateId: string): Promise<void> => {
  await apiClient.post(`/progress/projects/${projectId}/accept`, { templateId });
};

export const submitProjectStep = async (projectId: string, stepId: string, data: { message: string, fileUrl: string }): Promise<void> => {
  await apiClient.put(`/progress/projects/${projectId}/steps/${stepId}/submit`, data);
};

export const getProjectProgress = async (projectId: string): Promise<ProjectProgressStep[]> => {
  const response = await apiClient.get(`/progress/projects/${projectId}`);
  return response.data.data;
};
