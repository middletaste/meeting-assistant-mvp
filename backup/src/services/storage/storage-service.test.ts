import fs from 'fs/promises';
import path from 'path';
import { StorageService } from './storage-service';
import { MeetingContext } from '../llm/types';

jest.mock('fs/promises');

describe('StorageService', () => {
  let storageService: StorageService;
  const mockStoragePath = path.join(process.cwd(), 'data', 'meetings.json');

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

  it('should create storage file if it doesn\'t exist', async () => {
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

  it('should store and retrieve a meeting', async () => {
    // Mock existing storage file
    (fs.access as jest.Mock).mockResolvedValue(undefined);
    (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify([]));

    const id = await storageService.storeMeeting(mockMeeting);
    const storedMeeting = await storageService.getMeeting(id);

    expect(storedMeeting).toMatchObject({
      ...mockMeeting,
      id,
      status: 'pending',
    });
    expect(storedMeeting?.createdAt).toBeDefined();
  });

  it('should update meeting status', async () => {
    // Mock existing storage file with one meeting
    const mockId = 'meeting_123';
    const mockStoredMeeting = {
      ...mockMeeting,
      id: mockId,
      createdAt: new Date().toISOString(),
      status: 'pending' as const,
    };
    (fs.access as jest.Mock).mockResolvedValue(undefined);
    (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify([mockStoredMeeting]));

    await storageService.updateMeetingStatus(mockId, 'completed', { summary: 'Test analysis' });

    expect(fs.writeFile).toHaveBeenCalledWith(
      mockStoragePath,
      expect.stringContaining('"status":"completed"')
    );
  });

  it('should list all meetings', async () => {
    // Mock existing storage file with multiple meetings
    const mockMeetings = [
      { ...mockMeeting, id: 'meeting_1', createdAt: new Date().toISOString(), status: 'completed' },
      { ...mockMeeting, id: 'meeting_2', createdAt: new Date().toISOString(), status: 'pending' },
    ];
    (fs.access as jest.Mock).mockResolvedValue(undefined);
    (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(mockMeetings));

    const meetings = await storageService.listMeetings();

    expect(meetings).toHaveLength(2);
    expect(meetings[0].id).toBe('meeting_1');
    expect(meetings[1].id).toBe('meeting_2');
  });
}); 