import { VertexAI } from '@google-cloud/vertexai';
import { LLMService, MeetingContext, MeetingAnalysis } from './types';

// This class is the core logic for analyzing meetings using Vertex AI's LLM
export class LangChainLLMService implements LLMService {
  private model: VertexAI; // Handles connection to Vertex AI
  private projectId: string; // Google Cloud project ID
  private location: string;  // Google Cloud region

  constructor() {
    // Use environment variables for sensitive configuration
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || 'your-project-id';
    this.location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
    
    // Initialize the VertexAI client
    this.model = new VertexAI({
      project: this.projectId,
      location: this.location,
    });
  }

  // Main method: analyzes a meeting and returns structured results
  async analyzeMeeting(context: MeetingContext): Promise<MeetingAnalysis> {
    // Build the prompt for the LLM (what we want it to do)
    const prompt = `
      Analyze the following meeting transcript and provide a structured analysis.
      
      Meeting Type: ${context.meetingType}
      Duration: ${context.duration} minutes
      Participants: ${context.participants.join(', ')}
      
      Transcript:
      ${context.transcript}
      
      Please provide:
      1. A concise summary
      2. Action items
      3. Key decisions made
      4. Next steps
      
      Format the response as a JSON object with the following structure:
      {
        "summary": "string",
        "actionItems": ["string"],
        "keyDecisions": ["string"],
        "nextSteps": ["string"]
      }
    `;

    // Get the Gemini model from Vertex AI (change model name if needed)
    const model = this.model.preview.getGenerativeModel({
      model: 'gemini-2.0-flash-001',
    });

    // Send the prompt to the model and get the response
    const response = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generation_config: {
        temperature: Number(process.env.TEMPERATURE) || 0.7, // Controls randomness
        max_output_tokens: 1024, // Max length of the response
      },
    });

    // Extract the text part of the response
    const responseText = response.response.candidates[0]?.content.parts[0]?.text;
    if (!responseText) {
      throw new Error('No response from Vertex AI');
    }

    // Clean up the response (remove code block markers if present)
    const cleanedText = responseText.replace(/```json\n?|\n?```/g, '').trim();
    // Parse the JSON string into a JavaScript object
    const analysis = JSON.parse(cleanedText) as MeetingAnalysis;
    return analysis; // Return the structured analysis
  }
} 