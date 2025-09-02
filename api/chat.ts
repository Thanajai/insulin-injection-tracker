import { GoogleGenAI, Content } from '@google/genai';
import type { ChatMessage } from '../types';

// Vercel's Request and Response types. Using 'any' for broader compatibility.
type VercelRequest = any;
type VercelResponse = any;

const systemInstruction = `You are an advanced AI assistant for diabetes management, named 'GlucoGuide'. 
Your purpose is to provide comprehensive and informative answers to questions about diet, exercise, medication, symptoms, and general diabetes care. 
You can discuss a wide range of topics to help users better understand their condition.
However, it is CRITICALLY IMPORTANT that you are not a replacement for a real doctor. 
Therefore, you MUST ALWAYS conclude every single response with a clear and prominent disclaimer in the user's language: 
'IMPORTANT: The information provided is for educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or another qualified health provider with any questions you may have regarding a medical condition.'`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { history, message } = req.body as { history: ChatMessage[], message: string };

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is not configured on the server.");
    return res.status(500).json({ error: 'AI service is not configured.' });
  }

  // Map frontend message format to the format required by the GoogleGenAI SDK
  const formattedHistory: Content[] = (history || []).map((msg: ChatMessage) => ({
    role: msg.role,
    parts: [{ text: msg.text }],
  }));

  try {
    const ai = new GoogleGenAI({ apiKey });
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: { systemInstruction },
      history: formattedHistory,
    });

    const result = await chat.sendMessageStream({ message });

    // Set headers for a streaming response
    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'X-Content-Type-Options': 'nosniff',
    });

    // Stream the response back to the client
    for await (const chunk of result) {
      res.write(chunk.text);
    }

    res.end();
  } catch (error) {
    console.error("Error communicating with Gemini API:", error);
    // Note: We don't call res.end() here because the stream might have already started.
    // The client will detect a prematurely closed connection.
  }
}
