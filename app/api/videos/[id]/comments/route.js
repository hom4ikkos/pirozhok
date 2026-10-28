import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { ok, fail, apiError } from '@/lib/api';
export async function GET(req,{params}){ const {id}=await params; return ok({comments:db.prepare(`SELECT c.id,c.body,c.created_at,u.username,u.display_name,u.avatar_url FROM comments c JOIN users u ON u.id=c.user_id WHERE c.video_id=? ORDER BY datetime(c.created_at) DESC`).all(id)}); }
export async function POST(req,{params}){
  try{ const user=await requireUser(); const {id}=await params; const {body}=await req.json(); if(!body?.trim()) return fail('Comment is empty'); db.prepare('INSERT INTO comments(user_id,video_id,body) VALUES (?,?,?)').run(user.id,id,body.trim().slice(0,1000)); return GET(req,{params:Promise.resolve({id})}); }catch(e){ return apiError(e); }
}
