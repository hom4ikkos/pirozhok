import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { ok, fail, apiError } from '@/lib/api';
export async function POST(req,{params}){ try{const u=await requireUser(); const {id}=await params; const {folderId}=await req.json(); const f=db.prepare('SELECT id FROM saved_folders WHERE id=? AND user_id=?').get(folderId,u.id); if(!f) return fail('Folder not found',404); db.prepare('INSERT OR IGNORE INTO saved_videos(folder_id,video_id) VALUES (?,?)').run(folderId,id); return ok({ok:true});}catch(e){return apiError(e)} }
export async function DELETE(req,{params}){ try{const u=await requireUser(); const {id}=await params; const {searchParams}=new URL(req.url); const folderId=Number(searchParams.get('folderId')); db.prepare('DELETE FROM saved_videos WHERE folder_id IN (SELECT id FROM saved_folders WHERE user_id=? AND id=?) AND video_id=?').run(u.id,folderId,id); return ok({ok:true});}catch(e){return apiError(e)} }
