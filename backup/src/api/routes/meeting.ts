import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { StorageService } from '../../services/storage/storage-service';
import { QueueService } from '../../services/queue/queue-service';
import { MeetingContext } from '../../services/llm/types';

const router = Router();
const storageService = new StorageService();
const queueService = new QueueService();

// Validation schema for meeting analysis request
const MeetingAnalysisRequestSchema = z.object({
  transcript: z.string().min(1),
  participants: z.array(z.string()),
  meetingType: z.string(),
  duration: z.number().positive(),
});

// POST /api/meetings/analyze
router.post('/analyze', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = MeetingAnalysisRequestSchema.parse(req.body);
    
    // Create meeting context
    const meetingContext: MeetingContext = {
      transcript: validatedData.transcript,
      participants: validatedData.participants,
      meetingType: validatedData.meetingType,
      duration: validatedData.duration,
    };

    // Store meeting and get ID
    const id = await storageService.storeMeeting(meetingContext);

    // Add to processing queue
    await queueService.addToQueue(id, meetingContext);

    // Return meeting ID and status
    res.json({
      success: true,
      data: {
        id,
        status: 'pending',
        message: 'Meeting analysis queued successfully',
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Validation error
      res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.errors,
      });
    } else {
      // Other errors
      console.error('Meeting analysis error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to queue meeting analysis',
      });
    }
  }
});

// GET /api/meetings/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const meeting = await storageService.getMeeting(req.params.id);
    
    if (!meeting) {
      return res.status(404).json({
        success: false,
        error: 'Meeting not found',
      });
    }

    res.json({
      success: true,
      data: meeting,
    });
  } catch (error) {
    console.error('Error fetching meeting:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch meeting',
    });
  }
});

// GET /api/meetings
router.get('/', async (req: Request, res: Response) => {
  try {
    const meetings = await storageService.listMeetings();
    res.json({
      success: true,
      data: meetings,
    });
  } catch (error) {
    console.error('Error listing meetings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list meetings',
    });
  }
});

export default router; 