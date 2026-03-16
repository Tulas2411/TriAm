import { NextResponse } from "next/server";
import { sortObject, createHmacSha512 } from "@/utils/vnpay";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const searchParams = url.searchParams;
    
    let vnp_Params = {};
    for (const [key, value] of searchParams.entries()) {
      vnp_Params[key] = value;
    }

    const secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);
    const secretKey = process.env.VNP_HASH_SECRET || "";
    
    const signData = new URLSearchParams(vnp_Params).toString();
    const checkSum = createHmacSha512(secretKey, signData);

    const baseURL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    if (secureHash === checkSum) {
      // Valid signature
      const responseCode = vnp_Params['vnp_ResponseCode'];
      if (responseCode === '00') {
        // Payment success
        const orderId = vnp_Params['vnp_TxnRef']; // Contains userId_timestamp
        
        // We update the user's metadata to mark as premium
        // Assuming the user is still logged in and the browser sends the cookie
        const cookieStore = await cookies();
        const supabase = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          {
            cookies: {
              getAll() { return cookieStore.getAll(); },
              setAll(cookiesToSet) {
                try {
                  cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
                } catch (error) {}
              },
            },
          }
        );

        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Update user's metadata
          await supabase.auth.updateUser({
            data: { is_premium: true }
          });
          
          // Redirect to a success page or back to home
          return NextResponse.redirect(`${baseURL}/?payment=success`);
        } else {
          // If the cookie is somehow missing, we wouldn't be able to update securely without a service role key.
          // Ideally, we'd use a service role key here to update the user based on the TxnRef user ID prefix.
          console.error("Payment successful but user session not found to update.");
          return NextResponse.redirect(`${baseURL}/?payment=success_but_unlinked`);
        }
      } else {
        // Payment failed or canceled
        return NextResponse.redirect(`${baseURL}/pricing?error=payment_failed`);
      }
    } else {
      // Invalid signature
      return NextResponse.redirect(`${baseURL}/pricing?error=invalid_signature`);
    }
  } catch (error) {
    console.error("VNPay Return Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
