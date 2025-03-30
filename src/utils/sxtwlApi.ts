/**
 * SXTWL API 工具函数
 * 使用Python的sxtwl库计算八字
 */

// 八字排盘结果类型
export interface SxtwlBaziChart {
  // 基本四柱
  年柱: string;
  月柱: string;
  日柱: string;
  时柱: string;
  
  // 干神
  ganShen: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };
  
  // 天干
  tianGan: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };
  
  // 地支
  diZhi: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };
  
  // 藏干
  cangGan: {
    year: string[];
    month: string[];
    day: string[];
    hour: string[];
  };
  
  // 支神
  zhiShen: {
    year: string[];
    month: string[];
    day: string[];
    hour: string[];
  };
  
  // 纳音
  naYin: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };
  
  // 神煞
  shenSha: {
    year: string[];
    month: string[];
    day: string[];
    hour: string[];
  };
  
  // 关系
  relations: {
    tianGan: string;
    diZhi: string;
  };
  
  // 阴历日期
  lunarDate: {
    year: number;
    month: number;
    day: number;
    leap: boolean;
  };
  
  // 属相
  zodiac: string;
  
  // 中文生肖
  zodiacCN?: string;
  
  // 其他信息
  真太阳时: string;
  时支: string;
  source: string;
}

// 用户数据类型
export interface UserData {
  calendarType: string;
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number;
  birthMinute: number;
  gender: string;
  location: string;
  longitude: number;
}

/**
 * 使用sxtwl库执行八字排盘
 * @param userData 用户数据
 * @returns 八字排盘结果
 */
export async function doSxtwlBaziCalculation(userData: UserData): Promise<SxtwlBaziChart> {
  try {
    console.log('开始使用sxtwl计算八字，用户数据:', {
      ...userData,
      // 排除敏感信息
      birthYear: undefined,
      birthMonth: undefined,
      birthDay: undefined
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时

    try {
      const response = await fetch('/api/sxtwl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userData
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          throw new Error(`API请求失败: ${response.status}`);
        }
        
        throw new Error(`API请求错误：${response.status} - ${errorData.error || ''} ${errorData.details || ''}`);
      }

      const data = await response.json();
      
      if (!data.chart) {
        throw new Error('八字排盘结果格式错误');
      }

      return data.chart as SxtwlBaziChart;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  } catch (error) {
    console.error('sxtwl八字排盘失败:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('八字排盘失败，请稍后重试');
  }
} 