import { db } from '@/lib/db';
import { hashPassword, createSession } from '@/lib/auth';
import { ok, fail, apiError } from '@/lib/api';

export async function POST(req){
  try{
    const { email, username, displayName, password } = await req.json();
    if(!email || !username || !displayName || !password) return fail('All fields are required');
    if(!/^[a-zA-Z0-9_]{3,24}$/.test(username)) return fail('Username must be 3-24 characters: letters, numbers, underscore');
    if(password.length < 6) return fail('Password must be at least 6 characters');
    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim();
    const cleanName = displayName.trim();
    const exists = db.prepare('SELECT id FROM users WHERE email=? OR username=?').get(cleanEmail, cleanUsername);
    if(exists) return fail('Email or username already exists', 409);
    const info = db.prepare('INSERT INTO users(email,username,display_name,password_hash) VALUES (?,?,?,?)').run(cleanEmail, cleanUsername, cleanName, hashPassword(password));
    db.prepare("INSERT INTO saved_folders(user_id,name) VALUES (?, 'Saved')").run(info.lastInsertRowid);
    const token = await createSession(info.lastInsertRowid);
    return ok({
      ok: true,
      token,
      user: {
        id: Number(info.lastInsertRowid),
        email: cleanEmail,
        username: cleanUsername,
        displayName: cleanName,
        avatarUrl: null,
        role: 'user',
      },
    }, 201);
  }catch(e){ return apiError(e); }
}
