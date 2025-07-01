import 'dotenv/config';
import { runLLMWorkflow } from './utility/runLLMWorkflow';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Please enter your prompt: ', (userPrompt) => {
    runLLMWorkflow(userPrompt).catch(console.error).finally(() => rl.close());
});