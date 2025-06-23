'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Meeting {
  id: string;
  transcript: string;
  participants: string[];
  meetingType: string;
  duration: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  analysis?: {
    summary: string;
    actionItems: string[];
    keyDecisions: string[];
    nextSteps: string[];
  };
  error?: string;
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const response = await fetch('/api/meetings');
      if (!response.ok) throw new Error('Failed to fetch meetings');
      const data = await response.json();
      setMeetings(data.data || []);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading meetings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Meeting History</h1>
          <Link 
            href="/" 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Upload New Meeting
          </Link>
        </div>

        {meetings.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl text-gray-600 mb-4">No meetings yet</h2>
            <p className="text-gray-500 mb-6">Upload your first meeting to get started</p>
            <Link 
              href="/" 
              className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition-colors"
            >
              Upload Meeting
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {meetings.map((meeting) => (
              <div key={meeting.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      {meeting.meetingType}
                    </h2>
                    <p className="text-gray-600">
                      {meeting.participants.join(', ')} • {meeting.duration} minutes
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(meeting.status)}`}>
                      {meeting.status}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDate(meeting.createdAt)}
                    </span>
                  </div>
                </div>

                {meeting.status === 'completed' && meeting.analysis && (
                  <div className="mb-4">
                    <p className="text-gray-700 line-clamp-2">
                      {meeting.analysis.summary}
                    </p>
                  </div>
                )}

                {meeting.status === 'failed' && meeting.error && (
                  <div className="mb-4">
                    <p className="text-red-600 text-sm">
                      Error: {meeting.error}
                    </p>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    ID: {meeting.id}
                  </div>
                  <Link 
                    href={`/meetings/${meeting.id}`}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 