export default interface MCPAction {
    tool_call: {
        tool: "summarize_history" | "send_email" | "create_event";
    };
    parameters?: {
        // For send_email
        to?: string;
        subject?: string;
        body?: string;
        // For create_event
        [key: string]: any;
    };
    // Add other properties as needed
}