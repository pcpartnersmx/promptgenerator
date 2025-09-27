'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { FiSettings, FiEdit3, FiFileText, FiZap, FiRotateCcw, FiFolder, FiPlus } from 'react-icons/fi';
import { toast } from 'sonner';
import FormComponent from '../components/FormComponent';
import TemplateEditor from '../components/TemplateEditor';
import PromptDisplay from '../components/PromptDisplay';
import Dashboard, { PromptProject } from '../components/Dashboard';
import ProjectEditor from '../components/ProjectEditor';

type FormData = {
  [key: string]: string;
};

export default function Home() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [projects, setProjects] = useState<PromptProject[]>([]);
  const [currentProject, setCurrentProject] = useState<PromptProject | null>(null);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [editingProject, setEditingProject] = useState<PromptProject | null>(null);

  // Load projects from localStorage on mount
  useEffect(() => {
    const savedProjects = localStorage.getItem('prompt-projects');
    if (savedProjects) {
      try {
        const parsedProjects = JSON.parse(savedProjects).map((project: any) => ({
          ...project,
          createdAt: new Date(project.createdAt),
          updatedAt: new Date(project.updatedAt)
        }));
        setProjects(parsedProjects);
      } catch (error) {
        console.error('Error loading projects:', error);
      }
    }
  }, []);

  // Save projects to localStorage whenever projects change
  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem('prompt-projects', JSON.stringify(projects));
    }
  }, [projects]);

  // Project management functions
  const createProject = (projectData: Omit<PromptProject, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProject: PromptProject = {
      ...projectData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setProjects([...projects, newProject]);
    setCurrentProject(newProject);
    setIsCreatingProject(false);
    setCurrentTab('form');
  };

  const updateProject = (projectData: Omit<PromptProject, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingProject) return;
    
    const updatedProject: PromptProject = {
      ...editingProject,
      ...projectData,
      updatedAt: new Date()
    };
    
    setProjects(projects.map(p => p.id === editingProject.id ? updatedProject : p));
    setEditingProject(null);
    
    // Update current project if it's the same one being edited
    if (currentProject && currentProject.id === editingProject.id) {
      setCurrentProject(updatedProject);
    }
  };

  const deleteProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setProjects(projects.filter(p => p.id !== projectId));
      
      // If the deleted project is currently open, go back to dashboard
      if (currentProject && currentProject.id === projectId) {
        setCurrentProject(null);
        setCurrentTab('dashboard');
      }
    }
  };

  const openProject = (project: PromptProject) => {
    setCurrentProject(project);
    setCurrentTab('form');
  };

  // Form handling functions
  const handleFormSubmit = (data: FormData) => {
    if (!currentProject) return;
    
    const updatedProject = {
      ...currentProject,
      formData: data,
      updatedAt: new Date()
    };
    
    setCurrentProject(updatedProject);
    setProjects(projects.map(p => p.id === currentProject.id ? updatedProject : p));
    setCurrentTab('template');
  };

  const handleTemplateSubmit = (templateText: string) => {
    if (!currentProject) return;
    
    const updatedProject = {
      ...currentProject,
      template: templateText,
      updatedAt: new Date()
    };
    
    setCurrentProject(updatedProject);
    setProjects(projects.map(p => p.id === currentProject.id ? updatedProject : p));
    setCurrentTab('result');
  };

  const addVariable = (variableName: string) => {
    if (!currentProject) return;
    
    if (variableName.trim() && !currentProject.availableVariables.includes(variableName.trim())) {
      const newVariable = variableName.trim();
      const updatedProject = {
        ...currentProject,
        availableVariables: [...currentProject.availableVariables, newVariable],
        formData: {...currentProject.formData, [newVariable]: ''},
        updatedAt: new Date()
      };
      
      setCurrentProject(updatedProject);
      setProjects(projects.map(p => p.id === currentProject.id ? updatedProject : p));
    }
  };

  const deleteVariable = (variableName: string) => {
    if (!currentProject) return;
    
    const updatedVariables = currentProject.availableVariables.filter(v => v !== variableName);
    const {[variableName]: removed, ...restFormData} = currentProject.formData;
    const variablePattern = `{${variableName}}`;
    const updatedTemplate = currentProject.template.replace(new RegExp(variablePattern.replace(/[{}]/g, '\\$&'), 'g'), '');
    
    const updatedProject = {
      ...currentProject,
      availableVariables: updatedVariables,
      formData: restFormData,
      template: updatedTemplate,
      updatedAt: new Date()
    };
    
    setCurrentProject(updatedProject);
    setProjects(projects.map(p => p.id === currentProject.id ? updatedProject : p));
  };

  const updateVariable = (oldName: string, newName: string) => {
    if (!currentProject) return;
    
    if (newName.trim() && (newName.trim() === oldName || !currentProject.availableVariables.includes(newName.trim()))) {
      const updatedVariables = currentProject.availableVariables.map(v => v === oldName ? newName.trim() : v);
      const {[oldName]: value, ...restFormData} = currentProject.formData;
      const oldPattern = `{${oldName}}`;
      const newPattern = `{${newName.trim()}}`;
      const updatedTemplate = currentProject.template.replace(new RegExp(oldPattern.replace(/[{}]/g, '\\$&'), 'g'), newPattern);
      
      const updatedProject = {
        ...currentProject,
        availableVariables: updatedVariables,
        formData: {...restFormData, [newName.trim()]: value},
        template: updatedTemplate,
        updatedAt: new Date()
      };
      
      setCurrentProject(updatedProject);
      setProjects(projects.map(p => p.id === currentProject.id ? updatedProject : p));
    }
  };

  const generatePrompt = () => {
    if (!currentProject) return;
    
    let prompt = currentProject.template;
    currentProject.availableVariables.forEach(variable => {
      const variablePattern = `{${variable}}`;
      const value = currentProject.formData[variable] || '';
      prompt = prompt.replace(new RegExp(variablePattern.replace(/[{}]/g, '\\$&'), 'g'), value);
    });
    
    const updatedProject = {
      ...currentProject,
      generatedPrompt: prompt,
      updatedAt: new Date()
    };
    
    setCurrentProject(updatedProject);
    setProjects(projects.map(p => p.id === currentProject.id ? updatedProject : p));
    toast.success(`Prompt generado para "${currentProject.name}"`);
  };

  const resetProject = () => {
    if (!currentProject) return;
    
    const resetData: FormData = {};
    currentProject.availableVariables.forEach(variable => {
      resetData[variable] = '';
    });
    
    const updatedProject = {
      ...currentProject,
      formData: resetData,
      generatedPrompt: '',
      updatedAt: new Date()
    };
    
    setCurrentProject(updatedProject);
    setProjects(projects.map(p => p.id === currentProject.id ? updatedProject : p));
    setCurrentTab('form');
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-xl border border-blue-200">
              <FiZap className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-black">
              Prompt Generator
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Crea prompts personalizados y potentes con formularios dinámicos y templates inteligentes
          </p>
        </header>

        {/* Main Content with Tabs */}
        <div className="max-w-6xl mx-auto">
          {isCreatingProject ? (
            <ProjectEditor
              onSave={createProject}
              onCancel={() => setIsCreatingProject(false)}
            />
          ) : editingProject ? (
            <ProjectEditor
              project={editingProject}
              onSave={updateProject}
              onCancel={() => setEditingProject(null)}
              isEditing={true}
            />
          ) : (
            <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
              <TabsList className={`grid w-full ${currentProject ? 'grid-cols-4' : 'grid-cols-1'} bg-gray-100 border border-gray-200`}>
                <TabsTrigger 
                  value="dashboard" 
                  className="flex items-center gap-2 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200"
                >
                  <FiFolder className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                  <span className="sm:hidden">Dash</span>
                </TabsTrigger>
                {currentProject && (
                  <>
                    <TabsTrigger 
                      value="form" 
                      className="flex items-center gap-2 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200"
                    >
                      <FiSettings className="w-4 h-4" />
                      <span className="hidden sm:inline">Configuración</span>
                      <span className="sm:hidden">Config</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="template"
                      className="flex items-center gap-2 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200"
                    >
                      <FiEdit3 className="w-4 h-4" />
                      <span className="hidden sm:inline">Editor</span>
                      <span className="sm:hidden">Edit</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="result"
                      className="flex items-center gap-2 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200"
                    >
                      <FiFileText className="w-4 h-4" />
                      <span className="hidden sm:inline">Resultado</span>
                      <span className="sm:hidden">Result</span>
                    </TabsTrigger>
                  </>
                )}
              </TabsList>

              <TabsContent value="dashboard" className="mt-0">
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
                  <Dashboard
                    projects={projects}
                    onCreateProject={() => setIsCreatingProject(true)}
                    onEditProject={setEditingProject}
                    onDeleteProject={deleteProject}
                    onOpenProject={openProject}
                  />
                </div>
              </TabsContent>

              {currentProject && (
                <>
                  <TabsContent value="form" className="mt-0">
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
                      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-blue-900">{currentProject.name}</h3>
                            <p className="text-sm text-blue-700">{currentProject.description}</p>
                          </div>
                          <button
                            onClick={() => {
                              setCurrentProject(null);
                              setCurrentTab('dashboard');
                            }}
                            className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                          >
                            ← Volver al Dashboard
                          </button>
                        </div>
                      </div>
                      <FormComponent 
                        onSubmit={handleFormSubmit}
                        availableVariables={currentProject.availableVariables}
                        formData={currentProject.formData}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="template" className="mt-0">
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
                      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-blue-900">{currentProject.name}</h3>
                            <p className="text-sm text-blue-700">{currentProject.description}</p>
                          </div>
                          <button
                            onClick={() => {
                              setCurrentProject(null);
                              setCurrentTab('dashboard');
                            }}
                            className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                          >
                            ← Volver al Dashboard
                          </button>
                        </div>
                      </div>
                      <TemplateEditor 
                        template={currentProject.template}
                        onSubmit={handleTemplateSubmit}
                        onBack={() => setCurrentTab('form')}
                        availableVariables={currentProject.availableVariables}
                        onAddVariable={addVariable}
                        onDeleteVariable={deleteVariable}
                        onUpdateVariable={updateVariable}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="result" className="mt-0">
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
                      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-blue-900">{currentProject.name}</h3>
                            <p className="text-sm text-blue-700">{currentProject.description}</p>
                          </div>
                          <button
                            onClick={() => {
                              setCurrentProject(null);
                              setCurrentTab('dashboard');
                            }}
                            className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                          >
                            ← Volver al Dashboard
                          </button>
                        </div>
                      </div>
                      <PromptDisplay 
                        prompt={currentProject.generatedPrompt}
                        onGenerate={generatePrompt}
                        onBack={() => setCurrentTab('template')}
                        onReset={resetProject}
                      />
                    </div>
                  </TabsContent>
                </>
              )}
            </Tabs>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center">
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <FiRotateCcw className="w-4 h-4" />
            <span className="text-sm">Hecho con Next.js y shadcn/ui</span>
          </div>
        </footer>
      </div>
    </div>
  );
}