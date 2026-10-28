import { NextResponse } from 'next/server';

export function ok(data, status = 200) { return NextResponse.json(data, { status }); }
export function fail(message, status = 400) { return NextResponse.json({ error: message }, { status }); }
export function apiError(err) {
  if (err?.message === 'UNAUTHORIZED') return fail('Unauthorized', 401);
  if (err?.message === 'FORBIDDEN') return fail('Forbidden', 403);
  console.error(err);
  return fail('Server error', 500);
}
