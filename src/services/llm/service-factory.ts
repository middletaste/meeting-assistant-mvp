import { LLMService } from './types';
import { LangChainLLMService } from './langchain-service';
import { MockLangChainLLMService } from './mock-langchain-service';

export class LLMServiceFactory {
  static createService(): LLMService {
    // Use mock service in CI environment or when explicitly requested
    const useMock = process.env.CI === 'true' || 
                   process.env.USE_MOCK_LLM === 'true' ||
                   !process.env.GOOGLE_CLOUD_PROJECT_ID;
    
    if (useMock) {
      console.log('Using Mock LLM Service (CI environment or no credentials)');
      return new MockLangChainLLMService();
    }
    
    console.log('Using Real LLM Service (Google Vertex AI)');
    return new LangChainLLMService();
  }
} 