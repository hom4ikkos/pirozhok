import { NextResponse } from 'next/server';

const DEFAULT_ORIGINS = [
  'https://hom4ikkos.github.io',
  'http://localhost:3000',
  'http://localhost:5173',
];

function allowedOrigins() {
  const extra = String(process.env.FRONTEND_ORIGIN || '')
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);
  return new Set([...DEFAULT_ORIGINS, ...extra]);
}

function corsHeaders(response, origin) {
  if (origin && allowedOrigins().has(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Vary', 'Origin');
  }
  response.headers.set('Access-Control-Allow-Methods', 'GET,POST,PATCH,PUT,DELETE,OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Max-Age', '86400');
  return response;
}

export function middleware(request) {
  if (!request.nextUrl.pathname.startsWith('/api/')) return NextResponse.next();
  const origin = request.headers.get('origin');
  if (request.method === 'OPTIONS') {
    return corsHeaders(new NextResponse(null, { status: 204 }), origin);
  }
  return corsHeaders(NextResponse.next(), origin);
}

export const config = {
  matcher: '/api/:path*',
};
