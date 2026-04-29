import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const AUTH_HINT_KEY = "clinic_auth_hint";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const authHint = request.cookies.get(AUTH_HINT_KEY)?.value;
  const isAuthenticatedHint = authHint === "authenticated";
  const isLoginPage = pathname === "/login";

  if (!isAuthenticatedHint && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthenticatedHint && isLoginPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
