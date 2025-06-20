import { LangChainLLMService } from './langchain-service';
import { MeetingContext } from './types';
import { VertexAI } from '@google-cloud/vertexai';

// Mock VertexAI
jest.mock('@google-cloud/vertexai');

describe('LangChainLLMService', () => {
  let service: LangChainLLMService;
  let mockVertexAI: jest.Mocked<VertexAI>;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Create mock implementation
    mockVertexAI = {
      preview: {
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockResolvedValue({
            response: {
              candidates: [{
                content: {
                  parts: [{
                    text: JSON.stringify({
                      summary: 'Test summary',
                      actionItems: ['Test action item'],
                      keyDecisions: ['Test decision'],
                      nextSteps: ['Test next step']
                    })
                  }]
                }
              }]
            }
          })
        })
      }
    } as any;

    // Create service with mock
    service = new LangChainLLMService();
    (service as any).model = mockVertexAI;
  });

  it('should analyze a meeting transcript', async () => {
    const mockContext: MeetingContext = {
      transcript: 'John: Let\'s discuss the Q1 roadmap. Alice: I think we should focus on user authentication first. Bob: Agreed, and we need to improve the mobile experience.',
      participants: ['John', 'Alice', 'Bob'],
      meetingType: 'Planning',
      duration: 30,
    };

    const analysis = await service.analyzeMeeting(mockContext);

    expect(analysis).toHaveProperty('summary');
    expect(analysis).toHaveProperty('actionItems');
    expect(analysis).toHaveProperty('keyDecisions');
    expect(analysis).toHaveProperty('nextSteps');

    expect(Array.isArray(analysis.actionItems)).toBe(true);
    expect(Array.isArray(analysis.keyDecisions)).toBe(true);
    expect(Array.isArray(analysis.nextSteps)).toBe(true);
  }, 30000); // Increase timeout to 30 seconds
}); 