import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { messages, model = "gpt-4o", threadId } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res
        .status(500)
        .json({ error: "OpenAI API key is not configured" });
    }

    // Set up streaming response headers
    res.writeHead(200, {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
    });

    // Create OpenAI stream
    const stream = await openai.chat.completions.create({
      model,
      messages,
      stream: true,
      max_tokens: 2000,
      temperature: 0.7,
    });

    // Stream the response
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        res.write(`data: ${JSON.stringify(chunk)}\n\n`);
      }
    }

    // End the stream
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error) {
    console.error("OpenAI API error:", error);

    // If response hasn't been sent yet, send error response
    if (!res.headersSent) {
      res.status(500).json({
        error: "Failed to generate response",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    } else {
      // If streaming has started, send error in stream format
      res.write(
        `data: ${JSON.stringify({
          error: "Stream interrupted",
          details: error instanceof Error ? error.message : "Unknown error",
        })}\n\n`
      );
      res.end();
    }
  }
}
