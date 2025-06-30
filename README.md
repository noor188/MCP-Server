# MCP Server

An implementation of a MCP server to automate an end-to-end workflow using 3 tools, Google calender, Gmail, and chrome history

## Features

- **AI action Generation**: Uses OpenAI to generate actions 
- **Chrome database access**: Real-time sqlit3 databse retrieval 
- **Google API**: access Google services using APIs
- **Action Functionality**: executes the workflow

## Environment Variables

Create a `.env` file in the `MCP-SERVER-PROJECT` directory with the following variables:

```env
# Openai API Key for AI responses
OPENAI_API_KEY=your_openai_api_key_here

```

## Installation

1. Set up environment variables (see above)

2. Run the server:
```bash
npm start
```
## Demo

<a href="https://youtu.be/b6MmNZaWYYs"> YouTube link </a>

## Future

1. Integrate more workflows
