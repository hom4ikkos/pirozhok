import { db } from '@/lib/db';

export function getVideo(videoId, viewerId = 0) {
  return db.prepare(`
    SELECT v.*, c.name AS category_name,
      u.username AS author_username, u.display_name AS author_name, u.avatar_url AS author_avatar,
      COALESCE(SUM(CASE WHEN r.value=1 THEN 1 ELSE 0 END),0) AS likes,
      COALESCE(SUM(CASE WHEN r.value=-1 THEN 1 ELSE 0 END),0) AS dislikes,
      MAX(CASE WHEN r.user_id=? THEN r.value ELSE 0 END) AS my_reaction
    FROM videos v
    JOIN users u ON u.id=v.author_id
    LEFT JOIN categories c ON c.id=v.category_id
    LEFT JOIN reactions r ON r.video_id=v.id
    WHERE v.id=?
    GROUP BY v.id
  `).get(viewerId, videoId);
}

export function listVideos({ kind='long', categoryId=null, viewerId=0, limit=50 }={}) {
  let where = 'WHERE v.kind=?';
  const params = [viewerId, kind];
  if (categoryId) { where += ' AND v.category_id=?'; params.push(categoryId); }
  params.push(limit);
  return db.prepare(`
    SELECT v.*, c.name AS category_name,
      u.username AS author_username, u.display_name AS author_name, u.avatar_url AS author_avatar,
      COALESCE(SUM(CASE WHEN r.value=1 THEN 1 ELSE 0 END),0) AS likes,
      COALESCE(SUM(CASE WHEN r.value=-1 THEN 1 ELSE 0 END),0) AS dislikes,
      MAX(CASE WHEN r.user_id=? THEN r.value ELSE 0 END) AS my_reaction
    FROM videos v
    JOIN users u ON u.id=v.author_id
    LEFT JOIN categories c ON c.id=v.category_id
    LEFT JOIN reactions r ON r.video_id=v.id
    ${where}
    GROUP BY v.id
    ORDER BY datetime(v.created_at) DESC
    LIMIT ?
  `).all(...params);
}

export function areFriends(a,b) {
  return !!db.prepare(`SELECT 1 FROM friend_requests WHERE status='accepted' AND ((sender_id=? AND receiver_id=?) OR (sender_id=? AND receiver_id=?))`).get(a,b,b,a);
}
