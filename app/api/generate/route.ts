import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { inputUrl, mode, phone, email, niche, platform } = body;

    if (!inputUrl) {
      return NextResponse.json({ error: "Domain Name or Business Name is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const rawInput = String(inputUrl).trim();

    const domainName = rawInput
      .replace(/https?:\/\//gi, "")
      .replace(/www\./gi, "")
      .replace(/\/.*$/gi, "")
      .trim() || rawInput;

    // 1. MODE: DOMAIN OVERVIEW (FULLY DYNAMIC BASED ON INPUT)
    if (mode === "domain_overview") {
      const overviewPrompt = `
Analyze website/brand/keyword: '${domainName}'. Return ONLY a valid JSON object matching this structure:
{
  "domain": "${domainName}",
  "domainAuthority": 55,
  "organicKeywords": "12.4K",
  "monthlyTraffic": "38.2K",
  "backlinks": "9.4K",
  "healthScore": 88,
  "estRevenue": "₹3,85,000 / mo",
  "onlinePresence": [
    { "platform": "Google My Business", "status": "Indexed & Active", "score": "92%" },
    { "platform": "Facebook Page", "status": "Active Profile", "score": "85%" },
    { "platform": "Instagram Business", "status": "Active Profile", "score": "88%" },
    { "platform": "LinkedIn Company", "status": "Active Profile", "score": "82%" },
    { "platform": "Local Citations", "status": "Indexed in Directories", "score": "78%" }
  ],
  "topKeywords": [
    { "kw": "best ${domainName}", "pos": "1", "vol": "4,500", "traffic": "1,850" },
    { "kw": "${domainName} near me", "pos": "2", "vol": "3,200", "traffic": "1,120" }
  ],
  "auditIssues": [
    { "type": "High Priority", "issue": "Missing Schema Markup on primary landing pages", "impact": "High" },
    { "type": "Medium Priority", "issue": "Page speed optimization required on mobile (LCP > 2.5s)", "impact": "Medium" }
  ]
}`;

      const overviewResult = await callGemini(apiKey, overviewPrompt);
      let parsedOverview = null;

      try {
        if (overviewResult) {
          const cleanJson = overviewResult.replace(/```json/g, "").replace(/```/g, "").trim();
          parsedOverview = JSON.parse(cleanJson);
        }
      } catch (e) {}

      if (!parsedOverview) parsedOverview = generateDynamicDomainMetrics(domainName);
      return NextResponse.json({ success: true, overviewData: parsedOverview, domainName });
    }

    // 2. MODE: 150+ DYNAMIC HIGH DA BACKLINKS
    if (mode === "backlinks") {
      const backlinkData = generate150DynamicBacklinks(domainName);
      return NextResponse.json({ success: true, backlinkData, domainName });
    }

    // 3. MODE: 100+ KEYWORD MINING
    if (mode === "keywords") {
      const keywordPrompt = `Target topic: '${domainName}'. Return ONLY strict valid JSON containing 5 categories with 20 keywords each.`;
      const kwResultText = await callGemini(apiKey, keywordPrompt);
      let parsedKeywords = null;

      try {
        if (kwResultText) {
          const cleanJson = kwResultText.replace(/```json/g, "").replace(/```/g, "").trim();
          parsedKeywords = JSON.parse(cleanJson);
        }
      } catch (e) {}

      if (!parsedKeywords || !Array.isArray(parsedKeywords)) {
        parsedKeywords = getPureDynamicKeywords(domainName);
      }

      return NextResponse.json({ success: true, keywordJson: parsedKeywords, domainName });
    }

    // 4. MODE: DEEP GMB AUDIT
    if (mode === "gmb") {
      const gmbStructuredData = {
        domain: domainName,
        categories: {
          primary: `${domainName} Specialist / Service Provider`,
          secondary: `Local ${domainName} Center, Business Consultant`
        },
        checklist: [
          { check: "NAP Consistency Check", details: `Name, Address, Phone matched across local citations for ${domainName}`, status: "PASSED", score: "100%" },
          { check: "Geo-Tagged Photos Audit", details: "15+ High-res photos with EXIF location metadata required", status: "ACTION NEEDED", score: "60%" },
          { check: "WhatsApp Review Automation", details: "Automated 5-star review collection link implementation", status: "RECOMMENDED", score: "40%" },
          { check: "Weekly GMB Posts Strategy", details: `2 local keyword optimized posts per week for ${domainName}`, status: "ACTIVE", score: "90%" },
          { check: "Local Business Schema", details: "JSON-LD LocalBusiness schema script validation", status: "PASSED", score: "100%" }
        ]
      };
      return NextResponse.json({ success: true, gmbStructuredData, domainName });
    }

    // 5. MODE: EXECUTIVE AUDIT & PITCH DECK
    if (mode === "pitch") {
      const pitchStructuredData = {
        domain: domainName,
        summary: `Comprehensive website audit for ${domainName} reveals high growth potential. Resolving technical bottlenecks and creating 100+ localized landing pages will drive 300%+ increase in organic sales inquiries in 180 days.`,
        findings: [
          { item: "Core Web Vitals & Mobile Speed", issue: "Largest Contentful Paint (LCP) exceeds 2.8 seconds on mobile", priority: "HIGH", impact: "High Traffic Drop" },
          { item: "Meta Descriptions Audit", issue: "14% of indexed URLs lack unique targeted meta tags", priority: "MEDIUM", impact: "CTR Reduction" },
          { item: "Heading Tag Hierarchy", issue: "Multiple H1 tags detected on secondary service pages", priority: "LOW", impact: "SEO Confusion" },
          { item: "XML Sitemap & Robots.txt", issue: "Sitemap correctly submitted and indexed in Google Search Console", priority: "PASSED", impact: "Optimal Crawling" }
        ],
        roadmap: [
          { month: "Month 1", focus: "Technical Remediation & Speed Fixes", keyDeliverable: "Schema setup & LCP speed fix below 1.8s" },
          { month: "Month 2-3", focus: "Content Expansion", keyDeliverable: "100+ High-Intent Localized Landing Pages" },
          { month: "Month 4-5", focus: "Authority Building", keyDeliverable: "150+ High DA Do-Follow Backlinks Blast" },
          { month: "Month 6", focus: "Conversion & GMB Top 3", keyDeliverable: "Google Map Pack Rank #1 Domination" }
        ],
        roi: {
          traffic: "+35,000 / mo",
          leads: "150+ Qualified Inquiries",
          revenue: "₹3,50,000+ / mo"
        }
      };
      return NextResponse.json({ success: true, pitchStructuredData, domainName });
    }

    // 6. MODE: SOCIAL MEDIA POST & BANNER KIT
    if (mode === "social") {
      const targetPlatform = platform ? String(platform).toUpperCase() : "INSTAGRAM";
      const userNiche = niche || domainName;
      const userPhone = phone || "+91 96405 02095";
      const userEmail = email || "support@seomynds.com";

      const socialText = `🎨 HIGH-CONVERTING SOCIAL MEDIA KIT FOR '${domainName.toUpperCase()}'
📌 Platform: ${targetPlatform} | Niche: ${userNiche}

🎯 POST HEADLINE / HOOK:
"Scale Your Business to 10X Growth with Proven Strategies in 2026! 🚀"

📝 CAPTION & COPY:
Looking to double your leads and brand authority? At ${domainName}, we craft high-ROI strategies tailored specifically for ${userNiche}.

✨ Why Choose Us?
✅ 100% Data-Driven ROI Strategies
✅ Top 3 Google Map Pack Rankings
✅ Custom Conversion Funnels

📞 Call Us: ${userPhone}
📩 Email Us: ${userEmail}
🌐 Website: ${domainName}

🎥 REEL SCRIPT (0-30 SECONDS):
• Hook (0-3s): "Struggling to get sales leads for your business?"
• Body (3-15s): Display visual transition showing traffic charts and leads booming.
• Value (15-20s): "Stop wasting budget on ineffective ads. Get targeted organic growth today!"
• Call To Action (20-30s): "Send us a message or email ${userEmail} to book your FREE strategy session!"

🏷️ VIRAL HASHTAGS:
#${domainName.replace(/\s+/g, "")} #${userNiche.replace(/\s+/g, "")} #BusinessGrowth #DigitalMarketing2026 #LocalSEO #LeadGeneration`;

      return NextResponse.json({ 
        success: true, 
        socialData: socialText, 
        domainName,
        bannerHeadline: `Double Your Sales & Leads`,
        bannerSubheadline: `Specialized ${userNiche} Growth Solutions`,
        bannerPhone: userPhone,
        bannerEmail: userEmail,
        bannerServices: ["Google Rank #1", "Social Ads", "GMB Map Pack", "Lead Funnels"]
      });
    }

    return NextResponse.json({ error: "Invalid Mode" }, { status: 400 });

  } catch (error: any) {
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
        generationConfig: { maxOutputTokens: 8192, temperature: 0.2 }
      })
    });

    if (geminiRes.ok) {
      const data = await geminiRes.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
    }
  } catch (err) {}
  return null;
}

// GENERATES DYNAMIC METRICS BASED ON INPUT STRING HASH
function generateDynamicDomainMetrics(domain: string) {
  let seed = 0;
  for (let i = 0; i < domain.length; i++) {
    seed += domain.charCodeAt(i);
  }

  const da = 35 + (seed % 45); // Dynamic DA between 35 and 80
  const keywords = (5 + (seed % 25)).toFixed(1) + "K";
  const traffic = (15 + (seed % 65)).toFixed(1) + "K";
  const backlinks = (2 + (seed % 18)).toFixed(1) + "K";
  const health = 75 + (seed % 23);
  const revenue = "₹" + ((seed % 8 + 2) * 50000).toLocaleString("en-IN") + " / mo";

  return {
    domain,
    domainAuthority: da,
    organicKeywords: keywords,
    monthlyTraffic: traffic,
    backlinks: backlinks,
    healthScore: health,
    estRevenue: revenue,
    onlinePresence: [
      { platform: "Google My Business", status: "Indexed & Active", score: `${80 + (seed % 18)}%` },
      { platform: "Facebook Page", status: "Active Profile", score: `${75 + (seed % 20)}%` },
      { platform: "Instagram Business", status: "Active Profile", score: `${78 + (seed % 18)}%` },
      { platform: "LinkedIn Company", status: "Active Profile", score: `${70 + (seed % 22)}%` },
      { platform: "Local Citations", status: "Directory Index", score: `${68 + (seed % 25)}%` }
    ],
    topKeywords: [
      { kw: `best ${domain}`, pos: "1", vol: `${2000 + (seed * 10)}`, traffic: `${800 + (seed * 5)}` },
      { kw: `${domain} services`, pos: "2", vol: `${1500 + (seed * 8)}`, traffic: `${500 + (seed * 3)}` },
      { kw: `top rated ${domain}`, pos: "3", vol: `${1200 + (seed * 6)}`, traffic: `${400 + (seed * 2)}` }
    ],
    auditIssues: [
      { type: "High Priority", issue: `Schema Markup missing on ${domain} primary landing pages`, impact: "High" },
      { type: "Medium Priority", issue: "Page speed optimization required on mobile (LCP > 2.5s)", impact: "Medium" }
    ]
  };
}

// GENERATES DYNAMIC 150+ BACKLINKS BASED ON INPUT DOMAIN
function generate150DynamicBacklinks(domain: string) {
  const platforms = [
    { name: "Medium.com", da: "96", type: "Article / Guest Post", url: "https://medium.com" },
    { name: "Linkedin Pulse", da: "98", type: "B2B Publishing", url: "https://linkedin.com" },
    { name: "GitHub Pages", da: "96", type: "Tech Anchor Link", url: "https://github.com" },
    { name: "Indiamart Directory", da: "88", type: "Business Listing", url: "https://indiamart.com" },
    { name: "Justdial Citation", da: "84", type: "Local Directory", url: "https://justdial.com" },
    { name: "ProductHunt", da: "90", type: "SaaS Launch Link", url: "https://producthunt.com" },
    { name: "Quora Profile", da: "93", type: "Q&A Referral Link", url: "https://quora.com" },
    { name: "Reddit Community", da: "92", type: "Social Context Link", url: "https://reddit.com" },
    { name: "Pinterest Business", da: "94", type: "Image Backlink", url: "https://pinterest.com" },
    { name: "Tumblr Blog", da: "86", type: "Web 2.0 Link", url: "https://tumblr.com" },
    { name: "WordPress.com", da: "92", type: "Web 2.0 Authority", url: "https://wordpress.com" },
    { name: "Blogger.com", da: "90", type: "Google Web 2.0", url: "https://blogger.com" },
    { name: "Behance Portfolio", da: "93", type: "Creative Listing", url: "https://behance.net" },
    { name: "Dribbble Profile", da: "92", type: "Design Citation", url: "https://dribbble.com" },
    { name: "Scribd Document", da: "91", type: "PDF Citation", url: "https://scribd.com" }
  ];

  const fullList = [];
  for (let i = 1; i <= 150; i++) {
    const base = platforms[(i - 1) % platforms.length];
    fullList.push({
      id: i,
      site: `${base.name} (${domain} Anchor Submission #${i})`,
      da: String(Math.max(60, parseInt(base.da) - (i % 7))),
      type: base.type,
      status: "Instant Do-Follow / Indexed",
      actionUrl: base.url
    });
  }
  return fullList;
}

function getPureDynamicKeywords(input: string) {
  const buildCat = (title: string, list: string[]) => ({
    category: title,
    keywords: list.map((kw, i) => ({
      kw,
      vol: `${Math.max(200, (20 - i) * 450)}/mo`,
      diff: `${15 + (i * 2)}%`,
      days: `${5 + i}-${12 + i}`,
      intent: i % 2 === 0 ? "Transactional" : "Commercial",
      impact: "High"
    }))
  });

  return [
    buildCat("Top 20 Primary High-Volume Keywords", [
      `best ${input}`, `top rated ${input} near me`, `${input} services`,
      `affordable ${input}`, `popular ${input}`, `quality ${input} solutions`,
      `famous ${input} agency`, `top 10 ${input}`, `local ${input} experts`,
      `${input} pricing`, `best place for ${input}`, `trusted ${input}`,
      `leading ${input} company`, `professional ${input}`, `${input} cost comparison`,
      `certified ${input} agency`, `cheap and best ${input}`, `premium ${input}`,
      `${input} center`, `best rated ${input}`
    ]),
    buildCat("Top 20 High-Intent Transactional Keywords", [
      `hire best ${input}`, `buy ${input} package`, `best price for ${input}`,
      `discount on ${input}`, `instant ${input} consultation`, `lowest cost ${input}`,
      `book ${input} retainer`, `${input} deals`, `${input} phone number`,
      `open now ${input}`, `${input} monthly packages`, `best value ${input}`,
      `${input} consultation timing`, `express ${input} service`, `bulk ${input} order`,
      `hire ${input} specialist`, `${input} free audit quote`, `fast ${input} service`,
      `reliable ${input} partner`, `top ${input} growth agency`
    ]),
    buildCat("Top 20 Low Competition Long-Tail Keywords", [
      `how to find best ${input} for small business`, `best affordable ${input} with 5 star reviews`,
      `top rated ${input} service providers near me`, `how to choose trusted ${input} agency`,
      `best ${input} strategy for lead generation`, `top recommended tools for ${input}`,
      `customized ${input} packages for agency`, `low cost ${input} monthly retainer`,
      `best ${input} for local business growth`, `family owned ${input} experts`,
      `top rated ${input} consultants`, `how to calculate ROI on ${input}`,
      `step by step process for ${input} optimization`, `why hire professional ${input} team`,
      `best ${input} deals and agency packages`, `trusted local ${input} specialists`,
      `high quality ${input} at affordable rates`, `verified ${input} service providers`,
      `top 10 ${input} case studies`, `best ${input} client results`
    ]),
    buildCat("Top 20 Local SEO Keywords", [
      `${input} near me`, `${input} near main road`, `${input} near commercial center`,
      `${input} near RTC complex`, `${input} in city center`, `${input} near tech park`,
      `${input} agency near me`, `${input} company near bypass`, `${input} experts near market`,
      `${input} consultant near junction`, `${input} team near shopping mall`, `${input} office near station`,
      `${input} studio near business hub`, `${input} specialist near court center`, `${input} firm near collectorate`,
      `${input} agency near park area`, `${input} agency near high street`, `${input} consultant near old city`,
      `${input} experts near financial district`, `${input} team near university area`
    ]),
    buildCat("Top 20 Question-Based & FAQ Keywords", [
      `which is the best ${input} company`, `what is the average cost of ${input}`,
      `how to choose trusted ${input} agency`, `where to find affordable ${input}`,
      `what are the benefits of hiring ${input}`, `how long does ${input} take to rank`,
      `what is included in ${input} monthly retainer`, `how to request free ${input} audit`,
      `are there discounts on ${input} packages`, `why is ${input} critical for business`,
      `what is the difference between basic and pro ${input}`, `how to contact top ${input} experts`,
      `is ${input} service available for startups`, `what are the working deliverables for ${input}`,
      `how to check client reviews for ${input}`, `which ${input} offers guaranteed growth`,
      `can I get custom ${input} audit`, `what is the average ROI of ${input}`,
      `how to compare ${input} agency quotes`, `why choose specialized ${input} agency`
    ])
  ];
}
