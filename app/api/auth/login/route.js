import { db } from '@/lib/db';
import { verifyPassword, createSession } from '@/lib/auth';
import { ok, fail, apiError } from '@/lib/api';
export async function POST(req){
  try{
    const { login, password } = await req.json();
    const user = db.prepare('SELECT * FROM users WHERE email=? OR username=?').get(String(login||'').toLowerCase(), String(login||''));
    if(!user || !verifyPassword(password||'', user.password_hash)) return fail('Invalid login or password', 401);
    await createSession(user.id);
    return ok({ ok:true });
  }catch(e){ return apiError(e); }
}
