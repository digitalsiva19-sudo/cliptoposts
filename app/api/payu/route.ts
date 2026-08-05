import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, planType, firstname, email, phone } = body;

    const key = process.env.NEXT_PUBLIC_PAYU_KEY || "";
    const salt = process.env.PAYU_SALT || "";

    if (!key || !salt) {
      return NextResponse.json(
        { error: "PayU Merchant Key or Salt missing in Vercel Environment Variables" },
        { status: 500 }
      );
    }

    // Unique Transaction ID
    const txnid = `txnid_${Date.now()}`;
    const productinfo = `ClipToPosts ${String(planType).toUpperCase()} Plan`;

    // PayU SHA-512 Hash Sequence: key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT
    const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${salt}`;
    const hash = crypto.createHash("sha512").update(hashString).digest("hex");

    // Success and Failure Redirect URLs
    const surl = `https://${req.headers.get("host")}/api/payu/response`;
    const furl = `https://${req.headers.get("host")}/api/payu/response`;

    return NextResponse.json({
      success: true,
      payuData: {
        key,
        txnid,
        amount,
        productinfo,
        firstname,
        email,
        phone: phone || "9999999999",
        surl,
        furl,
        hash,
        // Live PayU Checkout URL
        action: "https://secure.payu.in/_payment" 
      }
    });

  } catch (error: any) {
    console.error("PayU Route Error:", error);
    return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}
