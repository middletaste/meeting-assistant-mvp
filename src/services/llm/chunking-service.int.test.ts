import { ChunkingService } from './chunking-service';
import { MeetingContext } from './types';

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
});
afterAll(() => {
  (console.log as jest.Mock).mockRestore();
});

describe('ChunkingService (integration)', () => {
  let service: ChunkingService;

  beforeEach(() => {
    console.log('\n=== Starting Chunking Service Integration Test ===');
    service = new ChunkingService();
  });

  it('should analyze a meeting transcript with chunks using the LLM service', async () => {
    console.log('\n📝 Test Input:');
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
    console.log('Meeting Type:', mockContext.meetingType);
    console.log('Participants:', mockContext.participants.join(', '));
    console.log('Duration:', mockContext.duration, 'minutes');
    console.log('\nTranscript:', mockContext.transcript);

    console.log('\n🔄 Processing: Analyzing meeting with chunks...');
    const analysis = await service.analyzeMeetingWithChunks(mockContext);

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
  }, 120000); // 2 min timeout for real API call
});
