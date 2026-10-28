'use client';
import Link from 'next/link'; import {usePathname} from 'next/navigation';
const items=[['/','⌂','Home'],['/shorts','▶','Shorts'],['/friends','☻','Friends'],['/profile','●','Profile']];
export default function BottomNav(){const p=usePathname(); return <nav className="bottomnav">{items.map(([href,icon,label])=><Link key={href} className={`navitem ${href==='/'?(p==='/'?'active':''):(p.startsWith(href)?'active':'')}`} href={href}><span className="navicon">{icon}</span><span>{label}</span></Link>)}</nav>}
