import { HttpsProxyAgent } from 'https-proxy-agent';

// 设置代理URL
const proxyUrl = 'http://127.0.0.1:7890';

// 创建代理agent
export const proxyAgent = new HttpsProxyAgent(proxyUrl);

// 如果在开发环境中，设置全局代理
if (process.env.NODE_ENV !== 'production') {
  // 设置NODE_TLS_REJECT_UNAUTHORIZED环境变量
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  console.log('[Proxy] Proxy agent configured for Google domains');
} 