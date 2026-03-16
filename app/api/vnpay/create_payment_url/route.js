import { NextResponse } from "next/server";
import { sortObject, createHmacSha512 } from "@/utils/vnpay";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req) {
  try {
    // Authenticate user to link payment
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
            } catch (error) {}
          },
        },
      }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const amount = body.amount || 50000;
    const bankCode = body.bankCode || "";
    
    const tmnCode = process.env.VNP_TMN_CODE || "";
    const secretKey = process.env.VNP_HASH_SECRET || "";
    const vnpUrl = process.env.VNP_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    const baseURL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const returnUrl = `${baseURL}/api/vnpay/vnpay_return`;

    if (!tmnCode || !secretKey) {
        console.warn("VNP credentials are not configured properly in .env.local.");
    }

    const date = new Date();
    // Incorporate User ID into TxnRef to easily identify user on return
    // TxnRef max length is 50, user.id is 36 chars.
    const orderId = `${user.id}_${date.getTime()}`; 
    
    // Format: YYYYMMDDHHmmss
    const createDate = 
      date.getFullYear() +
      ("0" + (date.getMonth() + 1)).slice(-2) +
      ("0" + date.getDate()).slice(-2) +
      ("0" + date.getHours()).slice(-2) +
      ("0" + date.getMinutes()).slice(-2) +
      ("0" + date.getSeconds()).slice(-2);
      
    const ipAddr = req.headers.get("x-forwarded-for") || "127.0.0.1";
    
    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    vnp_Params['vnp_Locale'] = 'vn';
    vnp_Params['vnp_CurrCode'] = 'VND';
    vnp_Params['vnp_TxnRef'] = orderId;
    vnp_Params['vnp_OrderInfo'] = 'Thanh toan Premium';
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = amount * 100;
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;
    if (bankCode !== null && bankCode !== '') {
        vnp_Params['vnp_BankCode'] = bankCode;
    }

    vnp_Params = sortObject(vnp_Params);
    
    const signData = new URLSearchParams(vnp_Params).toString();
    const hmac = createHmacSha512(secretKey, signData);
    
    vnp_Params['vnp_SecureHash'] = hmac;
    
    const paymentUrl = vnpUrl + '?' + new URLSearchParams(vnp_Params).toString();

    return NextResponse.json({ url: paymentUrl });
  } catch (error) {
    console.error("VNPay Error:", error);
    return NextResponse.json({ message: "Server Error", error: error.message }, { status: 500 });
  }
}
