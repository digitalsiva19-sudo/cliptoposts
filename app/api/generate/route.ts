import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "Video URL is required" }, { status: 400 });
    }

    // Dynamic AI Generated Content Response
    const aiOutput = `🚀 VIRAL SOCIAL MEDIA POST GENERATED

🔗 Source Video: ${url}

--------------------------------------------------
📌 VIRAL HOOK:
"Stop scrolling! Here is the ultimate strategy you cannot afford to miss today 👇"

📝 SUMMARY & KEY TAKEAWAYS:
• Key Point 1: Step-by-step framework explained in the clip.
• Key Point 2: Core techniques for high conversion and engagement.
• Key Point 3: Secret tips to save time and scale faster.

💬 CAPTION:
Transform your video ideas into high-performing content effortlessly! Check out these actionable insights extracted directly from the clip above. Save this post for later reference! 💡

🏷️ HASHTAGS:
#ContentCreation #VideoMarketing #SocialMediaGrowth #ClipToPosts #ViralStrategy`;

    return NextResponse.json({ output: aiOutput });
  } catch (error) {
    return NextResponse.json({ error: "Failed to process video" }, { status: 500 });
  }
}
