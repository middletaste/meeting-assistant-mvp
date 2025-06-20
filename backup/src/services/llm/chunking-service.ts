import { LangChainLLMService } from './langchain-service';
import { MeetingContext, MeetingAnalysis } from './types';

// This service splits the meeting transcript into chunks and summarizes each chunk
export class ChunkingService {
  private llmService: LangChainLLMService;

  constructor() {
    this.llmService = new LangChainLLMService();
  }

  // Splits the transcript into chunks (e.g., by speaker)
  private splitTranscript(transcript: string): string[] {
    const chunks = transcript.split('\n').filter(line => line.trim() !== '');
    console.log(`\n📦 Split transcript into ${chunks.length} chunks:`);
    chunks.forEach((chunk, index) => {
      console.log(`\nChunk ${index + 1}:`, chunk.trim());
    });
    return chunks;
  }

  // Summarizes each chunk and combines the results
  async analyzeMeetingWithChunks(context: MeetingContext): Promise<MeetingAnalysis> {
    console.log('\n🔄 Starting chunked analysis...');
    const chunks = this.splitTranscript(context.transcript);
    const chunkSummaries: MeetingAnalysis[] = [];

    // Summarize each chunk
    for (let i = 0; i < chunks.length; i++) {
      console.log(`\n📝 Analyzing chunk ${i + 1}/${chunks.length}...`);
      const chunkContext: MeetingContext = {
        ...context,
        transcript: chunks[i],
      };
      const summary = await this.llmService.analyzeMeeting(chunkContext);
      console.log(`\n✅ Chunk ${i + 1} analysis:`, {
        summary: summary.summary,
        actionItems: summary.actionItems,
        keyDecisions: summary.keyDecisions,
        nextSteps: summary.nextSteps
      });
      chunkSummaries.push(summary);
    }

    // Combine the summaries
    console.log('\n🔄 Combining chunk analyses...');
    const combinedAnalysis: MeetingAnalysis = {
      summary: chunkSummaries.map(s => s.summary).join(' '),
      actionItems: chunkSummaries.flatMap(s => s.actionItems),
      keyDecisions: chunkSummaries.flatMap(s => s.keyDecisions),
      nextSteps: chunkSummaries.flatMap(s => s.nextSteps),
    };

    return combinedAnalysis;
  }
} 