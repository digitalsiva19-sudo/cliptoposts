import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, firstname, email, phone, productinfo } = body;

    const merchantKey = process.env.PAYU_MERCHANT_KEY;
    const merchantSalt = process.env.PAYU_MERCHANT_SALT;

    if (!merchantKey || !merchantSalt) {
      return NextResponse.json(
        { success: false, error: "PayU keys missing in Vercel Environment Variables" },
        { status: 400 }
      );
    }

    const txnid = "tx_" + Date.now();
    const surl = "https://cliptoposts.in"; 
    const furl = "https://cliptoposts.in"; 

    // PayU Hash Generation
    const hashSequence = `${merchantKey}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${merchantSalt}`;
    const hash = crypto.createHash("sha512").update(hashSequence).digest("hex");

    return NextResponse.json({
      success: true,
      payuData: {
        key: merchantKey,
        txnid,
        amount,
        productinfo,
        firstname,
        email,
        phone,
        surl,
        furl,
        hash,
        action: "https://secure.payu.in/_payment",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
