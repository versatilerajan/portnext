'use client';

import Link from 'next/link';

export default function Navigation() {
  return (
    <nav className="nav">
      <div className="nav-links">
        <Link href="#home">Home</Link>
        <Link href="#about">About</Link>
        <Link href="https://github.com/versatilerajan">Projects</Link>
        <Link href="#docs">Docs</Link>
      </div>
      <Link href="https://github.com/versatilerajan" className="github-btn">
        GitHub
      </Link>
    </nav>
  );
}