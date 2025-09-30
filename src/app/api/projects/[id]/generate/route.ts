import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/projects/[id]/generate - Generar prompt para un proyecto
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { formData } = body;

    // Verificar que el proyecto existe y pertenece al usuario
    const project = await prisma.project.findFirst({
      where: {
        id: id,
        userId: session.user.id
      }
    });

    if (!project) {
      return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 });
    }

    if (!project.template) {
      return NextResponse.json({ error: 'Template no encontrado' }, { status: 400 });
    }

    // Generar el prompt reemplazando las variables
    let generatedPrompt = project.template;
    
    console.log('Template:', project.template);
    console.log('FormData recibido:', formData);
    
    if (formData && typeof formData === 'object') {
      Object.entries(formData).forEach(([key, value]) => {
        console.log(`Reemplazando {${key}} con:`, value);
        const regex = new RegExp(`{${key}}`, 'g');
        generatedPrompt = generatedPrompt.replace(regex, String(value));
      });
    }
    
    console.log('Prompt generado:', generatedPrompt);

    // Actualizar el proyecto con el prompt generado y los datos del formulario
    const updatedProject = await prisma.project.update({
      where: {
        id: id
      },
      data: {
        formData: formData || {},
        generatedPrompt
      }
    });

    return NextResponse.json({
      project: updatedProject,
      generatedPrompt
    });
  } catch (error) {
    console.error('Error generating prompt:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
