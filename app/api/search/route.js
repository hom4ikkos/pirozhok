import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { ok } from '@/lib/api';

export async function GET(req) {
  const viewer = await getCurrentUser();
  const q = (new URL(req.url).searchParams.get('q') || '').trim();
  if (!q) return ok({ videos: [], users: [] });
  const like = `%${q.slice(0, 80)}%`;
  const videos = db.prepare(`
    SELECT v.id,v.title,v.thumbnail_url,v.kind,v.duration_seconds,v.views,v.created_at,
           u.username AS author_username,u.display_name AS author_name
    FROM videos v JOIN users u ON u.id=v.author_id
    WHERE v.title LIKE ? OR v.description LIKE ? OR u.username LIKE ? OR u.display_name LIKE ?
    ORDER BY datetime(v.created_at) DESC LIMIT 30
  `).all(like, like, like, like);
  const users = db.prepare(`
    SELECT id,username,display_name,avatar_url,role,
      CASE WHEN id=? THEN 1 ELSE 0 END AS is_me
    FROM users
    WHERE username LIKE ? OR display_name LIKE ?
    ORDER BY CASE WHEN username=? THEN 0 ELSE 1 END, display_name
    LIMIT 20
  `).all(viewer?.id || 0, like, like, q.replace(/^@/, ''));
  return ok({ videos, users });
}
