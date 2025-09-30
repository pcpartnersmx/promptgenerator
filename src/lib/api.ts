import { PromptProject } from '@/components/Dashboard';

const API_BASE_URL = '/api/projects';

export class ProjectsAPI {
  // Obtener todos los proyectos del usuario
  static async getProjects(): Promise<PromptProject[]> {
    const response = await fetch(API_BASE_URL);
    
    if (!response.ok) {
      throw new Error('Error al obtener proyectos');
    }
    
    return response.json();
  }

  // Obtener un proyecto específico
  static async getProject(id: string): Promise<PromptProject> {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    
    if (!response.ok) {
      throw new Error('Error al obtener el proyecto');
    }
    
    return response.json();
  }

  // Crear un nuevo proyecto
  static async createProject(projectData: {
    name: string;
    description: string;
    tags?: string[];
    availableVariables?: string[];
  }): Promise<PromptProject> {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectData),
    });
    
    if (!response.ok) {
      throw new Error('Error al crear el proyecto');
    }
    
    return response.json();
  }

  // Actualizar un proyecto
  static async updateProject(
    id: string, 
    projectData: Partial<Omit<PromptProject, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<PromptProject> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectData),
    });
    
    if (!response.ok) {
      throw new Error('Error al actualizar el proyecto');
    }
    
    return response.json();
  }

  // Eliminar un proyecto
  static async deleteProject(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Error al eliminar el proyecto');
    }
  }

  // Generar prompt para un proyecto
  static async generatePrompt(
    id: string, 
    formData: { [key: string]: string }
  ): Promise<{ project: PromptProject; generatedPrompt: string }> {
    const response = await fetch(`${API_BASE_URL}/${id}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ formData }),
    });
    
    if (!response.ok) {
      throw new Error('Error al generar el prompt');
    }
    
    return response.json();
  }
}
