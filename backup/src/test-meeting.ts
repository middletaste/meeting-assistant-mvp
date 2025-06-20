import { LangChainLLMService } from './services/llm/langchain-service';

async function testMeetingAnalysis() {
  try {
    const service = new LangChainLLMService();
    
    const mockMeeting = {
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
      duration: 30
    };

    console.log('Analyzing meeting...');
    const analysis = await service.analyzeMeeting(mockMeeting);
    
    console.log('\nMeeting Analysis Results:');
    console.log('------------------------');
    console.log('Summary:', analysis.summary);
    console.log('\nAction Items:', analysis.actionItems);
    console.log('\nKey Decisions:', analysis.keyDecisions);
    console.log('\nNext Steps:', analysis.nextSteps);
  } catch (error) {
    console.error('Error during meeting analysis:', error);
  }
}

testMeetingAnalysis(); 