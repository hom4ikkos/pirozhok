import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { listVideos } from '@/lib/queries';
import { ok } from '@/lib/api';
export async function GET(req){
  const user = await getCurrentUser();
  const { searchParams } = new URL(req.url);
  const kind = searchParams.get('kind') === 'short' ? 'short' : 'long';
  const category = Number(searchParams.get('category')) || null;
  return ok({
    videos: listVideos({ kind, categoryId:category, viewerId:user?.id||0 }),
    categories: db.prepare('SELECT * FROM categories ORDER BY id').all()
  });
}
