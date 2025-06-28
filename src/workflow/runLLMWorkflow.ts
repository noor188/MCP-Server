import { getRecentHistory } from './chromeHistory';
import { listUpcomingEvents, createEvent } from './googleCalender';
import { sendEmail } from './gmail';
import { interpretPrompt } from '../utility/LLM';

export async function runLLMWorkflow(userPrompt: string) {
    // Gather context
    const history = await getRecentHistory(5);
    const events = await listUpcomingEvents(5);
    const context = `
    Recent Chrome History:
    ${history.map(h => `- ${h.title} (${h.url})`).join('\n')}
    Upcoming Calendar Events:
    ${events.map(e => `- ${e.summary} at ${e.start?.dateTime || e.start?.date}`).join('\n')}
    `;

    // Get LLM decision
    const llmResponse = await interpretPrompt(userPrompt, context);
    let actionObj;
    try {
        actionObj = JSON.parse(llmResponse);
    } catch (e) {
        throw new Error('LLM response could not be parsed as JSON: ' + llmResponse);
    }

    // Take action based on LLM output
    switch (actionObj.action) {
        case "summarize_history":
            // Example: summarize history and print/send
            console.log("Summary of history:", context);
            break;
        case "send_email":
            await sendEmail(
                actionObj.parameters.to,
                actionObj.parameters.subject,
                actionObj.parameters.body
            );
            console.log("Email sent.");
            break;
        case "list_events":
            console.log("Upcoming events:", events);
            break;
        case "create_event":
            await createEvent(actionObj.parameters);
            console.log("Event created.");
            break;
        default:
            console.log("Unknown action:", actionObj.action);
    }
}