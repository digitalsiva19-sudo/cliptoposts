import { NextResponse } from "next/server";
import { supabase } from "../../../../../lib/supabase";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const status = formData.get("status");
    const email = formData.get("email") as string;
    const txnid = formData.get("txnid");

    if (status === "success" && email) {
      // Update user plan to Pro & Unlimited Credits in Supabase
      await supabase
        .from("users")
        .update({ plan: "Pro Plan (₹399/mo)", credits: 999999 })
        .eq("email", email);

      // Redirect to Dashboard with success message
      return NextResponse.redirect(
        new URL("/dashboard?payment=success", req.url),
        303
      );
    }

    return NextResponse.redirect(
      new URL("/dashboard?payment=failed", req.url),
      303
    );
  } catch (error) {
    return NextResponse.redirect(
      new URL("/dashboard?payment=error", req.url),
      303
    );
  }
}
