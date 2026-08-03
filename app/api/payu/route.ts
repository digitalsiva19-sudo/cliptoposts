import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { amount, planName, userEmail, userName } = await req.json();

    const txnid = "txnid_" + Math.floor(Math.random() * 1000000000);

    // PayU Payment Request Payload Data
    const payuData = {
      txnid: txnid,
      amount: amount,
      productinfo: planName || "Subscription Plan",
      firstname: userName || "Customer",
      email: userEmail || "user@example.com",
      phone: "9999999999",
      surl: "https://cliptoposts.in/dashboard?status=success",
      furl: "https://cliptoposts.in/dashboard?status=failed",
    };

    return NextResponse.json({ success: true, payuData });
  } catch (error) {
    return NextResponse.json({ error: "PayU transaction initialization failed" }, { status: 500 });
  }
}
