'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // 如果用户未登录，重定向到登录页面
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);
  
  // 加载状态
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-ink-light dark:bg-ink-dark py-12 relative ink-wash-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-earth"></div>
        <p className="ml-4 text-earth dark:text-earth">Loading...</p>
      </div>
    );
  }
  
  // 未登录状态（会被上面的useEffect重定向）
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-ink-light dark:bg-ink-dark py-12 relative ink-wash-bg flex flex-col items-center justify-center">
        <p className="text-xl text-earth dark:text-earth mb-4">Please sign in to view your profile</p>
        <Link 
          href="/login"
          className="px-4 py-2 bg-earth text-white rounded-md"
        >
          Sign in
        </Link>
      </div>
    );
  }
  
  // 登录状态
  return (
    <div className="min-h-screen bg-ink-light dark:bg-ink-dark py-12 relative ink-wash-bg">
      <div className="ink-splash ink-splash-1"></div>
      <div className="ink-splash ink-splash-2"></div>
      <div className="ink-splash ink-splash-3"></div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-white dark:bg-ink-dark/50 rounded-lg shadow-lg p-6 mb-8 ink-card">
          <h1 className="text-2xl font-bold text-earth dark:text-earth mb-6">
            Profile
          </h1>
          
          {session?.user && (
            <div className="space-y-6">
              <div className="flex items-center">
                <div className="h-20 w-20 rounded-full bg-earth flex items-center justify-center text-white text-2xl">
                  {session.user.name ? session.user.name[0].toUpperCase() : 'U'}
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-semibold">
                    {session.user.name || 'User'}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {session.user.email || ''}
                  </p>
                </div>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-medium mb-4">Your Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                    <p>{session.user.name || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                    <p>{session.user.email || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">User ID</p>
                    <p className="truncate">{session.user.id || 'Not available'}</p>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-medium mb-4">Account Settings</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Manage your account settings and preferences
                </p>
                <div className="space-y-2">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Authentication Provider: <span className="font-medium">Google</span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 