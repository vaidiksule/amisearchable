import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  const url = request.nextUrl;
  // Polar (and other) webhooks must not hit auth session middleware.
  if (url.pathname.startsWith("/api/webhooks/") || url.pathname.startsWith("/api/webhook/")) {
    return NextResponse.next();
  }

  if (url.pathname === "/" && url.searchParams.has("code")) {
    const dest = url.clone();
    dest.pathname = "/auth/callback";
    return NextResponse.redirect(dest);
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|llms.txt|llms-full.txt|icon|apple-icon|opengraph-image|api/webhooks/|api/webhook/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
