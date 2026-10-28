import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { ok, fail, apiError } from '@/lib/api';

export async function GET(req, { params }) {
  try {
    const u = await requireUser();
    const { id } = await params;
    const folder = db.prepare('SELECT id,name,created_at FROM saved_folders WHERE id=? AND user_id=?').get(Number(id), u.id);
    if (!folder) return fail('Folder not found', 404);
    const videos = db.prepare(`
      SELECT v.id,v.title,v.thumbnail_url,v.kind,v.duration_seconds,v.views,v.created_at,
             a.username AS author_username,a.display_name AS author_name
      FROM saved_videos s
      JOIN videos v ON v.id=s.video_id
      JOIN users a ON a.id=v.author_id
      WHERE s.folder_id=?
      ORDER BY datetime(s.created_at) DESC
    `).all(folder.id);
    return ok({ folder, videos });
  } catch (e) { return apiError(e); }
}

export async function DELETE(req, { params }) {
  try {
    const u = await requireUser();
    const { id } = await params;
    const folder = db.prepare('SELECT id,name FROM saved_folders WHERE id=? AND user_id=?').get(Number(id), u.id);
    if (!folder) return fail('Folder not found', 404);
    if (folder.name === 'Saved') return fail('The default Saved folder cannot be deleted');
    db.prepare('DELETE FROM saved_folders WHERE id=? AND user_id=?').run(folder.id, u.id);
    return ok({ ok: true });
  } catch (e) { return apiError(e); }
}
