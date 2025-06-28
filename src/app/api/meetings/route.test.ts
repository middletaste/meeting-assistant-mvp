import { NextRequest } from 'next/server';
import { POST, GET } from './route';
import { StorageService } from '@/services/storage/storage-service';
import { QueueService } from '@/services/queue/queue-service';
import { FormData as FormDataNode, File } from 'formdata-node';
import { FormDataEncoder } from 'form-data-encoder';

// Mock the services
jest.mock('@/services/storage/storage-service');
jest.mock('@/services/queue/queue-service');

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
});
afterAll(() => {
  (console.log as jest.Mock).mockRestore();
});

describe('Meetings API', () => {
  const mockStorageService = StorageService as jest.MockedClass<typeof StorageService>;
  const mockQueueService = QueueService as jest.MockedClass<typeof QueueService>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/meetings', () => {
    it('should create a new meeting and queue it for analysis', async () => {
      const mockId = 'meeting_123';
      mockStorageService.prototype.storeMeeting.mockResolvedValue(mockId);
      mockQueueService.prototype.addToQueue.mockResolvedValue();

      // Use FormDataNode for multipart/form-data
      const form = new FormDataNode();
      form.append('transcript', 'Test transcript');
      form.append('participants', 'John,Alice');
      form.append('meetingType', 'Test Meeting');
      form.append('duration', '30');
      const encoder = new FormDataEncoder(form);
      const chunks: Uint8Array[] = [];
      for await (const chunk of encoder.encode()) {
        chunks.push(chunk);
      }
      const bodyUint8 = Buffer.concat(chunks);

      const request = new NextRequest('http://localhost:3000/api/meetings', {
        method: 'POST',
        headers: Object.fromEntries(Object.entries(encoder.headers)),
        body: bodyUint8,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe(mockId);
      expect(data.data.status).toBe('pending');
      expect(mockStorageService.prototype.storeMeeting).toHaveBeenCalled();
      expect(mockQueueService.prototype.addToQueue).toHaveBeenCalled();
    });

    it('should return 400 for invalid request data', async () => {
      // Use FormDataNode for multipart/form-data
      const form = new FormDataNode();
      form.append('transcript', ''); // Invalid: empty transcript
      form.append('participants', '');
      form.append('meetingType', '');
      form.append('duration', '-1');
      const encoder = new FormDataEncoder(form);
      const chunks: Uint8Array[] = [];
      for await (const chunk of encoder.encode()) {
        chunks.push(chunk);
      }
      const bodyUint8 = Buffer.concat(chunks);

      const request = new NextRequest('http://localhost:3000/api/meetings', {
        method: 'POST',
        headers: Object.fromEntries(Object.entries(encoder.headers)),
        body: bodyUint8,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('No transcript provided and transcription could not be obtained from audio.');
    });
  });

  describe('GET /api/meetings', () => {
    it('should return list of meetings', async () => {
      const mockMeetings = [
        {
          id: 'meeting_1',
          transcript: 'Test transcript 1',
          participants: ['John'],
          meetingType: 'Test Meeting 1',
          duration: 30,
          status: 'completed' as const,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'meeting_2',
          transcript: 'Test transcript 2',
          participants: ['Alice'],
          meetingType: 'Test Meeting 2',
          duration: 45,
          status: 'pending' as const,
          createdAt: new Date().toISOString(),
        },
      ];

      mockStorageService.prototype.listMeetings.mockResolvedValue(mockMeetings);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockMeetings);
    });
  });

  describe('POST /api/meetings (multipart)', () => {
    it('should accept audio upload and metadata', async () => {
      // Prepare a fake audio file buffer
      const fileBuffer = Buffer.from('fake audio content');
      const file = new File([fileBuffer], 'test-audio.mp3', { type: 'audio/mp3' });

      // Construct form data using formdata-node
      const form = new FormDataNode();
      form.append('audio', file);
      form.append('participants', 'Alice,Bob');
      form.append('meetingType', 'Planning');
      form.append('duration', '30');
      form.append('transcript', 'Test transcript');

      // Encode form data for Node.js request
      const encoder = new FormDataEncoder(form);
      // Collect all chunks from the async generator
      const chunks: Uint8Array[] = [];
      for await (const chunk of encoder.encode()) {
        chunks.push(chunk);
      }
      const bodyUint8 = Buffer.concat(chunks);

      // Pass the correct headers and body to NextRequest
      const request = new NextRequest('http://localhost:3000/api/meetings', {
        method: 'POST',
        headers: Object.fromEntries(Object.entries(encoder.headers)),
        body: bodyUint8,
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.data.status).toBe('pending');
    });

    const supportedFormats = [
      { ext: 'mp3', mime: 'audio/mp3' },
      { ext: 'wav', mime: 'audio/wav' },
      { ext: 'aac', mime: 'audio/aac' },
      { ext: 'flac', mime: 'audio/flac' },
      { ext: 'ogg', mime: 'audio/ogg' },
      { ext: 'aiff', mime: 'audio/aiff' },
      { ext: 'alac', mime: 'audio/alac' },
      { ext: 'm4a', mime: 'audio/m4a' },
    ];

    supportedFormats.forEach(({ ext, mime }) => {
      it(`should accept .${ext} audio file`, async () => {
        const fileBuffer = Buffer.from('fake audio content');
        const file = new File([fileBuffer], `test-audio.${ext}`, { type: mime });
        const form = new FormDataNode();
        form.append('audio', file);
        form.append('participants', 'Alice,Bob');
        form.append('meetingType', 'Planning');
        form.append('duration', '30');
        form.append('transcript', 'Test transcript');
        const encoder = new FormDataEncoder(form);
        const chunks = [];
        for await (const chunk of encoder.encode()) {
          chunks.push(chunk);
        }
        const bodyUint8 = Buffer.concat(chunks);
        const request = new NextRequest('http://localhost:3000/api/meetings', {
          method: 'POST',
          headers: Object.fromEntries(Object.entries(encoder.headers)),
          body: bodyUint8,
        });
        const response = await POST(request);
        expect(response.status).toBe(200);
        const json = await response.json();
        expect(json.success).toBe(true);
        expect(json.data.status).toBe('pending');
      });
    });

    it('should reject unsupported audio file type', async () => {
      const fileBuffer = Buffer.from('fake audio content');
      const file = new File([fileBuffer], 'test-audio.xyz', { type: 'audio/xyz' });
      const form = new FormDataNode();
      form.append('audio', file);
      form.append('participants', 'Alice,Bob');
      form.append('meetingType', 'Planning');
      form.append('duration', '30');
      form.append('transcript', 'Test transcript');
      const encoder = new FormDataEncoder(form);
      const chunks = [];
      for await (const chunk of encoder.encode()) {
        chunks.push(chunk);
      }
      const bodyUint8 = Buffer.concat(chunks);
      const request = new NextRequest('http://localhost:3000/api/meetings', {
        method: 'POST',
        headers: Object.fromEntries(Object.entries(encoder.headers)),
        body: bodyUint8,
      });
      const response = await POST(request);
      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.success).toBe(false);
      expect(json.error).toMatch(/Unsupported audio file type/);
    });
  });
});

export type TranscriptionProvider = 'whisper' | 'elevenlabs' | 'vertexai';

async function transcribeWithVertexAI(audioPath: string): Promise<string> {
  // Upload audio, call Vertex AI API, return transcript
}