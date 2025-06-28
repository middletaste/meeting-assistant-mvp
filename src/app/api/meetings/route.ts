import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { StorageService } from '@/services/storage/storage-service';
import { QueueService } from '@/services/queue/queue-service';
import { transcribeAudio } from '@/services/transcription/transcription-service';

const storageService = new StorageService();
const queueService = new QueueService();

const MeetingAnalysisRequestSchema = z.object({
  transcript: z.string(),
  participants: z.array(z.string()),
  meetingType: z.string(),
  duration: z.number().positive(),
  audioPath: z.string().optional(),
});

const SUPPORTED_AUDIO_TYPES = [
  'audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/aac', 'audio/flac', 'audio/ogg', 'audio/aiff', 'audio/x-aiff', 'audio/alac', 'audio/x-m4a', 'audio/m4a',
];
const SUPPORTED_AUDIO_EXTENSIONS = [
  '.mp3', '.wav', '.aac', '.flac', '.ogg', '.aiff', '.alac', '.m4a',
];

export async function POST(req: NextRequest) {
  try {
    // Parse multipart form using formData()
    const formData = await req.formData();
    const participantsRaw = formData.get('participants')?.toString() || '';
    const participants = participantsRaw.split(',').map((p) => p.trim()).filter(Boolean);
    const meetingType = formData.get('meetingType')?.toString() || '';
    const duration = Number(formData.get('duration'));
    let audioPath = '';
    let transcript = formData.get('transcript')?.toString() || '';
    const audioFile = formData.get('audio');
    if (audioFile && typeof audioFile === 'object' && 'arrayBuffer' in audioFile) {
      // Validate file type/extension
      const fileName = audioFile.name || '';
      const fileType = audioFile.type || '';
      const hasValidType = SUPPORTED_AUDIO_TYPES.includes(fileType);
      const hasValidExt = SUPPORTED_AUDIO_EXTENSIONS.some(ext => fileName.toLowerCase().endsWith(ext));
      if (!hasValidType && !hasValidExt) {
        return NextResponse.json(
          { success: false, error: 'Unsupported audio file type. Allowed: mp3, wav, aac, flac, ogg, aiff, alac, m4a.' },
          { status: 400 }
        );
      }
      // Save the file to disk (MVP: local storage)
      const buffer = Buffer.from(await audioFile.arrayBuffer());
      const fs = await import('fs/promises');
      const path = await import('path');
      const uploadsDir = path.join(process.cwd(), 'uploads');
      await fs.mkdir(uploadsDir, { recursive: true });
      const fileNameToSave = `${Date.now()}-${audioFile.name}`;
      const filePath = path.join(uploadsDir, fileNameToSave);
      await fs.writeFile(filePath, buffer);
      audioPath = filePath;
      // If no transcript provided, try to transcribe
      if (!transcript.trim()) {
        transcript = await transcribeAudio(audioPath);
      }
    }
    // If still no transcript, return error
    if (!transcript.trim()) {
      return NextResponse.json(
        { success: false, error: 'No transcript provided and transcription could not be obtained from audio.' },
        { status: 400 }
      );
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