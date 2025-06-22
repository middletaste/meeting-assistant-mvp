import MeetingForm from '../components/MeetingForm';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Meeting Assistant</h1>
          <p className="text-xl text-gray-600 mb-6">
            Upload your meeting recordings and get AI-powered insights
          </p>
          <div className="flex justify-center space-x-4">
            <Link 
              href="/meetings" 
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              View Meeting History
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          <MeetingForm />
        </div>
        
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">How it works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold text-xl">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Upload Meeting</h3>
              <p className="text-gray-600">Upload your audio recording or paste a transcript</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold text-xl">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">AI Analysis</h3>
              <p className="text-gray-600">Our AI analyzes the content and extracts key insights</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold text-xl">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Get Results</h3>
              <p className="text-gray-600">View summary, action items, decisions, and next steps</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 