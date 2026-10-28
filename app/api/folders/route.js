import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { ok, fail, apiError } from '@/lib/api';
export async function GET(){ try{const u=await requireUser(); return ok({folders:db.prepare(`SELECT f.*,COUNT(s.video_id) count FROM saved_folders f LEFT JOIN saved_videos s ON s.folder_id=f.id WHERE f.user_id=? GROUP BY f.id ORDER BY datetime(f.created_at) DESC`).all(u.id)});}catch(e){return apiError(e)} }
export async function POST(req){ try{const u=await requireUser(); const {name}=await req.json(); if(!name?.trim()) return fail('Folder name required'); const info=db.prepare('INSERT INTO saved_folders(user_id,name) VALUES (?,?)').run(u.id,name.trim().slice(0,50)); return ok({id:info.lastInsertRowid},201);}catch(e){ if(String(e).includes('UNIQUE')) return fail('Folder already exists',409); return apiError(e)} }
