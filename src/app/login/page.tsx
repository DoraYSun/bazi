'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 简单的表单提交处理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // 这里只是一个演示，实际上不会进行真正的登录
    setTimeout(() => {
      setLoading(false);
      router.push('/');
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-light dark:bg-ink-dark py-12 relative ink-wash-bg">
      <div className="ink-splash ink-splash-1"></div>
      <div className="ink-splash ink-splash-2"></div>
      <div className="ink-splash ink-splash-3"></div>
      <div className="absolute top-20 right-10 w-40 h-40 bagua-symbol opacity-20"></div>
      <div className="absolute bottom-20 left-10 w-40 h-40 bagua-symbol opacity-20"></div>
      
      <div className="max-w-md w-full p-8 relative z-10 ink-card">
        <div className="text-center mb-8">
          <div className="bagua-symbol mx-auto"></div>
          <h1 className="text-3xl font-bold text-earth dark:text-earth mt-4 ink-text">登录</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            登录以访问个性化命运分析
          </p>
        </div>
        
        {error && (
          <div className="mb-6 p-4 rounded-md bg-fire/10 text-fire text-center">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              邮箱
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-earth focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              密码
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-earth focus:border-transparent"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-earth hover:bg-earth/80 text-white font-medium rounded-md transition-all duration-200 shadow-sm disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent"></div>
                <span>登录中...</span>
              </>
            ) : (
              <span>登录</span>
            )}
          </button>
          
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            暂未注册？ <Link href="/register" className="text-earth hover:underline">创建账户</Link>
          </div>
        </form>
      </div>
    </div>
  );
} 