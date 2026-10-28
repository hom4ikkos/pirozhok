'use client';
import BottomNav from './BottomNav'; import Link from 'next/link';
export default function AppShell({children,title='Пирожок',right=null,noTop=false}){return <div className="app">{!noTop&&<header className="topbar"><Link href="/" className="brand"><span className="brandmark"></span>{title}</Link>{right||<span/>}</header>}{children}<BottomNav/></div>}
