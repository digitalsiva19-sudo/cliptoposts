import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const status = formData.get("status");
    const email = formData.get("email") as string;

    if (status === "success" && email) {
      await supabase
        .from("users")
        .update({ plan: "Pro Plan (₹399/mo)", credits: 999999 })
        .eq("email", email);

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
