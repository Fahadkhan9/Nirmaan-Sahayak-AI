import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ACCESS_COOKIE } from "@/lib/access";

// Optional demo gate: with no ACCESS_CODE set, everyone gets in.
export function proxy(request: NextRequest) {
  const code = process.env.ACCESS_CODE;
  if (!code || request.cookies.get(ACCESS_COOKIE)?.value === code) return NextResponse.next();
  return NextResponse.redirect(new URL("/access", request.url));
}

export const config = {
  matcher: ["/((?!access|_next/static|_next/image|favicon.ico).*)"],
};
