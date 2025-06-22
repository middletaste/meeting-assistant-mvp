import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MeetingsPage from './page';

// Mock fetch
global.fetch = jest.fn();

describe('MeetingsPage', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('should render loading state initially', () => {
    (fetch as jest.Mock).mockImplementation(() => 
      new Promise(() => {}) // Never resolves to keep loading state
    );

    render(<MeetingsPage />);
    expect(screen.getByText('Loading meetings...')).toBeInTheDocument();
  });

  it('should render empty state when no meetings', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [] })
    });

    render(<MeetingsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('No meetings yet')).toBeInTheDocument();
      expect(screen.getByText('Upload your first meeting to get started')).toBeInTheDocument();
    });
  });

  it('should render meetings list when meetings exist', async () => {
    const mockMeetings = [
      {
        id: 'meeting_1',
        transcript: 'Test transcript',
        participants: ['John', 'Alice'],
        meetingType: 'Planning Meeting',
        duration: 30,
        status: 'completed' as const,
        createdAt: '2024-01-01T10:00:00Z',
        analysis: {
          summary: 'Test summary',
          actionItems: ['Action 1'],
          keyDecisions: ['Decision 1'],
          nextSteps: ['Step 1']
        }
      }
    ];

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockMeetings })
    });

    render(<MeetingsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Planning Meeting')).toBeInTheDocument();
      expect(screen.getByText('John, Alice')).toBeInTheDocument();
      expect(screen.getByText('30 minutes')).toBeInTheDocument();
      expect(screen.getByText('completed')).toBeInTheDocument();
    });
  });

  it('should handle fetch error', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch'));

    render(<MeetingsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Error: Failed to fetch')).toBeInTheDocument();
    });
  });
}); 