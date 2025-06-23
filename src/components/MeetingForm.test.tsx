import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MeetingForm from './MeetingForm';

beforeEach(() => {
  // @ts-expect-error: Mocking global.fetch for test environment
  global.fetch = jest.fn(() => Promise.resolve({ ok: true }));
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('MeetingForm', () => {
  it('renders and submits the form', async () => {
    render(<MeetingForm />);

    // Fill participants
    fireEvent.change(screen.getByLabelText(/Participants/i), { target: { value: 'Alice,Bob' } });
    // Fill meeting type
    fireEvent.change(screen.getByLabelText(/Meeting Type/i), { target: { value: 'Planning' } });
    // Fill duration
    fireEvent.change(screen.getByLabelText(/Duration/i), { target: { value: '30' } });
    // Optionally fill transcript
    fireEvent.change(screen.getByLabelText(/Transcript/i), { target: { value: 'Test transcript' } });
    // Simulate file upload
    const file = new File(['audio'], 'meeting.mp3', { type: 'audio/mp3' });
    fireEvent.change(screen.getByLabelText(/Voice Recording/i), { target: { files: [file] } });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    // Wait for success message
    await waitFor(() => {
      expect(screen.getByText(/Meeting submitted successfully/i)).toBeInTheDocument();
    });
  });
}); 