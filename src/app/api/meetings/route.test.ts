import { NextRequest } from 'next/server';
import { POST, GET } from './route';
import { StorageService } from '@/services/storage/storage-service';
import { QueueService } from '@/services/queue/queue-service';
import { createMocks } from 'node-mocks-http';
import fs from 'fs';
import path from 'path';

// Mock the services
jest.mock('@/services/storage/storage-service');
jest.mock('@/services/queue/queue-service');

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

      const request = new NextRequest('http://localhost:3000/api/meetings', {
        method: 'POST',
        body: JSON.stringify({
          transcript: 'Test transcript',
          participants: ['John', 'Alice'],
          meetingType: 'Test Meeting',
          duration: 30,
        }),
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
      const request = new NextRequest('http://localhost:3000/api/meetings', {
        method: 'POST',
        body: JSON.stringify({
          transcript: '', // Invalid: empty transcript
          participants: [],
          meetingType: '',
          duration: -1,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid request data');
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
      // Prepare a fake audio file
      const audioPath = path.join(__dirname, 'test-audio.mp3');
      fs.writeFileSync(audioPath, 'fake audio content');
      const formData = new FormData();
      formData.append('audio', new File([fs.readFileSync(audioPath)], 'test-audio.mp3', { type: 'audio/mp3' }));
      formData.append('participants', 'Alice,Bob');
      formData.append('meetingType', 'Planning');
      formData.append('duration', '30');
      formData.append('transcript', 'Test transcript');

      // Create a mock request/response
      const { req, res } = createMocks({
        method: 'POST',
        body: formData,
      });

      // Call the handler
      const response = await POST(req);
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.data.status).toBe('pending');
      fs.unlinkSync(audioPath);
    });
  });
}); 