import { db } from '@/lib/db';
import { ok } from '@/lib/api';

export async function GET() {
  const users = db.prepare('SELECT COUNT(*) AS n FROM users').get().n;
  const videos = db.prepare('SELECT COUNT(*) AS n FROM videos').get().n;
  return ok({
    ok: true,
    service: 'pirozhok-api',
    database: 'sqlite',
    users,
    videos,
    time: new Date().toISOString()
  });
}
