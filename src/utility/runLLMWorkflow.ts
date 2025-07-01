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
        if (
            result.parameters &&
            typeof result.parameters.to === "string" &&
            typeof result.parameters.subject === "string" &&
            typeof result.parameters.body === "string"
        ) {
            await sendEmail(
                result.parameters.to,
                result.parameters.subject,
                result.parameters.body
            );
            console.log("Email sent.");
        } else {
            console.error("Missing or invalid email parameters:", result.parameters);
        }
        break;
    case "create_event":
    if (
        result.parameters &&
        typeof result.parameters.summary === "string" &&
        typeof result.parameters.start === "string" &&
        typeof result.parameters.end === "string"
    ) {
        const event = {
            summary: result.parameters.summary,
            start: { dateTime: result.parameters.start },
            end: { dateTime: result.parameters.end }
        };
        await createEvent(event);
        console.log("Event created.");
    } else {
        console.error("Missing or invalid event parameters:", result.parameters);
    }
    break;
        default:
            console.log("Unknown action:", result.tool_call.tool);
    }
}