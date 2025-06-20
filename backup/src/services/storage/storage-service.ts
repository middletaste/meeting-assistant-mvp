import fs from 'fs/promises';
import path from 'path';
import { MeetingContext } from '../llm/types';

interface StoredMeeting extends MeetingContext {
  id: string;
  createdAt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  analysis?: any;
  error?: string;
}

export class StorageService {
  private readonly storagePath: string;

  constructor() {
    this.storagePath = path.join(process.cwd(), 'data', 'meetings.json');
  }

  private async ensureStorageFile(): Promise<void> {
    try {
      await fs.access(this.storagePath);
    } catch {
      // Create directory if it doesn't exist
      await fs.mkdir(path.dirname(this.storagePath), { recursive: true });
      // Create empty storage file
      await fs.writeFile(this.storagePath, JSON.stringify([]));
    }
  }

  private async readStorage(): Promise<StoredMeeting[]> {
    await this.ensureStorageFile();
    const data = await fs.readFile(this.storagePath, 'utf-8');
    return JSON.parse(data);
  }

  private async writeStorage(data: StoredMeeting[]): Promise<void> {
    await fs.writeFile(this.storagePath, JSON.stringify(data, null, 2));
  }

  async storeMeeting(meeting: MeetingContext): Promise<string> {
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
  }

  async getMeeting(id: string): Promise<StoredMeeting | null> {
    const meetings = await this.readStorage();
    return meetings.find(m => m.id === id) || null;
  }

  async updateMeetingStatus(id: string, status: StoredMeeting['status'], analysis?: any, error?: string): Promise<void> {
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
  }

  async listMeetings(): Promise<StoredMeeting[]> {
    return this.readStorage();
  }
} 