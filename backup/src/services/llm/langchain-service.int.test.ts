import { LangChainLLMService } from './langchain-service';
import { MeetingContext } from './types';

describe('LangChainLLMService (integration)', () => {
  let service: LangChainLLMService;

  beforeEach(() => {
    console.log('\n=== Starting LLM Service Integration Test ===');
    service = new LangChainLLMService();
  });

  it('should analyze a meeting transcript using the real Vertex AI API', async () => {
    console.log('\n📝 Test Input:');
    const mockContext: MeetingContext = {
      transcript: 'John: Let\'s discuss the Q1 roadmap. Alice: I think we should focus on user authentication first. Bob: Agreed, and we need to improve the mobile experience.',
      participants: ['John', 'Alice', 'Bob'],
      meetingType: 'Planning',
      duration: 30,
    };
    console.log('Meeting Type:', mockContext.meetingType);
    console.log('Participants:', mockContext.participants.join(', '));
    console.log('Duration:', mockContext.duration, 'minutes');
    console.log('\nTranscript:', mockContext.transcript);

    console.log('\n🔄 Processing: Analyzing meeting...');
    const analysis = await service.analyzeMeeting(mockContext);

    console.log('\n✅ Analysis Results:');
    console.log('\n📋 Summary:', analysis.summary);
    console.log('\n📌 Action Items:', analysis.actionItems);
    console.log('\n🎯 Key Decisions:', analysis.keyDecisions);
    console.log('\n➡️ Next Steps:', analysis.nextSteps);

    // Assertions
    expect(analysis).toHaveProperty('summary');
    expect(analysis).toHaveProperty('actionItems');
    expect(analysis).toHaveProperty('keyDecisions');
    expect(analysis).toHaveProperty('nextSteps');

    expect(Array.isArray(analysis.actionItems)).toBe(true);
    expect(Array.isArray(analysis.keyDecisions)).toBe(true);
    expect(Array.isArray(analysis.nextSteps)).toBe(true);
    expect(typeof analysis.summary).toBe('string');

    console.log('\n✅ All assertions passed!');
  }, 60000); // 60s timeout for real API call
});
