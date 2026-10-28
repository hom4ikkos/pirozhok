import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { getVideo } from '@/lib/queries';
import { ok, fail, apiError } from '@/lib/api';
export async function GET(req,{params}){
  try{
    const { id } = await params; const user=await getCurrentUser();
    const video=getVideo(Number(id),user?.id||0); if(!video) return fail('Video not found',404);
    db.prepare('UPDATE videos SET views=views+1 WHERE id=?').run(id);
    video.views++;
    return ok({video});
  }catch(e){ return apiError(e); }
}
