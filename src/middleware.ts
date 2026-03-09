import { type NextRequest, NextResponse } from "next/server";

const publicPaths = ["/", "/login", "/register", "/signup", "/auth", "/auth/callback", "/api/webhooks", "/s/"];

function isPublicPath(pathname: string): boolean {
  return publicPaths.some(
    (path) => pathname === path || pathname.startsWith(path)
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths and static assets
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Skip auth check if Supabase is not configured (dev mode)
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return NextResponse.next();
  }

  // Dynamic import to avoid errors when env vars missing
  const { updateSession } = await import("@/lib/supabase/middleware");
  const { supabaseResponse, user } = await updateSession(request);

  // Protected routes — redirect unauthenticated users
  const protectedPaths = ["/dashboard", "/surveys", "/delphi", "/templates", "/integrations", "/ai-studio", "/settings", "/admin"];
  const isProtected = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  if (isProtected && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
