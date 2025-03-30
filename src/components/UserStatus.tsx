'use client';

import Link from 'next/link';

export default function UserStatus() {
  return (
    <Link
      href="/login"
      className="text-sm font-medium px-4 py-2 rounded-full bg-earth hover:bg-earth/90 text-white transition-colors"
    >
      登录
    </Link>
  );
} 