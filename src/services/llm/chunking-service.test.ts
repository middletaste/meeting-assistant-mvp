import { ChunkingService } from './chunking-service';
import { MeetingContext, MeetingAnalysis } from './types';
import { LangChainLLMService } from './langchain-service';

// Mock the LLM service
jest.mock('./langchain-service');

describe('ChunkingService', () => {
  let service: ChunkingService;
  let mockLLMService: jest.Mocked<LangChainLLMService>;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Create a mock implementation of analyzeMeeting
    mockLLMService = {
      analyzeMeeting: jest.fn().mockResolvedValue({
        summary: 'Test summary',
        actionItems: ['Test action item'],
        keyDecisions: ['Test decision'],
        nextSteps: ['Test next step']
      })
    } as any;

    // Create the service with the mock
    service = new ChunkingService();
    (service as any).llmService = mockLLMService;
  });

  it('should analyze a meeting transcript with chunks', async () => {
    const mockContext: MeetingContext = {
      transcript: `
        John: Welcome everyone to our Q1 planning meeting. Let's discuss our priorities.
        Alice: I think we should focus on improving the user authentication system first.
        Bob: Agreed, and we need to address the mobile app performance issues.
        John: Good points. Let's set these as our top priorities.
        Alice: I can lead the authentication improvements.
        Bob: I'll handle the mobile optimization.
      `,
      participants: ['John', 'Alice', 'Bob'],
      meetingType: 'Planning',
      duration: 30,
    };

    const analysis = await service.analyzeMeetingWithChunks(mockContext);

    // Verify the structure of the response
    expect(analysis).toHaveProperty('summary');
    expect(analysis).toHaveProperty('actionItems');
    expect(analysis).toHaveProperty('keyDecisions');
    expect(analysis).toHaveProperty('nextSteps');

    // Verify the arrays
    expect(Array.isArray(analysis.actionItems)).toBe(true);
    expect(Array.isArray(analysis.keyDecisions)).toBe(true);
    expect(Array.isArray(analysis.nextSteps)).toBe(true);

    // Verify that analyzeMeeting was called for each chunk
    expect(mockLLMService.analyzeMeeting).toHaveBeenCalled();
  }, 30000); // Increase timeout to 30 seconds
}); 