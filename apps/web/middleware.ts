import { NextResponse } from 'next/server';

export function middleware() {
  // At the moment, we let all requests pass
  // Language detection is done on the client side
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    '/((?!_next|api|favicon.ico).*)',
  ],
};
