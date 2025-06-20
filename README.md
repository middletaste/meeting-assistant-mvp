# meeting-assistant-mvp
A LLM assistant that answers question about your meeting recordings

# Meeting Assistant MVP

An LLM-powered meeting assistant that analyzes meeting transcripts and provides structured insights.

## Features

- Meeting transcript analysis
- Action item extraction
- Key decision identification
- Next steps generation
- Scalable architecture with LangChain

## Tech Stack

- Node.js with TypeScript
- LangChain for LLM integration
- OpenAI GPT-4
- Jest for testing
- Zod for runtime type validation

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and add your OpenAI API key:
   ```bash
   cp .env.example .env
   ```
4. Run tests:
   ```bash
   npm test
   ```
5. Start development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
src/
  services/
    llm/
      types.ts           # Type definitions
      langchain-service.ts # LLM service implementation
      langchain-service.test.ts # Tests
```

## Architecture

The MVP is built with scalability in mind:

- Core LLM logic is separated into its own service
- Type-safe interfaces using TypeScript and Zod
- Testable units with Jest
- Environment-based configuration
- Modular design for easy extension

## Development

- `npm run dev` - Start development server
- `npm test` - Run tests
- `npm run build` - Build for production

## Next Steps

1. Add API endpoints for meeting analysis
2. Implement meeting transcript storage
3. Add user authentication
4. Create a web interface
5. Add real-time meeting analysis 