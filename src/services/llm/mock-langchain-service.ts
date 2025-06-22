import { LLMService, MeetingContext, MeetingAnalysis } from './types';

// Mock LLM service for CI/CD testing
export class MockLangChainLLMService implements LLMService {
  async analyzeMeeting(context: MeetingContext): Promise<MeetingAnalysis> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Return mock analysis based on meeting type
    const mockAnalysis: MeetingAnalysis = {
      summary: `This was a ${context.meetingType.toLowerCase()} meeting with ${context.participants.length} participants lasting ${context.duration} minutes. The discussion covered key topics and resulted in actionable outcomes.`,
      actionItems: [
        `Follow up on ${context.meetingType.toLowerCase()} decisions`,
        `Schedule next ${context.meetingType.toLowerCase()} meeting`,
        `Document key points from this session`
      ],
      keyDecisions: [
        `Proceed with ${context.meetingType.toLowerCase()} plan`,
        `Allocate resources for implementation`,
        `Set timeline for next review`
      ],
      nextSteps: [
        `Review action items from this meeting`,
        `Prepare for next ${context.meetingType.toLowerCase()} session`,
        `Update project documentation`
      ]
    };

    return mockAnalysis;
  }
} 