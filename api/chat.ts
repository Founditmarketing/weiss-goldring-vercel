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

    const token = process.env.VOICEFLOW_API_KEY;

    if (!token) {
        console.error("VOICEFLOW_API_KEY environment variable is missing.");
        return response.status(500).json({
            error: 'Internal server error: API key missing.'
        });
    }

    try {
        const apiResponse = await axios.post(
            `https://general-runtime.voiceflow.com/state/user/${sessionKey}/interact`,
            {
                action: {
                    type: "text",
                    payload: query
                }
            },
            {
                headers: {
                    'Authorization': token,
                    'versionID': 'development',
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            }
        );

        const traces = apiResponse.data;
        console.log("RAW VOICEFLOW RESPONSE (TRACES):", JSON.stringify(traces));

        return response.status(200).json({ traces: traces });

    } catch (error: any) {
        console.error("Voiceflow API Request Error:", error.response?.data || error.message);
        return response.status(500).json({
            error: 'I apologize, but I need to step into the tailoring room for a moment. Please try again shortly.'
        });
    }
}
