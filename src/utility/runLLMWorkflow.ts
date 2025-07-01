import { getRecentHistory } from '../workflow/chromeHistory';
import { listUpcomingEvents, createEvent } from '../workflow/googleCalender';
import { sendEmail } from '../workflow/gmail';
import { interpretPrompt } from './LLM';

export async function runLLMWorkflow(userPrompt: string) {
    // Gather context
    const history = await getRecentHistory(5);
    //const events = await listUpcomingEvents(5);
    const context = `
    Recent Chrome History:
    ${history.map(h => `- ${h.title} (${h.url})`).join('\n')}    
    `;
    // Upcoming Calendar Events:
    //${events.map(e => `- ${e.summary} at ${e.start?.dateTime || e.start?.date}`).join('\n')}
    

    // Get LLM decision
    const result = await interpretPrompt(userPrompt, context);  

    // Take action based on LLM output
    switch (result.tool_call.tool) {
        case "summarize_history":
            // Example: summarize history and print/send
            console.log("Summary of history:", context);
            break;
        case "send_email":
            await sendEmail(
                result.parameters.to,
                result.parameters.subject,
                result.parameters.body
            );
            console.log("Email sent.");
            break;
        case "create_event":
            await createEvent(result.parameters);
            console.log("Event created.");
            break;
        default:
            console.log("Unknown action:", result.action);
    }
}