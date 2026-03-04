import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

export const maxDuration = 60;

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const { query, sessionKey } = request.body;

  if (!query || !sessionKey) {
    return response.status(400).json({
      error: 'The function must be called with "query" and "sessionKey".'
    });
  }

  const token = process.env.STAMMER_API_TOKEN;

  if (!token) {
    console.error("STAMMER_API_TOKEN environment variable is missing.");
    return response.status(500).json({
      error: 'Internal server error: API token missing.'
    });
  }

  try {
    const apiResponse = await axios.post(
      'https://app.stammer.ai/en/chatbot/api/v1/message/',
      {
        chatbot_uuid: "9b49e3ae-224d-4586-b420-0076d34cd1ac",
        query: query,
        user_key: sessionKey
      },
      {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    const stammerResponse = apiResponse.data;
    console.log("RAW STAMMER RESPONSE:", JSON.stringify(stammerResponse));

    // Safely extract the 'answer' field based on Stammer's specific JSON structure
    const extractedText = stammerResponse?.data?.answer || "I apologize, I could not process that response.";

    return response.status(200).json({ text: extractedText });
  } catch (error: any) {
    console.error("Stammer API Request Error:", error.response?.data || error.message);
    return response.status(500).json({
      error: 'I apologize, but I need to step into the tailoring room for a moment. Please try again shortly.'
    });
  }
}
