import { HttpsProxyAgent } from 'https-proxy-agent';
import fetch, { Response } from 'node-fetch';

// 使用环境变量中的代理或默认代理
const proxyUrl = process.env.HTTPS_PROXY || 'http://127.0.0.1:7890';
const proxyAgent = new HttpsProxyAgent(proxyUrl);

/**
 * 使用代理的fetch函数
 */
export async function fetchWithProxy(url: string, options: any = {}): Promise<Response> {
  console.log(`[Fetch] 请求: ${url}`);
  
  try {
    // 增加超时时间，以便适应代理可能带来的延迟
    const timeout = 60000; // 60秒超时
    
    console.log(`[Fetch] 使用代理请求: ${url}`);
    options.agent = proxyAgent;
    options.timeout = timeout;
    
    const response = await fetch(url, options);
    console.log(`[Fetch] 代理请求成功: ${url}, 状态: ${response.status}`);
    return response;
  } catch (error) {
    // 出错时记录详细信息
    console.error(`[Fetch] 请求失败: ${url}`, error);
    throw error;
  }
} 