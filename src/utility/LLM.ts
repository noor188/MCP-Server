import { OpenAI } from 'openai';
import fs from 'fs';
import path from 'path';
import Ajv from "ajv";
import schema from "./mcpAction.schema.json"; 

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

const ajv = new Ajv();

export async function interpretPrompt(prompt: string, context: string): Promise<any> {
    const systemPrompt = fs.readFileSync(path.join(__dirname, '../prompts/systemPrompt.txt'), 'utf-8');
    const userPromptTemplate = fs.readFileSync(path.join(__dirname, '../prompts/userPrompt.txt'), 'utf-8');
    const userPrompt = userPromptTemplate
        .replace('{{prompt}}', prompt)
        .replace('{{context}}', context);

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