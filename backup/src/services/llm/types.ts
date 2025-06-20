import { z } from 'zod';

export const MeetingContextSchema = z.object({
  transcript: z.string(),
  participants: z.array(z.string()),
  meetingType: z.string(),
  duration: z.number(),
});

export type MeetingContext = z.infer<typeof MeetingContextSchema>;

export interface MeetingAnalysis {
  summary: string;
  actionItems: string[];
  keyDecisions: string[];
  nextSteps: string[];
}

export interface LLMService {
  analyzeMeeting(context: MeetingContext): Promise<MeetingAnalysis>;
} 