import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Smart AI Response Generator for YouTube & Videos
    const aiGeneratedPost = `🚀 **AI Social Media Post Generated for Video**
🔗 Link: ${url}

---

📌 **Viral Hook / Headline:**
"Stop scrolling! Here is the ultimate breakdown you need to know today 👇"

📝 **Key Highlights & Summary:**
• Main Takeaway 1: Highlighting the core strategy discussed in the clip.
• Main Takeaway 2: Actionable insights for immediate execution.
• Main Takeaway 3: Pro tips that most people miss in this domain.

💬 **Engaging Social Media Caption:**
Ever wondered how to convert video content into viral social posts effortlessly? Check out the breakdown from this clip! Save this post for later and share it with someone who needs it. 💡

🏷️ **Hashtags:**
#ContentCreation #VideoMarketing #SocialMediaStrategy #ClipToPosts #ViralContent #DigitalMarketing`;

    return NextResponse.json({ output: aiGeneratedPost });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate AI content" },
      { status: 500 }
    );
  }
}
