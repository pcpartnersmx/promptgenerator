"use client"

import * as React from "react"
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
  
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { PromptProject } from "@/components/Dashboard"
import { FiPlus, FiFolder, FiEdit2, FiTrash2, FiMoreVertical, FiGlobe, FiLock } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { signOut } from 'next-auth/react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const data = {
  user: {
    name: "Usuario",
    email: "usuario@example.com",
    avatar: "/avatars/default.jpg",
  },
  navMain: [
    {
      title: "Buscar",
      url: "#",
      icon: IconSearch,
    },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: IconCamera,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: IconFileDescription,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: IconFileAi,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
  ],
  documents: [
    {
      name: "Data Library",
      url: "#",
      icon: IconDatabase,
    },
    {
      name: "Reports",
      url: "#",
      icon: IconReport,
    },
    {
      name: "Word Assistant",
      url: "#",
      icon: IconFileWord,
    },
  ],
}

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  projects?: PromptProject[]
  onOpenProject?: (project: PromptProject) => void
  onEditProject?: (project: PromptProject) => void
  onDeleteProject?: (projectId: string) => void
  onTogglePublic?: (projectId: string, isPublic: boolean) => void
  user?: any
  onCreateProject?: () => void
  onOpenCommandPalette?: () => void
}

export function AppSidebar({ projects = [], onOpenProject, onEditProject, onDeleteProject, onTogglePublic, user, onCreateProject, onOpenCommandPalette, ...props }: AppSidebarProps) {
  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: '/login' });
      toast.success('Sesión cerrada exitosamente');
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error('Error al cerrar sesión');
    }
  };

  const userData = user ? {
    name: user.email?.split('@')[0] || 'Usuario',
    email: user.email || 'usuario@example.com',
    avatar: user.avatar_url || '/avatars/default.jpg',
  } : data.user;
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#" className='flex'>
                <img src={'/logo.webp'} className='w-24'/>
                {/* <IconInnerShadowTop className="!size-5" /> */}
                {/* <span className="text-base font-semibold">PcParrners</span> */}
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} onOpenCommandPalette={onOpenCommandPalette} />
        
        {/* Projects Section */}
        <div className="mt-4">
          <div className="flex items-center justify-between px-2 mb-2">
            <h3 className="text-sm font-semibold text-sidebar-foreground">Proyectos</h3>
            <Button
              size="sm"
              variant="ghost"
              onClick={onCreateProject}
              className="h-6 w-6 p-0 hover:bg-sidebar-accent"
            >
              <FiPlus className="h-3 w-3" />
            </Button>
          </div>
          
          <SidebarMenu>
            <AnimatePresence>
              {projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                >
                  <SidebarMenuItem>
                    <div className="flex items-center gap-1 group">
                      <SidebarMenuButton 
                        asChild 
                        onClick={() => onOpenProject?.(project)}
                        className="flex-1 justify-start"
                      >
                        <a href="#" className="flex items-center gap-2 hover:bg-sidebar-accent">
                          {user?.role === 'ADMIN' ? (
                            project.isPublic ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div>
                                    <FiGlobe className="!size-4 text-green-500" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                  <p>Proyecto público</p>
                                </TooltipContent>
                              </Tooltip>
                            ) : (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div>
                                    <FiLock className="!size-4 text-orange-500" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                  <p>Proyecto privado</p>
                                </TooltipContent>
                              </Tooltip>
                            )
                          ) : (
                            <FiFolder className="!size-4 text-blue-500" />
                          )}
                          <span className="truncate" title={project.name}>{project.name}</span>
                        </a>
                      </SidebarMenuButton>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <FiMoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => onOpenProject?.(project)}>
                            <FiFolder className="h-4 w-4 mr-2" />
                            Abrir proyecto
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEditProject?.(project)}>
                            <FiEdit2 className="h-4 w-4 mr-2" />
                            Editar proyecto
                          </DropdownMenuItem>
                          {user?.role === 'ADMIN' && (
                            <DropdownMenuItem 
                              onClick={() => onTogglePublic?.(project.id, !project.isPublic)}
                              className="text-blue-600 focus:text-blue-600 focus:bg-blue-50 dark:focus:bg-blue-900/20"
                            >
                              {project.isPublic ? (
                                <>
                                  <FiLock className="h-4 w-4 mr-2" />
                                  Hacer privado
                                </>
                              ) : (
                                <>
                                  <FiGlobe className="h-4 w-4 mr-2" />
                                  Hacer público
                                </>
                              )}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => onDeleteProject?.(project.id)}
                            className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20"
                          >
                            <FiTrash2 className="h-4 w-4 mr-2" />
                            Eliminar proyecto
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </SidebarMenuItem>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {projects.length === 0 && (
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <div className="text-muted-foreground text-sm px-2 py-1.5">
                    Sin proyectos aún
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </div>
        
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} onLogout={handleLogout} />
      </SidebarFooter>
    </Sidebar>
  )
}
