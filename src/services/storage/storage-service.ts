import fs from 'fs/promises';
import path from 'path';
import { MeetingContext, MeetingAnalysis } from '../llm/types';

interface StoredMeeting extends MeetingContext {
  id: string;
  createdAt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  analysis?: MeetingAnalysis;
  error?: string;
}

export class StorageService {
  private readonly storagePath: string;

  constructor(storagePath?: string) {
    this.storagePath = storagePath || path.join(process.cwd(), 'data', 'meetings.json');
  }

  private async ensureStorageFile(): Promise<void> {
    try {
      await fs.access(this.storagePath);
    } catch {
      try {
        // Create directory if it doesn't exist
        await fs.mkdir(path.dirname(this.storagePath), { recursive: true });
        // Create empty storage file
        await fs.writeFile(this.storagePath, JSON.stringify([]));
      } catch (error) {
        throw new Error(`Failed to create storage file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  private async readStorage(): Promise<StoredMeeting[]> {
    try {
      await this.ensureStorageFile();
      const data = await fs.readFile(this.storagePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      throw new Error(`Failed to read storage: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async writeStorage(data: StoredMeeting[]): Promise<void> {
    try {
      await fs.writeFile(this.storagePath, JSON.stringify(data, null, 2));
    } catch (error) {
      throw new Error(`Failed to write storage: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async storeMeeting(meeting: MeetingContext): Promise<string> {
    try {
      const meetings = await this.readStorage();
      const id = `meeting_${Date.now()}`;
      
      const storedMeeting: StoredMeeting = {
        ...meeting,
        id,
        createdAt: new Date().toISOString(),
        status: 'pending',
      };

      meetings.push(storedMeeting);
      await this.writeStorage(meetings);
      return id;
    } catch (error) {
      throw new Error(`Failed to store meeting: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getMeeting(id: string): Promise<StoredMeeting | null> {
    try {
      const meetings = await this.readStorage();
      return meetings.find(m => m.id === id) || null;
    } catch (error) {
      throw new Error(`Failed to get meeting: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateMeetingStatus(id: string, status: StoredMeeting['status'], analysis?: MeetingAnalysis, error?: string): Promise<void> {
    try {
      const meetings = await this.readStorage();
      const index = meetings.findIndex(m => m.id === id);
      
      if (index === -1) {
        throw new Error(`Meeting ${id} not found`);
      }

      meetings[index] = {
        ...meetings[index],
        status,
        ...(analysis && { analysis }),
        ...(error && { error }),
      };

      await this.writeStorage(meetings);
    } catch (error) {
      throw new Error(`Failed to update meeting status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async listMeetings(): Promise<StoredMeeting[]> {
    try {
      return await this.readStorage();
    } catch (error) {
      throw new Error(`Failed to list meetings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
} 