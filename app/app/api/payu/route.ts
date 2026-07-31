import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { amount, firstname, email, phone, productinfo } = await req.json();

    const merchantKey = process.env.PAYU_MERCHANT_KEY;
    const merchantSalt = process.env.PAYU_MERCHANT_SALT;

    if (!merchantKey || !merchantSalt) {
      return NextResponse.json({ error: "PayU credentials missing in Environment Variables" }, { status: 500 });
    }

    const txnid = "tx_" + Date.now();
    const surl = "https://cliptoposts.in"; // Payment success redirect URL
    const furl = "https://cliptoposts.in"; // Payment failure redirect URL

    // Hash sequence for PayU: key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT
    const hashString = `${merchantKey}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${merchantSalt}`;
    
    const hash = crypto.createHash("sha512").update(hashString).digest("hex");

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
        action: "https://secure.payu.in/_payment", // Live PayU URL
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
