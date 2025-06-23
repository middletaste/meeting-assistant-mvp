import { NextRequest, NextResponse } from 'next/server';
import { StorageService } from '@/services/storage/storage-service';

const storageService = new StorageService();

type RouteParams = {
  params: {
    id: string;
  };
};

export async function GET(
  req: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const meeting = await storageService.getMeeting(params.id);
    
    if (!meeting) {
      return NextResponse.json(
        { success: false, error: 'Meeting not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: meeting });
  } catch (error) {
    console.error('Error fetching meeting:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch meeting' },
      { status: 500 }
    );
  }
} 