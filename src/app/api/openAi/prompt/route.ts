import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
    try {
        const { input } = await request.json();

        if (!input) {
            return new Response(JSON.stringify({ error: "No se proporcionó input" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const stream = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "user",
                    content: input,
                },
            ],
            max_tokens: 1000,
            temperature: 0.7,
            stream: true,
        });

        const encoder = new TextEncoder();
        const readable = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of stream) {
                        const content = chunk.choices[0]?.delta?.content;
                        if (content) {
                            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                        }
                    }
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
                    controller.close();
                } catch (error) {
                    console.error("Error en streaming:", error);
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "Error en streaming" })}\n\n`));
                    controller.close();
                }
            },
        });

        return new Response(readable, {
            status: 200,
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            },
        });
    } catch (error) {
        console.error("Error en API de OpenAI:", error);
        return new Response(
            JSON.stringify({ error: "Error interno del servidor" }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
}