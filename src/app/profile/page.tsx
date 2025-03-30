'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  
  // 模拟加载状态
  useEffect(() => {
    // 简单模拟身份验证检查
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [router]);
  
  // 加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen bg-ink-light dark:bg-ink-dark py-12 relative ink-wash-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-earth"></div>
        <p className="ml-4 text-earth dark:text-earth">加载中...</p>
      </div>
    );
  }
  
  // 简化版资料页面
  return (
    <div className="min-h-screen bg-ink-light dark:bg-ink-dark py-12 relative ink-wash-bg">
      <div className="ink-splash ink-splash-1"></div>
      <div className="ink-splash ink-splash-2"></div>
      <div className="ink-splash ink-splash-3"></div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-white dark:bg-ink-dark/50 rounded-lg shadow-lg p-6 mb-8 ink-card">
          <h1 className="text-2xl font-bold text-earth dark:text-earth mb-6">
            个人资料
          </h1>
          
          <div className="space-y-6">
            <div className="flex items-center">
              <div className="h-20 w-20 rounded-full bg-earth flex items-center justify-center text-white text-2xl">
                游
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-semibold">
                  游客用户
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  guest@example.com
                </p>
              </div>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-medium mb-4">您的信息</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">姓名</p>
                  <p>游客用户</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">邮箱</p>
                  <p>guest@example.com</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">用户类型</p>
                  <p>游客</p>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-medium mb-4">账号设置</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                管理您的账号设置和偏好
              </p>
              <div className="space-y-4">
                <Link href="/calculator" className="inline-block px-4 py-2 bg-earth text-white rounded-md">
                  返回计算器
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 