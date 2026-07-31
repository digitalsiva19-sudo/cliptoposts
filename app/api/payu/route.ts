import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { amount, firstname, email, phone, productinfo } = await req.json();

    const merchantKey = process.env.PAYU_MERCHANT_KEY;
    const merchantSalt = process.env.PAYU_MERCHANT_SALT;

    if (!merchantKey || !merchantSalt) {
      return NextResponse.json(
        { success: false, error: "Missing PayU environment variables in Vercel" },
        { status: 400 }
      );
    }

    const txnid = "tx_" + Date.now();
    const surl = "https://cliptoposts.in/dashboard"; 
    const furl = "https://cliptoposts.in"; 
    const formattedAmount = Number(amount).toFixed(2);

    const hashSequence = `${merchantKey}|${txnid}|${formattedAmount}|${productinfo}|${firstname}|${email}|||||||||||${merchantSalt}`;
    const hash = crypto.createHash("sha512").update(hashSequence).digest("hex");

    return NextResponse.json({
      success: true,
      payuData: {
        key: merchantKey,
        txnid,
        amount: formattedAmount,
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
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
