import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { StorageService } from '@/services/storage/storage-service';
import { QueueService } from '@/services/queue/queue-service';
import formidable, { Fields, Files } from 'formidable';
import { promises as fs } from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

const storageService = new StorageService();
const queueService = new QueueService();

const MeetingAnalysisRequestSchema = z.object({
  transcript: z.string(),
  participants: z.array(z.string()),
  meetingType: z.string(),
  duration: z.number().positive(),
  audioPath: z.string().optional(),
});

async function parseForm(req: NextRequest) {
  return new Promise<{ fields: Fields; files: Files }>((resolve, reject) => {
    const form = formidable({
      multiples: false,
      uploadDir: path.join(process.cwd(), 'uploads'),
      keepExtensions: true,
    });
    form.parse(req as any, (err: any, fields: Fields, files: Files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

export async function POST(req: NextRequest) {
  try {
    // Parse multipart form
    const { fields, files } = await parseForm(req);
    const transcript = typeof fields.transcript === 'string' ? fields.transcript : '';
    let participantsRaw = '';
    if (Array.isArray(fields.participants)) {
      participantsRaw = fields.participants.join(',');
    } else if (typeof fields.participants === 'string') {
      participantsRaw = fields.participants;
    }
    const participants = participantsRaw.split(',').map((p: string) => p.trim()).filter(Boolean);
    const meetingType = fields.meetingType || '';
    const duration = Number(fields.duration);
    let audioPath = '';
    if (files.audio && Array.isArray(files.audio) && files.audio[0] && files.audio[0].filepath) {
      audioPath = files.audio[0].filepath;
    }
    const validatedData = MeetingAnalysisRequestSchema.parse({
      transcript,
      participants,
      meetingType,
      duration,
      audioPath: audioPath || undefined,
    });
    // Store meeting and queue for analysis
    const id = await storageService.storeMeeting(validatedData);
    await queueService.addToQueue(id, validatedData);
    return NextResponse.json({
      success: true,
      data: {
        id,
        status: 'pending',
        message: 'Meeting analysis queued successfully',
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Meeting analysis error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to queue meeting analysis' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const meetings = await storageService.listMeetings();
    return NextResponse.json({ success: true, data: meetings });
  } catch (error) {
    console.error('Error listing meetings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to list meetings' },
      { status: 500 }
    );
  }
} 