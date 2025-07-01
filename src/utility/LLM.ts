import { OpenAI } from 'openai';
import Ajv from "ajv";
import schema from "./mcpAction.schema.json"; 

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

const ajv = new Ajv();

export async function interpretPrompt(prompt: string, context: string): Promise<any> {
    const systemPrompt = `
You are an assistant that can take actions using Chrome History, Gmail, and Google Calendar APIs.
Given the user's prompt and context, output a JSON object with this structure:
{
  "tool_call": {
    "tool": "summarize_history" | "send_email" | "list_events" | "create_event",
    "args": { ...parameters for the tool... }
  }
}
Only output the JSON object, nothing else.
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

const content = completion.choices[0].message.content || '';
let parsed;
try {
    parsed = JSON.parse(content);
} catch (e) {
    throw new Error("LLM output is not valid JSON");
}

const validate = ajv.compile(schema);
if (!validate(parsed)) {
    throw new Error("LLM output does not match MCP schema: " + JSON.stringify(validate.errors));
}

return parsed;
}