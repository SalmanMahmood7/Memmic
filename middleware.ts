import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = ["/investor", "/admin", "/manager", "/portal"];
const publicRoutes = ["/signin", "/signup"];

function isPortalRole(role: string): boolean {
  return role.endsWith("_client");
}

function getRequiredRole(pathname: string): string {
  if (pathname.startsWith("/investor")) return "investor";
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/manager")) return "manager";
  if (pathname.startsWith("/portal")) return "portal";
  return "";
}

function normalizeRole(role: string): string {
  const lower = role.toLowerCase();
  if (lower === "invester") return "investor";
  return lower;
}

function panelPathForRole(role: string | null): string {
  if (!role) return "/";
  const normalized = normalizeRole(role);
  switch (normalized) {
    case "manager":
      return "/manager";
    case "admin":
      return "/admin";
    case "investor":
      return "/investor";
    case "evaluation_client":
    case "investment_client":
    case "marketplace_client":
    case "management_client":
      return "/portal";
    default:
      return "/";
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userCookie = request.cookies.get("memmic_user");
  const isAuthenticated = !!userCookie;
  const userRole = userCookie?.value
    ? normalizeRole(JSON.parse(decodeURIComponent(userCookie.value)).role)
    : null;

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.includes(pathname);

  if (isProtectedRoute && !isAuthenticated) {
    const signInUrl = new URL("/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (isProtectedRoute && isAuthenticated && userRole) {
    const requiredRole = getRequiredRole(pathname);

    if (requiredRole === "portal") {
      // Any client portal role can visit any /portal/* route; the backend
      // enforces which services the account actually has access to.
      if (!isPortalRole(userRole)) {
        const redirectUrl = new URL(panelPathForRole(userRole), request.url);
        return NextResponse.redirect(redirectUrl);
      }
    } else if (userRole !== requiredRole) {
      const redirectUrl = new URL(panelPathForRole(userRole), request.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  if (isPublicRoute && isAuthenticated && userRole) {
    const redirectUrl = new URL(panelPathForRole(userRole), request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};