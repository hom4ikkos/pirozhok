import { db } from '@/lib/db'; import { requireRole } from '@/lib/auth'; import { ok,fail,apiError } from '@/lib/api';
export async function GET(){try{await requireRole(['admin']); return ok({videos:db.prepare(`SELECT v.id,v.title,v.kind,v.created_at,u.username author_username FROM videos v JOIN users u ON u.id=v.author_id ORDER BY v.id DESC`).all()});}catch(e){return apiError(e)}}
export async function DELETE(req){try{await requireRole(['admin']); const {id}=await req.json(); db.prepare('DELETE FROM videos WHERE id=?').run(id); return ok({ok:true});}catch(e){return apiError(e)}}
