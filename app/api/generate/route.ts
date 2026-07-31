import { NextResponse } from "next/server";
import { YoutubeTranscript } from "youtube-transcript";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { videoUrl, language, tone } = await req.json();

    if (!videoUrl) {
      return NextResponse.json({ error: "YouTube URL is required" }, { status: 400 });
    }

    // 1. Fetch YouTube Transcript
    const transcriptArray = await YoutubeTranscript.fetchTranscript(videoUrl);
    const fullTranscript = transcriptArray.map((item) => item.text).join(" ");

    // 2. System Prompt
    const systemPrompt = `
      You are an expert Social Media Content Repurposer.
      Convert the provided YouTube transcript into high-converting social media content.

      Target Language: ${language} (If Telugu/Tanglish, keep it clear, high engaging, and natural).
      Tone: ${tone}

      Return ONLY a valid JSON object matching this structure exactly:
      {
        "linkedin": [
          "Post 1 with strong hook, line breaks, bullet points, and CTA",
          "Post 2"
        ],
        "twitter": [
          "Tweet 1/5 - Viral Hook",
          "Tweet 2/5 - Insight",
          "Tweet 3/5 - Detail",
          "Tweet 4/5 - Summary",
          "Tweet 5/5 - Call to Action"
        ],
        "reels": [
          "Short Video Script 1 (Include Hook, Visual Prompt, and Spoken Script)",
          "Short Video Script 2"
        ]
      }
    `;

    // 3. Call OpenAI gpt-4o-mini
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: fullTranscript.slice(0, 10000) },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return NextResponse.json({ success: true, data: result });

  } catch (error: any) {
    console.error("Error generating content:", error);
    return NextResponse.json({ error: "Failed to fetch transcript or generate content." }, { status: 500 });
  }
}
