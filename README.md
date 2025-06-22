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

## Environment Setup

Create a `.env` file in the root directory with the following variables:

```bash
# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1

# Google Cloud Authentication
# Option 1: Service Account Key (recommended for production)
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json

# Option 2: Application Default Credentials (for local development)
# Run: gcloud auth application-default login

# LLM Configuration
TEMPERATURE=0.7

# Testing Configuration
# Set to 'true' to use mock services instead of real API calls
USE_MOCK_LLM=false
```

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and add your Google Cloud credentials:
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
      mock-langchain-service.ts # Mock service for testing
      service-factory.ts # Factory to choose between real/mock services
      langchain-service.test.ts # Tests
```

## Architecture

The MVP is built with scalability in mind:

- Core LLM logic is separated into its own service
- Type-safe interfaces using TypeScript and Zod
- Testable units with Jest
- Environment-based configuration
- Modular design for easy extension
- Mock services for CI/CD testing

## Development

- `npm run dev` - Start development server
- `npm test` - Run unit tests (excludes integration tests)
- `npm run test:integration` - Run integration tests with real API
- `npm run test:all` - Run all tests
- `npm run build` - Build for production

## Testing Strategy

- **Unit Tests**: Test individual components in isolation
- **Integration Tests**: Test real API integration (only run locally with credentials)
- **CI/CD**: Uses mock services to avoid API costs and credential exposure

## Next Steps

1. Add API endpoints for meeting analysis
2. Implement meeting transcript storage
3. Add user authentication
4. Create a web interface
5. Add real-time meeting analysis 