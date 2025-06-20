import { ChunkingService } from '../llm/chunking-service';
import { StorageService } from '../storage/storage-service';
import { MeetingContext } from '../llm/types';

export class QueueService {
  private queue: Array<{ id: string; meeting: MeetingContext }> = [];
  private isProcessing = false;
  private chunkingService: ChunkingService;
  private storageService: StorageService;

  constructor() {
    this.chunkingService = new ChunkingService();
    this.storageService = new StorageService();
  }

  async addToQueue(id: string, meeting: MeetingContext): Promise<void> {
    this.queue.push({ id, meeting });
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const { id, meeting } = this.queue[0];
      
      try {
        // Update status to processing
        await this.storageService.updateMeetingStatus(id, 'processing');

        // Process the meeting
        const analysis = await this.chunkingService.analyzeMeetingWithChunks(meeting);

        // Store the results
        await this.storageService.updateMeetingStatus(id, 'completed', analysis);

        // Remove from queue
        this.queue.shift();
      } catch (error) {
        console.error(`Error processing meeting ${id}:`, error);
        await this.storageService.updateMeetingStatus(
          id,
          'failed',
          undefined,
          error instanceof Error ? error.message : 'Unknown error'
        );
        this.queue.shift();
      }
    }

    this.isProcessing = false;
  }

  getQueueLength(): number {
    return this.queue.length;
  }

  isQueueProcessing(): boolean {
    return this.isProcessing;
  }
} 