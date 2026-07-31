import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "YouTube URL is required" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "OpenAI API Key missing in Vercel" }, { status: 500 });
    }

    // Call OpenAI GPT to process the video topic
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an expert social media strategist. Generate high-converting LinkedIn posts, Twitter threads, and Instagram captions based on the provided YouTube video topic.",
          },
          {
            role: "user",
            content: `Analyze this YouTube video URL/Topic: ${url}. Generate 1 engaging LinkedIn Post with bullet points, 1 Twitter Thread (3 tweets), and relevant hashtags.`,
          },
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 500 });
    }

    const aiOutput = data.choices[0]?.message?.content || "Could not generate response.";

    return NextResponse.json({ result: aiOutput });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}
