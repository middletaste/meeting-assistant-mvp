'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

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

export default function MeetingDetailPage() {
  const params = useParams();
  const meetingId = params.id as string;
  
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMeeting = useCallback(async () => {
    if (!meetingId) return;
    try {
      const response = await fetch(`/api/meetings/${meetingId}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Meeting not found');
        }
        throw new Error('Failed to fetch meeting');
      }
      const data = await response.json();
      setMeeting(data.data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setLoading(false);
    }
  }, [meetingId]);

  useEffect(() => {
    fetchMeeting();
  }, [fetchMeeting]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading meeting details...</div>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Error: {error}</div>
          <Link 
            href="/meetings" 
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back to Meetings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link 
              href="/meetings" 
              className="text-blue-600 hover:text-blue-800 flex items-center"
            >
              ← Back to Meetings
            </Link>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(meeting.status)}`}>
              {meeting.status}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {meeting.meetingType}
          </h1>
          <div className="text-gray-600">
            <p>Participants: {meeting.participants.join(', ')}</p>
            <p>Duration: {meeting.duration} minutes</p>
            <p>Created: {formatDate(meeting.createdAt)}</p>
          </div>
        </div>

        {/* Error State */}
        {meeting.status === 'failed' && meeting.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Processing Failed</h2>
            <p className="text-red-700">{meeting.error}</p>
          </div>
        )}

        {/* Processing State */}
        {meeting.status === 'processing' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-blue-800 mb-2">Processing Meeting</h2>
            <p className="text-blue-700">Your meeting is being analyzed. This may take a few minutes.</p>
            <div className="mt-4">
              <div className="animate-pulse bg-blue-200 h-2 rounded"></div>
            </div>
          </div>
        )}

        {/* Pending State */}
        {meeting.status === 'pending' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-yellow-800 mb-2">Queued for Processing</h2>
            <p className="text-yellow-700">Your meeting is in the queue and will be processed soon.</p>
          </div>
        )}

        {/* Analysis Results */}
        {meeting.status === 'completed' && meeting.analysis && (
          <div className="space-y-8">
            {/* Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Summary</h2>
              <p className="text-gray-700 leading-relaxed">
                {meeting.analysis.summary}
              </p>
            </div>

            {/* Action Items */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Action Items</h2>
              {meeting.analysis.actionItems.length > 0 ? (
                <ul className="space-y-3">
                  {meeting.analysis.actionItems.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></span>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No action items identified.</p>
              )}
            </div>

            {/* Key Decisions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Key Decisions</h2>
              {meeting.analysis.keyDecisions.length > 0 ? (
                <ul className="space-y-3">
                  {meeting.analysis.keyDecisions.map((decision, index) => (
                    <li key={index} className="flex items-start">
                      <span className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></span>
                      <span className="text-gray-700">{decision}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No key decisions identified.</p>
              )}
            </div>

            {/* Next Steps */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Next Steps</h2>
              {meeting.analysis.nextSteps.length > 0 ? (
                <ul className="space-y-3">
                  {meeting.analysis.nextSteps.map((step, index) => (
                    <li key={index} className="flex items-start">
                      <span className="flex-shrink-0 w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3"></span>
                      <span className="text-gray-700">{step}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No next steps identified.</p>
              )}
            </div>
          </div>
        )}

        {/* Transcript (if available) */}
        {meeting.transcript && (
          <div className="bg-white rounded-lg shadow p-6 mt-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Transcript</h2>
            <div className="bg-gray-50 rounded p-4">
              <pre className="whitespace-pre-wrap text-gray-700 text-sm">
                {meeting.transcript}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 