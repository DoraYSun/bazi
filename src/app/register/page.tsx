'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 这里应该添加注册处理逻辑
      // 现在只是示例，直接跳转到登录页面
      alert('注册功能尚未实现，请使用管理员账号登录: admin/password');
      router.push('/login');
    } catch (err) {
      console.error('注册错误:', err);
      setError('注册过程中发生错误，请稍后再试');
    } finally {
      setLoading(false);
    }
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
          <h1 className="text-3xl font-bold text-earth dark:text-earth mt-4 ink-text">注册</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            创建账号以获取个性化的命运分析和更多功能
          </p>
        </div>
        
        {error && (
          <div className="mb-6 p-4 rounded-md bg-fire/10 text-fire text-center">
            {error}
          </div>
        )}
        
        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              用户名
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-earth focus:border-earth dark:bg-ink-dark/50"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              电子邮箱
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-earth focus:border-earth dark:bg-ink-dark/50"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              密码
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-earth focus:border-earth dark:bg-ink-dark/50"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-earth hover:bg-earth/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-earth"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
            ) : null}
            注册
          </button>
          
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              已有账号？{' '}
              <Link href="/login" className="text-fire hover:underline">
                立即登录
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
} 