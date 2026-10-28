import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { ok, fail, apiError } from '@/lib/api';

export async function POST(req) {
  try {
    const u = await requireUser();
    const { username } = await req.json();
    const other = db.prepare('SELECT id,username FROM users WHERE username=?').get(String(username || '').replace(/^@/, ''));
    if (!other || other.id === u.id) return fail('User not found', 404);

    const existing = db.prepare(`
      SELECT * FROM friend_requests
      WHERE (sender_id=? AND receiver_id=?) OR (sender_id=? AND receiver_id=?)
      ORDER BY id DESC LIMIT 1
    `).get(u.id, other.id, other.id, u.id);

    if (existing?.status === 'accepted') return fail('Already friends', 409);
    if (existing?.status === 'pending') {
      if (existing.sender_id === other.id) return fail('This user already sent you a request', 409);
      return fail('Request already pending', 409);
    }
    if (existing) db.prepare('DELETE FROM friend_requests WHERE id=?').run(existing.id);

    db.prepare("INSERT INTO friend_requests(sender_id,receiver_id,status) VALUES (?,?,'pending')").run(u.id, other.id);
    return ok({ ok: true }, 201);
  } catch (e) { return apiError(e); }
}
