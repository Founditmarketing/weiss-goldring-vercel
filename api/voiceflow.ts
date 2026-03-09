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
                    'Authorization': 'VF.DM.69aefe800efddc2f758b449a.OQYqPklKGayyqBWW',
                    'versionID': 'development',
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            }
        );

        const traces = apiResponse.data;
        console.log("RAW VOICEFLOW RESPONSE (TRACES):", JSON.stringify(traces));

        // For basic text responses, Voiceflow returns traces. We need to parse them on the client,
        // so we will just return the raw array of traces to the frontend.
        return response.status(200).json({ traces: traces });

    } catch (error: any) {
        console.error("Voiceflow API Request Error:", error.response?.data || error.message);
        return response.status(500).json({
            error: 'I apologize, but I need to step into the tailoring room for a moment. Please try again shortly.'
        });
    }
}
