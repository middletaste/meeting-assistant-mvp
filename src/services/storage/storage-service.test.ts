import fs from 'fs/promises';
import path from 'path';
import { StorageService } from './storage-service';
import { MeetingContext } from '../llm/types';

jest.mock('fs/promises');

describe('StorageService', () => {
  let storageService: StorageService;
  const mockStoragePath = path.join(process.cwd(), 'data', 'meetings.json');
  const customStoragePath = '/custom/path/meetings.json';

  beforeEach(() => {
    storageService = new StorageService();
    // Reset mocks
    jest.clearAllMocks();
    // Mock fs.access to simulate file doesn't exist
    (fs.access as jest.Mock).mockRejectedValue(new Error('File not found'));
  });

  const mockMeeting: MeetingContext = {
    transcript: 'Test transcript',
    participants: ['John', 'Alice'],
    meetingType: 'Test Meeting',
    duration: 30,
  };

  describe('constructor', () => {
    it('should use default storage path when none provided', () => {
      const service = new StorageService();
      expect(service).toBeInstanceOf(StorageService);
    });

    it('should use custom storage path when provided', () => {
      const service = new StorageService(customStoragePath);
      expect(service).toBeInstanceOf(StorageService);
    });
  });

  describe('file operations', () => {
    it('should create storage file if it doesn\'t exist', async () => {
      // Mock successful file creation
      (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);
      (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify([]));

      await storageService.storeMeeting(mockMeeting);

      expect(fs.mkdir).toHaveBeenCalledWith(
        path.dirname(mockStoragePath),
        { recursive: true }
      );
      expect(fs.writeFile).toHaveBeenCalledWith(
        mockStoragePath,
        expect.any(String)
      );
    });

    it('should handle file creation errors', async () => {
      const error = new Error('Permission denied');
      (fs.mkdir as jest.Mock).mockRejectedValue(error);

      await expect(storageService.storeMeeting(mockMeeting))
        .rejects
        .toThrow('Failed to create storage file: Permission denied');
    });
  });

  describe('meeting operations', () => {
    beforeEach(() => {
      // Mock existing storage file
      (fs.access as jest.Mock).mockResolvedValue(undefined);
      (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify([]));
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);
    });

    it('should store and retrieve a meeting', async () => {
      const id = await storageService.storeMeeting(mockMeeting);
      
      // Mock the read after storing
      (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify([{
        ...mockMeeting,
        id,
        createdAt: expect.any(String),
        status: 'pending',
      }]));

      const storedMeeting = await storageService.getMeeting(id);

      expect(storedMeeting).toMatchObject({
        ...mockMeeting,
        id,
        status: 'pending',
      });
      expect(storedMeeting?.createdAt).toBeDefined();
    });

    it('should handle read errors', async () => {
      const error = new Error('Read error');
      (fs.readFile as jest.Mock).mockRejectedValue(error);

      await expect(storageService.getMeeting('some-id'))
        .rejects
        .toThrow('Failed to read storage: Read error');
    });

    it('should handle write errors', async () => {
      const error = new Error('Write error');
      (fs.writeFile as jest.Mock).mockRejectedValue(error);

      await expect(storageService.storeMeeting(mockMeeting))
        .rejects
        .toThrow('Failed to write storage: Write error');
    });

    it('should update meeting status', async () => {
      const mockId = 'meeting_123';
      const mockStoredMeeting = {
        ...mockMeeting,
        id: mockId,
        createdAt: new Date().toISOString(),
        status: 'pending' as const,
      };
      (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify([mockStoredMeeting]));

      await storageService.updateMeetingStatus(mockId, 'completed', { summary: 'Test analysis' });

      // Get the data written to the file
      const writtenData = (fs.writeFile as jest.Mock).mock.calls[0][1];
      const meetings = JSON.parse(writtenData);
      expect(meetings.some((m: any) => m.id === mockId && m.status === 'completed')).toBe(true);
    });

    it('should handle non-existent meeting updates', async () => {
      (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify([]));

      await expect(storageService.updateMeetingStatus('non-existent', 'completed'))
        .rejects
        .toThrow('Meeting non-existent not found');
    });

    it('should list all meetings', async () => {
      const mockMeetings = [
        { ...mockMeeting, id: 'meeting_1', createdAt: new Date().toISOString(), status: 'completed' },
        { ...mockMeeting, id: 'meeting_2', createdAt: new Date().toISOString(), status: 'pending' },
      ];
      (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(mockMeetings));

      const meetings = await storageService.listMeetings();

      expect(meetings).toHaveLength(2);
      expect(meetings[0].id).toBe('meeting_1');
      expect(meetings[1].id).toBe('meeting_2');
    });

    it('should handle list errors', async () => {
      const error = new Error('List error');
      (fs.readFile as jest.Mock).mockRejectedValue(error);

      await expect(storageService.listMeetings())
        .rejects
        .toThrow('Failed to read storage: List error');
    });
  });
}); 