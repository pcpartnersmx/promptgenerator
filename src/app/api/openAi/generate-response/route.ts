import OpenAI from "openai";
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { prompt } = await request.json();

        if (!prompt) {
            return NextResponse.json({ error: "No se proporcionó el prompt" }, {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            max_tokens: 2000,
            temperature: 0.7,
        });

        const aiResponse = completion.choices[0]?.message?.content || 'No se pudo generar una respuesta';

        return NextResponse.json({ 
            aiResponse 
        }, {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error en API de OpenAI:", error);
        return NextResponse.json(
            { error: "Error interno del servidor" },
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
}
