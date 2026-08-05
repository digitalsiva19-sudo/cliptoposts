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
        { success: false, error: "PayU Merchant Key or Salt missing in Vercel settings" },
        { status: 400 }
      );
    }

    const txnid = `txnid_${Date.now()}`;
    const productinfo = `ClipToPosts ${String(planType).toUpperCase()} Plan`;
    const userEmail = email || "customer@example.com";
    const userName = firstname || "Customer";
    const userPhone = phone || "9640502095";

    // SHA-512 Hash Sequence: key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT
    const hashString = `${key}|${txnid}|${amount}|${productinfo}|${userName}|${userEmail}|||||||||||${salt}`;
    const hash = crypto.createHash("sha512").update(hashString).digest("hex");

    const host = req.headers.get("host") || "seomynds.com";
    const protocol = host.includes("localhost") ? "http" : "https";

    const surl = `${protocol}://${host}/dashboard?status=success`;
    const furl = `${protocol}://${host}/dashboard?status=failed`;

    return NextResponse.json({
      success: true,
      payuData: {
        key,
        txnid,
        amount: String(amount),
        productinfo,
        firstname: userName,
        email: userEmail,
        phone: userPhone,
        surl,
        furl,
        hash,
        action: "https://secure.payu.in/_payment"
      }
    });

  } catch (error: any) {
    console.error("PayU Route Error:", error);
    return NextResponse.json({ success: false, error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}
