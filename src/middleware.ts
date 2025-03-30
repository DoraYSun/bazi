import { NextRequest, NextResponse } from 'next/server';

// 中间件处理所有请求
export async function middleware(request: NextRequest) {
  // 继续处理请求
  return NextResponse.next();
}

// 配置中间件匹配路径
export const config = {
  matcher: [
    /*
     * 匹配所有路径，除了：
     * - API路由
     * - 静态文件路径(如图片、JS、CSS等)
     * - favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 