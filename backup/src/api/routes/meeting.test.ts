import request from 'supertest';
import app from '../app';

describe('Meeting Analysis API', () => {
  const validMeetingData = {
    transcript: 'John: Let\'s discuss the project timeline.\nAlice: We should aim for Q2 completion.\nBob: I agree, but we need more resources.',
    participants: ['John', 'Alice', 'Bob'],
    meetingType: 'Project Planning',
    duration: 30,
  };

  it('should queue a meeting for analysis', async () => {
    const response = await request(app)
      .post('/api/meetings/analyze')
      .send(validMeetingData);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data.status).toBe('pending');
    expect(response.body.data.message).toBe('Meeting analysis queued successfully');
  }, 60000);

  it('should return 400 for invalid request data', async () => {
    const invalidData = {
      transcript: '', // Empty transcript
      participants: [],
      meetingType: '',
      duration: -1,
    };

    const response = await request(app)
      .post('/api/meetings/analyze')
      .send(invalidData);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('Invalid request data');
    expect(response.body.details).toBeDefined();
  });

  it('should get meeting by ID', async () => {
    // First create a meeting
    const createResponse = await request(app)
      .post('/api/meetings/analyze')
      .send(validMeetingData);

    const meetingId = createResponse.body.data.id;

    // Then fetch it
    const getResponse = await request(app)
      .get(`/api/meetings/${meetingId}`);

    expect(getResponse.status).toBe(200);
    expect(getResponse.body.success).toBe(true);
    expect(getResponse.body.data).toMatchObject({
      ...validMeetingData,
      id: meetingId,
      status: 'pending',
    });
  });

  it('should return 404 for non-existent meeting', async () => {
    const response = await request(app)
      .get('/api/meetings/non_existent_id');

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('Meeting not found');
  });

  it('should list all meetings', async () => {
    // Create a meeting first
    await request(app)
      .post('/api/meetings/analyze')
      .send(validMeetingData);

    // Then list all meetings
    const response = await request(app)
      .get('/api/meetings');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
    expect(response.body.data[0]).toHaveProperty('id');
    expect(response.body.data[0]).toHaveProperty('status');
  });
}); 