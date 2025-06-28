import { LLMService } from './types';
import { MeetingContext, MeetingAnalysis } from './types';
import { LLMServiceFactory } from './service-factory';

// This service splits the meeting transcript into chunks and summarizes each chunk
export class ChunkingService {
  private llmService: LLMService;

  constructor() {
    this.llmService = LLMServiceFactory.createService();
  }

  // Splits the transcript into meaningful chunks
  private splitTranscript(transcript: string): string[] {
    // Split by double line breaks first (speaker changes or paragraphs)
    const chunks = transcript.split(/\n\s*\n/).filter(chunk => chunk.trim() !== '');
    
    // If we have too many small chunks, combine them into larger chunks
    const targetChunkSize = 1000; // characters per chunk
    const combinedChunks: string[] = [];
    let currentChunk = '';
    
    for (const chunk of chunks) {
      if (currentChunk.length + chunk.length > targetChunkSize && currentChunk.length > 0) {
        combinedChunks.push(currentChunk.trim());
        currentChunk = chunk;
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + chunk;
      }
    }
    
    if (currentChunk.trim()) {
      combinedChunks.push(currentChunk.trim());
    }
    
    console.log(`\n📦 Split transcript into ${combinedChunks.length} meaningful chunks:`);
    combinedChunks.forEach((chunk, index) => {
      console.log(`\nChunk ${index + 1} (${chunk.length} chars):`, chunk.substring(0, 100) + '...');
    });
    
    return combinedChunks;
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
    
    // Helper function to deduplicate arrays
    const deduplicateArray = (arr: string[]): string[] => {
      const seen = new Set<string>();
      return arr.filter(item => {
        const normalized = item.toLowerCase().trim();
        if (seen.has(normalized)) return false;
        seen.add(normalized);
        return true;
      });
    };
    
    const combinedAnalysis: MeetingAnalysis = {
      summary: chunkSummaries.map(s => s.summary).join(' '),
      actionItems: deduplicateArray(chunkSummaries.flatMap(s => s.actionItems)),
      keyDecisions: deduplicateArray(chunkSummaries.flatMap(s => s.keyDecisions)),
      nextSteps: deduplicateArray(chunkSummaries.flatMap(s => s.nextSteps)),
    };

    return combinedAnalysis;
  }
} 