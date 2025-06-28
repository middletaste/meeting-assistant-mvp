'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const MeetingForm: React.FC = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [transcript, setTranscript] = useState('');
  const [participants, setParticipants] = useState('');
  const [meetingType, setMeetingType] = useState('');
  const [duration, setDuration] = useState('');
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAudioFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('uploading');
    setError(null);
    try {
      const formData = new FormData();
      if (audioFile) formData.append('audio', audioFile);
      if (transcript) formData.append('transcript', transcript);
      formData.append('participants', participants);
      formData.append('meetingType', meetingType);
      formData.append('duration', duration);

      const res = await fetch('/api/meetings', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      
      await res.json();
      setStatus('success');
      
      // Redirect to meetings list after 2 seconds
      setTimeout(() => {
        window.location.href = '/meetings';
      }, 2000);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unknown error');
      }
      setStatus('error');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Submit Meeting</h2>
        <Link 
          href="/meetings" 
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          View Meeting History →
        </Link>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-2 font-medium text-gray-700">Voice Recording (mp3, wav, aac, flac, ogg, aiff, alac, m4a)</label>
          <input 
            type="file" 
            accept="audio/mp3,audio/wav,audio/aac,audio/flac,audio/ogg,audio/aiff,audio/alac,audio/m4a" 
            onChange={handleFileChange} 
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
          />
        </div>
        
        <div>
          <label className="block mb-2 font-medium text-gray-700">Transcript (optional)</label>
          <textarea 
            value={transcript} 
            onChange={e => setTranscript(e.target.value)} 
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            rows={3} 
            placeholder="Paste transcript here (optional)" 
          />
        </div>
        
        <div>
          <label className="block mb-2 font-medium text-gray-700">Participants (comma separated)</label>
          <input 
            type="text" 
            value={participants} 
            onChange={e => setParticipants(e.target.value)} 
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            required 
            placeholder="John, Alice, Bob"
          />
        </div>
        
        <div>
          <label className="block mb-2 font-medium text-gray-700">Meeting Type</label>
          <input 
            type="text" 
            value={meetingType} 
            onChange={e => setMeetingType(e.target.value)} 
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            required 
            placeholder="e.g., Planning, Review, Standup"
          />
        </div>
        
        <div>
          <label className="block mb-2 font-medium text-gray-700">Duration (minutes)</label>
          <input 
            type="number" 
            value={duration} 
            onChange={e => setDuration(e.target.value)} 
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            required 
            min={1} 
            placeholder="30"
          />
        </div>
        
        <button 
          type="submit" 
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
          disabled={status === 'uploading'}
        >
          {status === 'uploading' ? 'Uploading...' : 'Submit Meeting'}
        </button>
        
        {status === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 font-medium">Meeting submitted successfully!</p>
            <p className="text-green-700 text-sm mt-1">Redirecting to meeting history...</p>
          </div>
        )}
        
        {status === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-medium">Error: {error}</p>
          </div>
        )}
      </form>
    </div>
  );
};

export default MeetingForm; 