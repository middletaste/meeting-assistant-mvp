'use client';

import React, { useState } from 'react';

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
      setStatus('success');
    } catch (err: any) {
      setError(err.message || 'Unknown error');
      setStatus('error');
    }
  };

  return (
    <form className="max-w-lg mx-auto p-6 bg-white rounded shadow" onSubmit={handleSubmit}>
      <h2 className="text-2xl font-bold mb-4">Submit Meeting</h2>
      <div className="mb-4">
        <label className="block mb-1 font-medium">Voice Recording (mp3, wav)</label>
        <input type="file" accept="audio/mp3,audio/wav" onChange={handleFileChange} className="block w-full" />
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">Transcript (optional)</label>
        <textarea value={transcript} onChange={e => setTranscript(e.target.value)} className="w-full border rounded p-2" rows={3} placeholder="Paste transcript here (optional)" />
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">Participants (comma separated)</label>
        <input type="text" value={participants} onChange={e => setParticipants(e.target.value)} className="w-full border rounded p-2" required />
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">Meeting Type</label>
        <input type="text" value={meetingType} onChange={e => setMeetingType(e.target.value)} className="w-full border rounded p-2" required />
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">Duration (minutes)</label>
        <input type="number" value={duration} onChange={e => setDuration(e.target.value)} className="w-full border rounded p-2" required min={1} />
      </div>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={status === 'uploading'}>
        {status === 'uploading' ? 'Uploading...' : 'Submit'}
      </button>
      {status === 'success' && <p className="text-green-600 mt-2">Meeting submitted successfully!</p>}
      {status === 'error' && <p className="text-red-600 mt-2">Error: {error}</p>}
    </form>
  );
};

export default MeetingForm; 