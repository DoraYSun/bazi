/**
 * DeepSeek API 工具函数
 * 用于调用 DeepSeek API 进行八字排盘和命理分析
 */

import { SxtwlBaziChart } from './sxtwlApi';

// 八字排盘结果类型
export interface BaziChart {
  yearPillar: string;
  monthPillar: string;
  dayPillar: string;
  hourPillar: string;
  analysis: string;
  ganShen: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };
  tianGan: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };
  diZhi: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };
  cangGan: {
    year: string[];
    month: string[];
    day: string[];
    hour: string[];
  };
  zhiShen: {
    year: string[];
    month: string[];
    day: string[];
    hour: string[];
  };
  naYin: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };
  shenSha: {
    year: string[];
    month: string[];
    day: string[];
    hour: string[];
  };
  relations: {
    tianGan: string;
    diZhi: string;
  };
  lunarDate: {
    year: number;
    month: number;
    day: number;
    leap: boolean;
  };
  zodiac: string;
  recommendedNames: {
    name: string;
    pinyin: string;
    meaning: string;
  }[];
}

// 分析类型
export type AnalysisType = 'overall' | 'age25' | 'career' | 'marriage' | 'wealth' | 'health' | 'fortune';

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
 * 执行八字排盘
 * @param userData 用户数据
 * @returns 八字排盘结果
 */
export async function doBaziCalculation(userData: UserData): Promise<BaziChart> {
  try {
    console.log('开始八字排盘计算，用户数据:', {
      ...userData,
      // 排除敏感信息
      birthYear: undefined,
      birthMonth: undefined,
      birthDay: undefined
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 65000); // 65 秒超时

    try {
      const response = await fetch('/api/deepseek', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          action: 'calculate',
          data: userData
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log('API 响应状态:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        let errorData;
        try {
          const errorText = await response.text();
          console.error('API 错误响应原始内容:', errorText);
          
          try {
            errorData = JSON.parse(errorText);
          } catch (parseError) {
            console.error('解析错误响应失败:', parseError);
            throw new Error(`API请求失败: ${response.status} - ${errorText}`);
          }
        } catch (error) {
          console.error('读取错误响应失败:', error);
          if (response.status === 504) {
            throw new Error('八字排盘请求超时，请稍后重试');
          }
          throw new Error(`API请求失败: ${response.status}`);
        }
        
        console.error('API 请求失败:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        
        if (response.status === 504) {
          throw new Error('八字排盘请求超时，请稍后重试');
        }
        
        throw new Error(`API请求错误：${response.status} - ${errorData.error || ''} ${errorData.details || ''}`);
      }

      let data;
      try {
        const rawText = await response.text();
        console.log('API 响应原始内容:', rawText);
        
        try {
          data = JSON.parse(rawText);
        } catch (parseError) {
          console.error('JSON 解析失败，原始响应:', rawText);
          throw new Error('服务器返回的数据格式无效，请稍后重试');
        }
      } catch (error) {
        console.error('读取响应内容失败:', error);
        throw new Error('读取服务器响应失败，请稍后重试');
      }
      
      if (!data.chart) {
        console.error('响应数据中缺少 chart:', data);
        throw new Error('八字排盘结果格式错误，请稍后重试');
      }

      return data.chart as BaziChart;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  } catch (error) {
    console.error('八字排盘失败:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('八字排盘失败，请稍后重试');
  }
}

/**
 * 执行命理分析
 * @param baziChart 八字排盘结果
 * @param analysisType 分析类型
 * @returns 分析内容
 */
export async function doBaziAnalysis(baziChart: BaziChart, analysisType: AnalysisType): Promise<string> {
  try {
    const response = await fetch('/api/deepseek', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'analyze',
        data: {
          baziChart,
          analysisType
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API请求错误：${response.status} - ${errorData.error || JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    
    if (!data.analysis) {
      throw new Error('获取分析结果失败');
    }

    return data.analysis;
  } catch (error) {
    console.error('命理分析失败:', error);
    throw new Error(`命理分析失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 将SXTWL八字结果转换为DeepSeek API需要的格式
 * @param sxtwlBaziChart SXTWL八字排盘结果
 * @returns DeepSeek API所需的BaziChart格式
 */
export function convertToBaziChart(sxtwlBaziChart: SxtwlBaziChart): BaziChart {
  return {
    // 基本四柱
    yearPillar: sxtwlBaziChart.年柱 || `${sxtwlBaziChart.tianGan.year}${sxtwlBaziChart.diZhi.year}`,
    monthPillar: sxtwlBaziChart.月柱 || `${sxtwlBaziChart.tianGan.month}${sxtwlBaziChart.diZhi.month}`,
    dayPillar: sxtwlBaziChart.日柱 || `${sxtwlBaziChart.tianGan.day}${sxtwlBaziChart.diZhi.day}`,
    hourPillar: sxtwlBaziChart.时柱 || `${sxtwlBaziChart.tianGan.hour}${sxtwlBaziChart.diZhi.hour}`,
    
    // 空的分析字段
    analysis: '',
    
    // 复制其他相同字段
    ganShen: sxtwlBaziChart.ganShen,
    tianGan: sxtwlBaziChart.tianGan,
    diZhi: sxtwlBaziChart.diZhi,
    cangGan: sxtwlBaziChart.cangGan,
    zhiShen: sxtwlBaziChart.zhiShen,
    naYin: sxtwlBaziChart.naYin,
    shenSha: sxtwlBaziChart.shenSha,
    relations: sxtwlBaziChart.relations,
    lunarDate: sxtwlBaziChart.lunarDate,
    zodiac: sxtwlBaziChart.zodiac,
    
    // 提供空的推荐名称字段
    recommendedNames: []
  };
} 