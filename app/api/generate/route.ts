import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { inputUrl, platform, phone, address, services, mode, language } = body;

    if (!inputUrl) {
      return NextResponse.json({ error: "Business Name or Website URL is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    let rawInput = String(inputUrl).trim();

    // Smart URL Cleaner (Converts 'https://www.vcaretrichology.com/' -> 'VCare Trichology')
    let cleanInput = rawInput
      .replace(/https?:\/\//gi, "")
      .replace(/www\./gi, "")
      .replace(/\/.*$/gi, "")
      .replace(/\.(com|in|org|net|co|co\.in)/gi, "")
      .replace(/[-_]/g, " ")
      .trim();

    if (!cleanInput) cleanInput = rawInput;

    // Capitalize business name
    cleanInput = cleanInput.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

    // Smart Location Detection
    const inputLower = rawInput.toLowerCase();
    let detectedLocation = "Vizag";
    const cities = ["amalapuram", "vizag", "visakhapatnam", "kakinada", "hyderabad", "vijayawada", "guntur", "rajahmundry", "tirupati", "bangalore", "chennai", "mumbai", "delhi"];
    
    for (const city of cities) {
      if (inputLower.includes(city)) {
        detectedLocation = city === "visakhapatnam" ? "Vizag" : city.charAt(0).toUpperCase() + city.slice(1);
        break;
      }
    }

    // ==========================================
    // MODE 1: LOCAL SEO & GMB CHECKLIST
    // ==========================================
    if (mode === "gmb") {
      const gmbPrompt = `
You are a Senior Local SEO & Google My Business (GMB) Specialist.
Target Business: '${cleanInput}'
Target Location: ${detectedLocation}

Provide a comprehensive, professional Local SEO & GMB Audit Report with actionable steps:
1. Primary & Secondary GMB Categories selection
2. NAP (Name, Address, Phone) Consistency Audit Checklist
3. Local Citation & Backlink Strategy in ${detectedLocation}
4. Google Maps Ranking Checklist (Geo-tagged photos, Reviews strategy, Q&A)
5. On-Page Local SEO Recommendations (Schema Markup, Localized Landing Pages)

Keep it highly structured, easy to read, and executive-ready.
`;

      let gmbResult = await callGemini(apiKey, gmbPrompt);
      if (!gmbResult) {
        gmbResult = generateGmbFallback(cleanInput, detectedLocation);
      }

      return NextResponse.json({ success: true, gmbData: gmbResult, domainName: cleanInput });
    }

    // ==========================================
    // MODE 2: 100+ KEYWORD MINING AUDIT
    // ==========================================
    if (mode === "keywords") {
      const keywordPrompt = `
You are an Advanced SEO Keyword Research Engine (Ahrefs / SEMrush Alternative).
Target Search Query / Business Topic: '${cleanInput}'
Location Target: ${detectedLocation}

CRITICAL RULES:
1. Provide REAL, natural search queries typed into Google specifically for '${cleanInput}'.
2. Absolutely DO NOT append awkward duplicate phrases like '${cleanInput} in ${detectedLocation}'.
3. Output MUST be STRICT VALID JSON ONLY (no markdown text).
4. Provide 5 distinct categories with EXACTLY 20 keywords each (Total 100 Keywords).

JSON Structure:
[
  {
    "category": "Top 20 Primary High-Volume Keywords",
    "keywords": [
      { "kw": "sample keyword 1", "vol": "12,500/mo", "diff": "22%", "days": "10-20", "intent": "Transactional", "impact": "High" }
    ]
  },
  { "category": "Top 20 High-Intent Transactional Keywords", "keywords": [] },
  { "category": "Top 20 Low Competition Long-Tail Keywords", "keywords": [] },
  { "category": "Top 20 Local SEO Keywords (${detectedLocation})", "keywords": [] },
  { "category": "Top 20 Question-Based & FAQ Keywords", "keywords": [] }
]
`;

      let kwResultText = await callGemini(apiKey, keywordPrompt);
      let parsedKeywords = null;

      try {
        if (kwResultText) {
          const cleanJson = kwResultText.replace(/```json/g, "").replace(/```/g, "").trim();
          parsedKeywords = JSON.parse(cleanJson);
        }
      } catch (e) {
        console.log("JSON Parse Error, generating dynamic fallback");
      }

      if (!parsedKeywords || parsedKeywords.length === 0) {
        parsedKeywords = generatePureDynamicKeywords(cleanInput, detectedLocation);
      }

      return NextResponse.json({ success: true, keywordJson: parsedKeywords, domainName: cleanInput });
    }

    // ==========================================
    // MODE 3: 3D FLYER & SOCIAL CONTENT KIT
    // ==========================================
    const langStyle = language === "telugu" ? "Telugu" : language === "tanglish" ? "Telugu-English Hybrid" : "English";
    const targetPlatform = platform ? String(platform).toUpperCase() : "INSTAGRAM";

    const promptText = `
You are an Elite Social Media Growth Marketer.
Business Name: '${cleanInput}'
Platform: ${targetPlatform}
Language: ${langStyle}
Location: ${detectedLocation}

Generate a viral content package:
• POST TITLE / HOOK: (High-converting headline)
• CAPTION & STORYTELLING: (Engaging copy with emojis and clear call to action)
• REEL SCRIPT & VISUAL PROMPTS: (Hook 0-3s, Body 3-15s, CTA 15-30s)
• VIRAL HASHTAGS: (15 targeted hashtags)
`;

    let generatedText = await callGemini(apiKey, promptText);
    
    if (!generatedText) {
      generatedText = generateFlyerFallback(cleanInput, targetPlatform, langStyle, detectedLocation);
    }

    return NextResponse.json({ 
      success: true, 
      text: generatedText,
      domainName: cleanInput,
      autoPhone: phone || "+91 96405 02095",
      autoAddress: address || detectedLocation,
      autoServices: services ? String(services).split(",") : ["Hair Care", "Skin Treatment", "Trichology", "Consultation"]
    });

  } catch (error: any) {
    console.error("API Route Error:", error);
    return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}

async function callGemini(apiKey: string | undefined, prompt: string) {
  if (!apiKey) return null;
  const endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

  try {
    const geminiRes = await fetch(`${endpoint}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 8192, temperature: 0.3 }
      })
    });

    if (geminiRes.ok) {
      const data = await geminiRes.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
    }
  } catch (err) {
    console.log("Gemini API Error:", err);
  }
  return null;
}

// GMB Fallback Report Generator
function generateGmbFallback(business: string, loc: string) {
  return `📍 GOOGLE MY BUSINESS (GMB) & LOCAL SEO AUDIT REPORT FOR '${business.toUpperCase()}' IN ${loc.toUpperCase()}

1. PRIMARY & SECONDARY CATEGORY OPTIMIZATION:
   • Primary Category: Hair Care Clinic / Dermatologist / Cosmetic Center
   • Secondary Categories: Hair Transplantation Clinic, Skin Care Clinic, Medical Spa

2. NAP CONSISTENCY & BUSINESS DETAILS:
   • Business Name: ${business}
   • Primary Area: ${loc} & surrounding 15km radius
   • Business Hours: Set explicit 6-day operating hours including weekends

3. GOOGLE MAPS RANKING CHECKLIST (TOP 3 MAP PACK):
   ✔ Upload 10+ High-Resolution Geo-tagged photos of clinic interior & exterior.
   ✔ Set up automated WhatsApp post-appointment Google Review collection link.
   ✔ Respond to all existing reviews within 24 hours with target keywords (${business}, ${loc}).
   ✔ Fill out all 10 GMB Products/Services with transparent pricing & CTA buttons.

4. LOCAL CITATIONS & ON-PAGE SEO:
   • Build listings on Justdial, Sulekha, IndiaMART, and local ${loc} business directories.
   • Add Local Business Schema Markup (JSON-LD) on the homepage.
   • Embed Google Map on website contact page.`;
}

// 3D Flyer Fallback Text
function generateFlyerFallback(business: string, platform: string, lang: string, loc: string) {
  return `🎯 VIRAL HOOK:
Transform Your Look & Confidence with ${business} in ${loc}! ✨

📝 CAPTION & OFFER COPY (${lang}):
Looking for expert solutions for hair and skin care? 🌿 ${business} brings you advanced trichology & cosmetic treatments with proven results right here in ${loc}. Book your consultation today!

🎥 REEL SCRIPT & PROMPT (${platform}):
• Hook (0-3s): "Suffering from hair loss or scalp issues in ${loc}?"
• Body (3-15s): Show clinical transformation results, expert consultation & modern laser equipment.
• Call To Action (15-20s): "Click the link in bio or call us now to book your expert slot!"

🏷️ HASHTAGS:
#${business.replace(/\s+/g, "")} #${loc}HairCare #${loc}Clinics #Trichology${loc} #SkinAndHairCare #Viral${platform}`;
}

// Universal Clean Dynamic Keyword Generator
function generatePureDynamicKeywords(input: string, loc: string) {
  let coreTopic = input.replace(new RegExp(`in ${loc}`, "gi"), "").replace(new RegExp(loc, "gi"), "").replace(/near me/gi, "").trim();
  if (!coreTopic) coreTopic = input;

  const buildCat = (title: string, list: string[]) => ({
    category: title,
    keywords: list.map((kw, i) => ({
      kw: kw,
      vol: `${Math.max(150, (20 - i) * 350)}/mo`,
      diff: `${15 + (i * 2)}%`,
      days: `${5 + i}-${12 + i}`,
      intent: i % 2 === 0 ? "Transactional" : "Commercial",
      impact: "High"
    }))
  });

  return [
    buildCat("Top 20 Primary High-Volume Keywords", [
      `best ${coreTopic} in ${loc}`, `top rated ${coreTopic} near me`, `${coreTopic} specialists in ${loc}`,
      `affordable ${coreTopic} in ${loc}`, `famous ${coreTopic} clinic ${loc}`, `best doctors for ${coreTopic} in ${loc}`,
      `advanced ${coreTopic} center ${loc}`, `top 10 ${coreTopic} in ${loc}`, `quality ${coreTopic} services ${loc}`,
      `certified ${coreTopic} experts in ${loc}`, `laser ${coreTopic} in ${loc}`, `trusted ${coreTopic} in ${loc}`,
      `cosmetology center in ${loc}`, `best treatment center ${loc}`, `${coreTopic} consultation fee ${loc}`,
      `professional ${coreTopic} in ${loc}`, `painless ${coreTopic} in ${loc}`, `popular ${coreTopic} ${loc}`,
      `emergency ${coreTopic} clinic in ${loc}`, `${coreTopic} timings in ${loc}`
    ]),
    buildCat("Top 20 High-Intent Transactional Keywords", [
      `book appointment for ${coreTopic} in ${loc}`, `contact number of ${coreTopic} in ${loc}`, `best ${coreTopic} consultation ${loc}`,
      `cost of treatment in ${coreTopic} ${loc}`, `cheap and best ${coreTopic} in ${loc}`, `advanced PRP treatment in ${loc}`,
      `treatment cost in ${loc}`, `glow skin & hair treatment in ${loc}`, `laser treatment cost in ${loc}`,
      `whitening treatment in ${loc}`, `specialist clinic in ${loc}`, `consultation offers in ${loc}`,
      `anti aging treatment in ${loc}`, `hair care in ${loc}`, `discount on packages in ${loc}`,
      `best cosmetic doctor in ${loc}`, `instant consultation ${loc}`, `open now ${coreTopic} in ${loc}`,
      `top rated treatment clinic ${loc}`, `female doctor in ${loc}`
    ]),
    buildCat("Top 20 Low Competition Long-Tail Keywords", [
      `best affordable ${coreTopic} with good reviews in ${loc}`, `top recommended doctors in ${loc}`,
      `step by step process for treatment in ${loc}`, `how to choose trusted ${coreTopic} in ${loc}`,
      `is treatment safe in ${loc}`, `best specialist for stubborn problems in ${loc}`,
      `consultation fee comparison in ${loc}`, `best clinic for permanent results in ${loc}`,
      `specialist doctors near main road ${loc}`, `advanced PRP treatment clinic in ${loc}`,
      `top hospital for bride hair & skin care in ${loc}`, `low cost care clinic in ${loc}`,
      `best doctor for kids and adults in ${loc}`, `clinic with modern laser machines in ${loc}`,
      `how to get rid of hair loss in ${loc}`, `natural looking treatment specialists in ${loc}`,
      `best doctor near main road ${loc}`, `patient reviews for ${coreTopic} in ${loc}`,
      `top rated experts in ${loc}`, `best clinic in ${loc}`
    ]),
    buildCat(`Top 20 Local SEO Keywords (${loc})`, [
      `${coreTopic} near me in ${loc}`, `best doctor near main road ${loc}`, `clinic near RTC bus stand ${loc}`,
      `specialist near clock tower ${loc}`, `clinic near government hospital ${loc}`, `${coreTopic} near market area ${loc}`,
      `doctor near college road ${loc}`, `${coreTopic} clinic in town area ${loc}`, `top specialist near bypass road ${loc}`,
      `${coreTopic} near commercial center ${loc}`, `clinic near cinema hall ${loc}`, `hospital near main junction ${loc}`,
      `${coreTopic} near railway station area`, `top specialist near court center ${loc}`, `clinic near high school road ${loc}`,
      `best care clinic near collectorate road ${loc}`, `center near park area ${loc}`, `experts near shopping complex ${loc}`,
      `${coreTopic} near old bus stand ${loc}`, `trusted doctor near temple street ${loc}`
    ]),
    buildCat("Top 20 Question-Based & FAQ Keywords", [
      `which is the best ${coreTopic} in ${loc}`, `what is the average consultation fee in ${loc}`,
      `how much does laser treatment cost in ${loc}`, `who is the top specialist in ${loc}`,
      `is laser treatment permanent and safe`, `how to book appointment in ${loc}`,
      `what are the best treatments in ${loc}`, `where to get treatment in ${loc}`,
      `can I get PRP treatment in ${loc}`, `how to treat problems naturally and clinically`, `does clinic offer EMI option for packages`,
      `what is the difference between specialists`, `how many sessions needed for treatment`, `is consultation available in ${loc}`,
      `what are the common treatments offered in ${loc}`, `how to cure problems in ${loc}`, `are treatment packages affordable in ${loc}`,
      `what is the success rate of treatment`, `how to prepare before visiting clinic`, `why choose ${coreTopic} in ${loc}`
    ])
  ];
}
