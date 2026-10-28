import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { getVideo } from '@/lib/queries';
import { ok, fail, apiError } from '@/lib/api';
export async function POST(req,{params}){
  try{
    const user=await requireUser(); const {id}=await params; const {value}=await req.json();
    if(![-1,0,1].includes(value)) return fail('Invalid reaction');
    if(value===0) db.prepare('DELETE FROM reactions WHERE user_id=? AND video_id=?').run(user.id,id);
    else db.prepare(`INSERT INTO reactions(user_id,video_id,value) VALUES (?,?,?) ON CONFLICT(user_id,video_id) DO UPDATE SET value=excluded.value, created_at=CURRENT_TIMESTAMP`).run(user.id,id,value);
    return ok({video:getVideo(Number(id),user.id)});
  }catch(e){ return apiError(e); }
}
