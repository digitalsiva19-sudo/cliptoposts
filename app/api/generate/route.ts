import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { url, language = "English" } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "YouTube URL is required" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "OpenAI API Key missing in Vercel settings." }, { status: 500 });
    }

    const promptText = `
    You are an expert social media manager and content creator.
    Analyze this YouTube video URL or topic: ${url}
    
    Generate the following output specifically in ${language} language:
    1. 🚀 1 High-Converting LinkedIn Post (with emojis & strong hook).
    2. 🧵 1 Viral Twitter/X Thread (3-4 tweets).
    3. 🎬 1 Short Reel Script (30-second Hook + Main Message + Call To Action).

    Make sure the tone is engaging, structured, and formatted with clean line breaks.
    `;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a professional social media content generator." },
          { role: "user", content: promptText },
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 500 });
    }

    const aiOutput = data.choices[0]?.message?.content || "Could not generate content.";

    return NextResponse.json({ result: aiOutput });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}
