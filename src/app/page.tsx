import MeetingForm from '../components/MeetingForm';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-8">Meeting Assistant</h1>
      <MeetingForm />
    </main>
  );
} 