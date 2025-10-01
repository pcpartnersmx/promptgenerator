'use client';

import { useState, useEffect } from 'react';
import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { PromptProject } from "@/components/Dashboard"
import ProjectEditor from "@/components/ProjectEditor"
import FormComponent from "@/components/FormComponent"
import TemplateEditor from "@/components/TemplateEditor"
import PromptDisplay from "@/components/PromptDisplay"
import { ProjectCommandPalette } from "@/components/ProjectCommandPalette"
import { useCommandPalette } from "@/hooks/use-command-palette"
import { useProjects } from "@/hooks/use-projects"
import { toast } from 'sonner'
import { SiteHeader } from '@/components/site-header';
import { SectionCards } from '@/components/section-cards';
import { ChartAreaInteractive } from '@/components/chart-area-interactive';
import { DataTable } from '@/components/data-table';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiFolder, FiZap, FiTrash2, FiSettings, FiEdit3, FiFileText, FiArrowLeft } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function Page() {
  const { data: session, status } = useSession();
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [editingProject, setEditingProject] = useState<PromptProject | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [currentProject, setCurrentProject] = useState<PromptProject | null>(null);
  const [currentTab, setCurrentTab] = useState('form');
  
  // Command Palette state
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const { isOpen: commandPaletteIsOpen, onOpenChange: onCommandPaletteOpenChange } = useCommandPalette(
    isCommandPaletteOpen,
    setIsCommandPaletteOpen
  );

  // Use projects hook
  const {
    projects,
    isLoading,
    error,
    createProject: apiCreateProject,
    updateProject: apiUpdateProject,
    deleteProject: apiDeleteProject,
    generatePrompt: apiGeneratePrompt
  } = useProjects();

  // Sync currentProject with projects array when it updates
  useEffect(() => {
    if (currentProject && projects.length > 0) {
      const updatedProject = projects.find(p => p.id === currentProject.id);
      if (updatedProject && updatedProject.generatedPrompt !== currentProject.generatedPrompt) {
        console.log('Sincronizando currentProject con projects array:', updatedProject);
        setCurrentProject(updatedProject);
      }
    }
  }, [projects, currentProject]);

  // Project management functions
  const createProject = async (projectData: Omit<PromptProject, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await apiCreateProject({
        name: projectData.name,
        description: projectData.description,
        tags: projectData.tags,
        availableVariables: projectData.availableVariables
      });
      setIsCreatingProject(false);
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  const updateProject = async (projectData: Omit<PromptProject, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingProject) return;

    try {
      await apiUpdateProject(editingProject.id, projectData);
      setEditingProject(null);
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  const toggleProjectPublic = async (projectId: string, isPublic: boolean) => {
    try {
      await apiUpdateProject(projectId, { isPublic });
      toast.success(`Proyecto ${isPublic ? 'hecho público' : 'hecho privado'} exitosamente`);
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  const deleteProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setProjectToDelete(projectId);
      setShowDeleteDialog(true);
    }
  };

  const confirmDeleteProject = async () => {
    if (projectToDelete) {
      try {
        await apiDeleteProject(projectToDelete);
        setShowDeleteDialog(false);
        setProjectToDelete(null);
      } catch (error) {
        // Error is already handled in the hook
      }
    }
  };

  const cancelDeleteProject = () => {
    setShowDeleteDialog(false);
    setProjectToDelete(null);
  };

  const openProject = (project: PromptProject) => {
    setCurrentProject(project);
    setCurrentTab('form');
  };

  const handleGeneratePrompt = async (formData: { [key: string]: string }) => {
    console.log('handleGeneratePrompt llamado con formData:', formData);
    console.log('currentProject:', currentProject);
    
    if (currentProject && currentProject.template) {
      try {
        console.log('Template actual:', currentProject.template);
        
        // First update the project with form data
        const updatedProject = await apiUpdateProject(currentProject.id, { formData });
        console.log('Proyecto actualizado:', updatedProject);
        setCurrentProject(updatedProject);
        
        // Then generate the prompt using the updated form data
        console.log('Generando prompt con formData:', formData);
        const generatedPrompt = await apiGeneratePrompt(currentProject.id, formData);
        console.log('Prompt generado:', generatedPrompt);
        
        // Navigate to result tab
        setCurrentTab('result');
      } catch (error) {
        console.error('Error en handleGeneratePrompt:', error);
        // Error is already handled in the hook
      }
    }
  };

  const handleTemplateSubmit = async (template: string) => {
    if (currentProject) {
      try {
        const updatedProject = await apiUpdateProject(currentProject.id, { template });
        setCurrentProject(updatedProject);
        setCurrentTab('result');
      } catch (error) {
        // Error is already handled in the hook
      }
    }
  };


  const handleResetForm = async () => {
    if (currentProject) {
      const resetData: { [key: string]: string } = {};
      currentProject.availableVariables.forEach(variable => {
        resetData[variable] = '';
      });
      
      try {
        const updatedProject = await apiUpdateProject(currentProject.id, {
          formData: resetData,
          generatedPrompt: ''
        });
        setCurrentProject(updatedProject);
        setCurrentTab('form');
      } catch (error) {
        // Error is already handled in the hook
      }
    }
  };

  const handleAddVariable = async (variableName: string) => {
    if (currentProject && !currentProject.availableVariables.includes(variableName)) {
      try {
        const updatedProject = await apiUpdateProject(currentProject.id, {
          availableVariables: [...currentProject.availableVariables, variableName],
          formData: { ...currentProject.formData, [variableName]: '' }
        });
        setCurrentProject(updatedProject);
      } catch (error) {
        // Error is already handled in the hook
      }
    }
  };

  const handleDeleteVariable = async (variableName: string) => {
    if (currentProject) {
      try {
        const updatedProject = await apiUpdateProject(currentProject.id, {
          availableVariables: currentProject.availableVariables.filter(v => v !== variableName),
          formData: Object.fromEntries(
            Object.entries(currentProject.formData).filter(([key]) => key !== variableName)
          )
        });
        setCurrentProject(updatedProject);
      } catch (error) {
        // Error is already handled in the hook
      }
    }
  };

  const handleUpdateVariable = async (oldName: string, newName: string) => {
    if (currentProject) {
      try {
        const updatedProject = await apiUpdateProject(currentProject.id, {
          availableVariables: currentProject.availableVariables.map(v => v === oldName ? newName : v),
          formData: Object.fromEntries(
            Object.entries(currentProject.formData).map(([key, value]) => 
              key === oldName ? [newName, value] : [key, value]
            )
          )
        });
        setCurrentProject(updatedProject);
      } catch (error) {
        // Error is already handled in the hook
      }
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar 
          variant="inset" 
          projects={[]} 
          onOpenProject={() => {}}
          user={session?.user}
          onCreateProject={() => {}}
          onOpenCommandPalette={() => {}}
        />
        <SidebarInset>
          <div className="flex flex-1 flex-col items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-sidebar-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Cargando proyectos...</p>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  // Show error state
  if (error) {
    return (
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar 
          variant="inset" 
          projects={[]} 
          onOpenProject={() => {}}
          user={session?.user}
          onCreateProject={() => {}}
          onOpenCommandPalette={() => {}}
        />
        <SidebarInset>
          <div className="flex flex-1 flex-col items-center justify-center">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-sidebar-accent text-sidebar-accent-foreground rounded-lg hover:bg-sidebar-accent/90"
              >
                Reintentar
              </button>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (isCreatingProject) {
    return (
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar 
          variant="inset" 
          projects={projects} 
          onOpenProject={openProject}
          user={session?.user}
          onCreateProject={() => setIsCreatingProject(true)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        />
        <SidebarInset>
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <div className="px-4 lg:px-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    <ProjectEditor
                      onSave={createProject}
                      onCancel={() => setIsCreatingProject(false)}
                    />
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (editingProject) {
    return (
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar 
          variant="inset" 
          projects={projects} 
          onOpenProject={openProject}
          onEditProject={setEditingProject}
          onDeleteProject={deleteProject}
          user={session?.user}
          onCreateProject={() => setIsCreatingProject(true)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        />
        <SidebarInset>
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <div className="px-4 lg:px-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    <ProjectEditor
                      project={editingProject}
                      onSave={updateProject}
                      onCancel={() => setEditingProject(null)}
                      isEditing={true}
                    />
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar 
        variant="inset" 
        projects={projects} 
        onOpenProject={openProject}
        onEditProject={setEditingProject}
        onDeleteProject={deleteProject}
        onTogglePublic={toggleProjectPublic}
        user={session?.user}
        onCreateProject={() => setIsCreatingProject(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />
      <SidebarInset>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2 h-full">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 h-full">
              {currentProject ? (
                // Project View with Modern Design
                <div className="px-4 lg:px-6 h-full flex flex-col">
                  {/* Modern Project Header */}
                  <motion.div 
                    className="mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-sidebar-accent rounded-lg">
                          <FiFolder className="w-5 h-5 text-sidebar-accent-foreground" />
                        </div>
                        <div>
                          <h1 className="text-2xl font-bold text-sidebar-foreground">{currentProject.name}</h1>
                          <p className="text-sm text-muted-foreground">{currentProject.description}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setCurrentProject(null);
                          setCurrentTab('form');
                        }}
                        className="text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
                      >
                        <FiArrowLeft className="w-4 h-4 mr-2" />
                        Volver
                      </Button>
                    </div>
                    
                    {/* Modern Tabs Navigation */}
                    <div className="flex items-center gap-1 p-1 bg-sidebar-accent/50 rounded-lg border border-sidebar-border">
                      <button
                        onClick={() => setCurrentTab('form')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                          currentTab === 'form'
                            ? 'bg-background text-foreground shadow-sm border border-sidebar-border'
                            : 'text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                        }`}
                      >
                        <FiSettings className="w-4 h-4" />
                        <span className="hidden sm:inline">Configuración</span>
                        <span className="sm:hidden">Config</span>
                      </button>
                      <button
                        onClick={() => setCurrentTab('template')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                          currentTab === 'template'
                            ? 'bg-background text-foreground shadow-sm border border-sidebar-border'
                            : 'text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                        }`}
                      >
                        <FiEdit3 className="w-4 h-4" />
                        <span className="hidden sm:inline">Editor</span>
                        <span className="sm:hidden">Edit</span>
                      </button>
                      <button
                        onClick={() => setCurrentTab('result')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                          currentTab === 'result'
                            ? 'bg-background text-foreground shadow-sm border border-sidebar-border'
                            : 'text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                        }`}
                      >
                        <FiFileText className="w-4 h-4" />
                        <span className="hidden sm:inline">Resultado</span>
                        <span className="sm:hidden">Result</span>
                      </button>
                    </div>
                  </motion.div>

                  {/* Tab Contents with Modern Design */}
                  <div className="flex-1 min-h-0">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="h-full"
                      >
                        {currentTab === 'form' && (
                          <div className="h-full bg-background border border-sidebar-border rounded-lg shadow-sm">
                            <div className="p-6 h-full">
                              <FormComponent 
                                availableVariables={currentProject.availableVariables}
                                formData={currentProject.formData}
                                onGeneratePrompt={handleGeneratePrompt}
                              />
                            </div>
                          </div>
                        )}

                        {currentTab === 'template' && (
                          <div className="h-full bg-background border border-sidebar-border rounded-lg shadow-sm">
                            <div className="p-6 h-full">
        <TemplateEditor
          template={currentProject.template}
          onSubmit={handleTemplateSubmit}
          onBack={() => setCurrentTab('form')}
          availableVariables={currentProject.availableVariables}
          onAddVariable={handleAddVariable}
          onDeleteVariable={handleDeleteVariable}
          onUpdateVariable={handleUpdateVariable}
          onTemplateChange={async (template) => {
            try {
              await apiUpdateProject(currentProject.id, { template });
            } catch (error) {
              // Error is already handled in the hook
            }
          }}
          onGeneratePrompt={async () => {
            if (currentProject && currentProject.template && currentProject.formData) {
              try {
                const generatedPrompt = await apiGeneratePrompt(currentProject.id, currentProject.formData);
                // The project is already updated in the hook
                // Update currentProject with the latest data
                const updatedProject = projects.find(p => p.id === currentProject.id);
                if (updatedProject) {
                  setCurrentProject(updatedProject);
                  setCurrentTab('result');
                }
              } catch (error) {
                // Error is already handled in the hook
              }
            }
          }}
        />
                            </div>
                          </div>
                        )}

                        {currentTab === 'result' && (
                          <div className="h-full bg-background border border-sidebar-border rounded-lg shadow-sm">
                            <div className="p-6 h-full">
                              <PromptDisplay
                                prompt={currentProject.generatedPrompt || ''}
                                onGenerate={() => {
                                  if (currentProject.formData) {
                                    handleGeneratePrompt(currentProject.formData);
                                  }
                                }}
                                onBack={() => setCurrentTab('template')}
                                onReset={handleResetForm}
                              />
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              ) : (
                // Dashboard View
                <>
                  {/* Modern Welcome Header */}
                  <motion.div 
                    className="px-4 lg:px-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-sidebar-accent rounded-xl">
                        <FiZap className="w-6 h-6 text-sidebar-accent-foreground" />
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold text-sidebar-foreground">
                          Bienvenido de vuelta
                        </h1>
                        <p className="text-muted-foreground">
                          {session?.user ? `Hola, ${session.user.email}` : 'Cargando...'}
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Modern Main Content */}
                  <div className="flex-1 flex items-center justify-center px-4 lg:px-6">
                    <motion.div 
                      className="text-center max-w-lg"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3, duration: 0.6 }}
                    >
                      <div className="mb-8">
                        <div className="w-24 h-24 bg-sidebar-accent/50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-sidebar-border">
                          <FiFolder className="w-12 h-12 text-sidebar-accent-foreground" />
                        </div>
                        <h2 className="text-2xl font-semibold text-sidebar-foreground mb-3">
                          {projects.length === 0 ? 'No tienes proyectos aún' : 'Selecciona un proyecto'}
                        </h2>
                        <p className="text-muted-foreground text-lg mb-8">
                          {projects.length === 0 
                            ? 'Crea tu primer proyecto para empezar a generar prompts personalizados'
                            : 'Haz clic en un proyecto del sidebar para comenzar a editarlo'
                          }
                        </p>
                      </div>

                      {projects.length === 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5, duration: 0.4 }}
                        >
                          <Button
                            onClick={() => setIsCreatingProject(true)}
                            size="lg"
                            className="bg-sidebar-accent hover:bg-sidebar-accent/90 text-sidebar-accent-foreground px-8 py-4 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                          >
                            <FiPlus className="w-5 h-5 mr-2" />
                            Crear Primer Proyecto
                          </Button>
                        </motion.div>
                      )}

                      {projects.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5, duration: 0.4 }}
                          className="space-y-4"
                        >
                          <div className="bg-sidebar-accent/30 border border-sidebar-border rounded-xl p-4">
                            <p className="text-sm text-muted-foreground mb-3">
                              💡 Consejo: Usa <kbd className="px-2 py-1 bg-sidebar-accent rounded text-xs">Ctrl+Space</kbd> para buscar proyectos rápidamente
                            </p>
                          </div>
                          <Button
                            onClick={() => setIsCreatingProject(true)}
                            variant="outline"
                            size="lg"
                            className="border-sidebar-border hover:bg-sidebar-accent hover:text-sidebar-accent-foreground px-8 py-4 rounded-xl font-medium transition-all duration-200"
                          >
                            <FiPlus className="w-5 h-5 mr-2" />
                            Nuevo Proyecto
                          </Button>
                        </motion.div>
                      )}
                    </motion.div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FiTrash2 className="w-5 h-5 text-red-600" />
              Confirmar eliminación
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar este proyecto? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={cancelDeleteProject}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteProject}
              className="w-full sm:w-auto"
            >
              <FiTrash2 className="w-4 h-4 mr-2" />
              Eliminar proyecto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Command Palette */}
      <ProjectCommandPalette
        projects={projects}
        isOpen={commandPaletteIsOpen}
        onOpenChange={onCommandPaletteOpenChange}
        onOpenProject={openProject}
        onEditProject={setEditingProject}
        onDeleteProject={deleteProject}
        onCreateProject={() => setIsCreatingProject(true)}
        user={session?.user}
      />
    </SidebarProvider>
  )
}
