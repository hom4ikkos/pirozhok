import { db } from '@/lib/db';
import { verifyPassword, createSession } from '@/lib/auth';
import { ok, fail, apiError } from '@/lib/api';

export async function POST(req){
  try{
    const { login, password } = await req.json();
    const normalized = String(login || '').trim();
    const user = db.prepare('SELECT * FROM users WHERE email=? OR username=?').get(normalized.toLowerCase(), normalized);
    if(!user || !verifyPassword(password || '', user.password_hash)) return fail('Invalid login or password', 401);
    const token = await createSession(user.id);
    return ok({
      ok: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.display_name,
        avatarUrl: user.avatar_url,
        role: user.role,
      },
    });
  }catch(e){ return apiError(e); }
}
