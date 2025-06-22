import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { StorageService } from '@/services/storage/storage-service';
import { QueueService } from '@/services/queue/queue-service';
import { FormData as FormDataNode, File } from 'formdata-node';
import { FormDataEncoder } from 'form-data-encoder';

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

export async function POST(req: NextRequest) {
  try {
    // Parse multipart form using formData()
    const formData = await req.formData();
    const transcript = formData.get('transcript')?.toString() || '';
    const participantsRaw = formData.get('participants')?.toString() || '';
    const participants = participantsRaw.split(',').map((p) => p.trim()).filter(Boolean);
    const meetingType = formData.get('meetingType')?.toString() || '';
    const duration = Number(formData.get('duration'));
    let audioPath = '';
    const audioFile = formData.get('audio');
    if (audioFile && typeof audioFile === 'object' && 'arrayBuffer' in audioFile) {
      // Save the file to disk (MVP: local storage)
      const buffer = Buffer.from(await audioFile.arrayBuffer());
      const fs = await import('fs/promises');
      const path = await import('path');
      const uploadsDir = path.join(process.cwd(), 'uploads');
      await fs.mkdir(uploadsDir, { recursive: true });
      const fileName = `${Date.now()}-${audioFile.name}`;
      const filePath = path.join(uploadsDir, fileName);
      await fs.writeFile(filePath, buffer);
      audioPath = filePath;
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

it('should accept audio upload and metadata', async () => {
  const fileBuffer = Buffer.from('fake audio content');
  const file = new File([fileBuffer], 'test-audio.mp3', { type: 'audio/mp3' });

  const form = new FormDataNode();
  form.append('audio', file);
  form.append('participants', 'Alice,Bob');
  form.append('meetingType', 'Planning');
  form.append('duration', '30');
  form.append('transcript', 'Test transcript');

  const encoder = new FormDataEncoder(form);
  const chunks: Uint8Array[] = [];
  for await (const chunk of encoder.encode()) {
    chunks.push(chunk);
  }
  // Use Uint8Array instead of Buffer
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