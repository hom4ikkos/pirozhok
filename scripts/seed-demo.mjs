import { DatabaseSync } from 'node:sqlite';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'pirozhok.db');
fs.mkdirSync(path.dirname(dbPath), { recursive: true });
const db = new DatabaseSync(dbPath);
db.exec('PRAGMA foreign_keys = ON;');

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}
const demoPassword = process.env.DEMO_PASSWORD || 'demo123';
const authors = [
  ['mira@pirozhok.demo','mira','Mira Lane'],
  ['alex@pirozhok.demo','alex','Alex North'],
  ['noah@pirozhok.demo','noah','Noah Gray'],
  ['lena@pirozhok.demo','lena','Lena Fox']
];
for (const [email,username,name] of authors) {
  const found = db.prepare('SELECT id FROM users WHERE username=?').get(username);
  if (!found) db.prepare("INSERT INTO users(email,username,display_name,password_hash,role) VALUES (?,?,?,?, 'author')").run(email,username,name,hashPassword(demoPassword));
  else db.prepare("UPDATE users SET role='author' WHERE id=?").run(found.id);
}
const cat = Object.fromEntries(db.prepare('SELECT id,name FROM categories').all().map(x=>[x.name,x.id]));
const img='https://storage.googleapis.com/gtv-videos-bucket/sample/images/';
const src={bunny:'https://www.w3schools.com/html/mov_bbb.mp4',flower:'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'};
const videos = [
  ['First Pirozhok upload','mira','Category 1','long',504,img+'BigBuckBunny.jpg',src.bunny,12000],
  ['Building something weird','alex','Category 2','long',842,img+'ElephantsDream.jpg',src.bunny,8400],
  ['Night city walk','noah','Category 3','long',2530,img+'ForBiggerEscapes.jpg',src.flower,31000],
  ['Tiny studio, big ideas','mira','Category 1','long',697,img+'ForBiggerFun.jpg',src.bunny,4100],
  ['Why this UI feels fast','lena','Category 4','long',415,img+'Sintel.jpg',src.bunny,18000],
  ['The weekend experiment','alex','Category 5','long',1398,img+'TearsOfSteel.jpg',src.flower,9700],
  ['I tried making a film in one day','noah','Category 2','long',1066,img+'ForBiggerJoyrides.jpg',src.bunny,22000],
  ['A very unnecessary camera test','lena','Category 3','long',553,img+'ForBiggerBlazes.jpg',src.bunny,13000],
  ['Flower loop','mira','Category 1','short',28,img+'ForBiggerFun.jpg',src.flower,5600],
  ['Bunny vertical test','alex','Category 2','short',10,img+'BigBuckBunny.jpg',src.bunny,4300],
  ['Late night short','lena','Category 4','short',10,img+'Sintel.jpg',src.bunny,8100],
  ['One more clip','noah','Category 3','short',10,img+'ElephantsDream.jpg',src.bunny,3600]
];
for (const [title,username,category,kind,duration,thumb,url,views] of videos) {
  if (db.prepare('SELECT 1 FROM videos WHERE title=?').get(title)) continue;
  const author = db.prepare('SELECT id FROM users WHERE username=?').get(username);
  db.prepare(`INSERT INTO videos(title,description,video_url,thumbnail_url,kind,duration_seconds,category_id,author_id,views) VALUES (?,?,?,?,?,?,?,?,?)`).run(title,'Pirozhok demo content',url,thumb,kind,duration,cat[category]||null,author.id,views);
}
for (const username of ['mira','alex','noah','lena']) {
  const id=db.prepare('SELECT id FROM users WHERE username=?').get(username).id;
  db.prepare("INSERT OR IGNORE INTO saved_folders(user_id,name) VALUES (?, 'Saved')").run(id);
}
console.log(`Seeded Pirozhok demo data. Demo author password: ${demoPassword}`);
