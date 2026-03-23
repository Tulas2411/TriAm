import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function middleware(request) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // BẢO MẬT: Nếu vào /dashboard mà chưa có user -> Đá về trang login bí mật
  // Nếu có user nhưng không phải listener -> Đá về homepage
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    if (!user) {
      return NextResponse.redirect(new URL("/cong-bi-mat", request.url));
    } else if (user.user_metadata?.role !== 'listener') {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Nếu đã login mà cố vào trang login quản trị -> Đá vào dashboard
  if (request.nextUrl.pathname.startsWith("/cong-bi-mat") && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  
  // BẢO MẬT: Nếu vào /pricing mà chưa có user -> Đá về trang login chung
  if (request.nextUrl.pathname.startsWith("/pricing") && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Ngăn user đã login vào lại trang đăng ký / đăng nhập
  if ((request.nextUrl.pathname.startsWith("/login") || request.nextUrl.pathname.startsWith("/register")) && user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/cong-bi-mat", "/pricing/:path*", "/login", "/register"],
};
