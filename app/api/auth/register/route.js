import { db } from '@/lib/db';
import { hashPassword, createSession } from '@/lib/auth';
import { ok, fail, apiError } from '@/lib/api';

export async function POST(req){
  try{
    const { email, username, displayName, password } = await req.json();
    if(!email || !username || !displayName || !password) return fail('All fields are required');
    if(!/^[a-zA-Z0-9_]{3,24}$/.test(username)) return fail('Username must be 3-24 characters: letters, numbers, underscore');
    if(password.length < 6) return fail('Password must be at least 6 characters');
    const exists = db.prepare('SELECT id FROM users WHERE email=? OR username=?').get(email.trim().toLowerCase(), username.trim());
    if(exists) return fail('Email or username already exists', 409);
    const info = db.prepare('INSERT INTO users(email,username,display_name,password_hash) VALUES (?,?,?,?)').run(email.trim().toLowerCase(), username.trim(), displayName.trim(), hashPassword(password));
    db.prepare("INSERT INTO saved_folders(user_id,name) VALUES (?, 'Saved')").run(info.lastInsertRowid);
    await createSession(info.lastInsertRowid);
    return ok({ ok:true }, 201);
  }catch(e){ return apiError(e); }
}
