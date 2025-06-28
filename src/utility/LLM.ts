import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function interpretPrompt(prompt: string, context: string): Promise<string> {
    const systemPrompt = `
You are an assistant that can take actions using Chrome History, Gmail, and Google Calendar APIs.
Given the user's prompt and context, output a JSON object with:
- "action": one of "summarize_history", "send_email", "list_events", "create_event"
- "parameters": object with relevant parameters for the action

Only output the JSON.
`;

const userPrompt = `
    User prompt: ${prompt}
    Context: ${context}
    `;

const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
    ],
    max_tokens: 300,
});

    return completion.choices[0].message.content || '';
}