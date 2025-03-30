import { NextRequest, NextResponse } from 'next/server';

// 允许的分析类型
const ALLOWED_TYPES = ['overall', 'age25', 'career', 'marriage', 'wealth', 'health', 'fortune'];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    // 获取环境变量
    const apiUrl = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions';
    const apiKey = process.env.DEEPSEEK_API_KEY;
    const model = process.env.DEEPSEEK_MODEL || 'deepseek-chat';

    // 添加调试日志
    console.log('DeepSeek API 配置:', {
      apiUrl,
      hasApiKey: !!apiKey,
      model,
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV
    });

    if (!apiKey) {
      console.error('DeepSeek API 密钥未配置');
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    let messages: any[] = [];

    // 根据不同的操作类型生成不同的消息
    if (action === 'calculate') {
      const { calendarType, birthYear, birthMonth, birthDay, birthHour, birthMinute, gender, location, longitude } = data;
      
      // 验证必要的数据
      if (!birthYear || !birthMonth || !birthDay || !gender || !location) {
        return NextResponse.json({ error: 'Incomplete data' }, { status: 400 });
      }

      const calendarTypeText = calendarType === 'solar' ? '阳历/公历' : '阴历/农历';
      const genderText = gender === 'male' ? '男' : '女';

      // 保持中文提示词，以确保结果的准确性
      const prompt = `请根据以下出生信息进行详细的八字排盘，请结合真太阳时进行调整，并推演八字命盘：
- 历法：${calendarTypeText}
- 出生日期：${birthYear}年${birthMonth}月${birthDay}日
- 出生时间：${birthHour}时${birthMinute}分
- 性别：${genderText}
- 出生地点：${location}，经度：${longitude}度
- 姓名：${data.userName || '（未提供）'}

请提供完整的八字排盘结果，包括以下内容：
1. 四柱（年柱、月柱、日柱、时柱）的天干地支
2. 干神（偏财、正官等）
3. 天干（甲、乙、丙、丁等）
4. 地支（子、丑、寅、卯等）
5. 藏干（含藏干的五行属性，如：辛金、壬水等）
6. 支神（偏财、食神等）
7. 纳音（如：剑锋金、海中金等）
8. 神煞（如：文昌贵人、将星等）
9. 天干地支相生相克关系
10. 阴历出生日期
11. 属相（如：龙、蛇、马等）
12. 基于八字命盘，推荐3个适合的中文名字（包含姓和名，姓从百家姓中选择），每个名字必须提供汉字、拼音和结合八字命盘的含义解释

结果请使用以下JSON格式返回（不要有其他内容，只返回JSON）：
{
  "yearPillar": "年柱天干地支，如：甲子",
  "monthPillar": "月柱天干地支，如：乙丑",
  "dayPillar": "日柱天干地支，如：丙寅",
  "hourPillar": "时柱天干地支，如：丁卯",
  "ganShen": {
    "year": "年柱干神，如：偏财",
    "month": "月柱干神，如：正官",
    "day": "日柱干神，如：比肩",
    "hour": "时柱干神，如：伤官"
  },
  "tianGan": {
    "year": "年柱天干，如：甲",
    "month": "月柱天干，如：乙",
    "day": "日柱天干，如：丙",
    "hour": "时柱天干，如：丁"
  },
  "diZhi": {
    "year": "年柱地支，如：子",
    "month": "月柱地支，如：丑",
    "day": "日柱地支，如：寅",
    "hour": "时柱地支，如：卯"
  },
  "cangGan": {
    "year": ["年柱藏干1，如：癸水", "年柱藏干2（如果有）"],
    "month": ["月柱藏干1，如：己土", "月柱藏干2（如果有）", "月柱藏干3（如果有）"],
    "day": ["日柱藏干1，如：甲木", "日柱藏干2（如果有）", "日柱藏干3（如果有）"],
    "hour": ["时柱藏干1，如：乙木", "时柱藏干2（如果有）"]
  },
  "zhiShen": {
    "year": ["年柱支神1，如：食神", "年柱支神2（如果有）"],
    "month": ["月柱支神1，如：偏财", "月柱支神2（如果有）", "月柱支神3（如果有）"],
    "day": ["日柱支神1，如：正印", "日柱支神2（如果有）", "日柱支神3（如果有）"],
    "hour": ["时柱支神1，如：偏印", "时柱支神2（如果有）"]
  },
  "naYin": {
    "year": "年柱纳音，如：海中金",
    "month": "月柱纳音，如：炉中火",
    "day": "日柱纳音，如：大林木",
    "hour": "时柱纳音，如：路旁土"
  },
  "shenSha": {
    "year": ["年柱神煞1，如：文昌贵人", "年柱神煞2（如果有）"],
    "month": ["月柱神煞1，如：将星", "月柱神煞2（如果有）"],
    "day": ["日柱神煞1，如：华盖", "日柱神煞2（如果有）"],
    "hour": ["时柱神煞1，如：太极贵人", "时柱神煞2（如果有）"]
  },
  "relations": {
    "tianGan": "天干相生相克关系描述，例如：甲木生丙火，丙火克辛金等",
    "diZhi": "地支相生相克关系描述，例如：子水生寅木，寅木克丑土等"
  },
  "lunarDate": {
    "year": 农历年份数字，如：1990,
    "month": 农历月份数字，如：6,
    "day": 农历日期数字，如：15,
    "leap": 是否闰月，布尔值，如：false
  },
  "zodiac": "属相，如：龙、蛇、马等",
  "recommendedNames": [
    {
      "name": "推荐的中文名字1",
      "pinyin": "名字的拼音1",
      "meaning": "名字的含义解释1"
    },
  ],
  "analysis": "基础命理分析"
}`;
      
      messages = [
        { role: 'system', content: '你是一位精通中国传统命理学的资深专家，尤其擅长八字排盘和命理分析。请按照用户要求提供准确的命理解读。' },
        { role: 'user', content: prompt }
      ];
    } 
    else if (action === 'analyze') {
      const { baziChart, analysisType } = data;
      
      // 验证必要的数据
      if (!baziChart || !baziChart.yearPillar || !baziChart.monthPillar || !baziChart.dayPillar || !baziChart.hourPillar) {
        return NextResponse.json({ error: 'Incomplete BaZi information' }, { status: 400 });
      }

      if (!analysisType || !ALLOWED_TYPES.includes(analysisType)) {
        return NextResponse.json({ error: 'Invalid analysis type' }, { status: 400 });
      }

      const bazi = `${baziChart.yearPillar} ${baziChart.monthPillar} ${baziChart.dayPillar} ${baziChart.hourPillar}`;
      
      // 保持中文提示词，确保分析的准确性
      let prompt = `基于以下八字命盘：${bazi}\n\n`;
      
      switch (analysisType) {
        case 'overall':
          prompt += '请提供详细的命理整体分析，包括性格特点、人生起伏、吉凶运势等。请用纯英文回答，不要使用中文术语或添加括号注解。请不要使用任何Markdown格式，如#号标题、星号(*)加粗或斜体、列表符号等，直接以纯文本段落形式输出。避免使用"**Bold**"或"###"等markdown语法。每个段落直接使用换行分隔，不要使用标题或分隔线。答案不少于1500字。';
          break;
        case 'age25':
          prompt += '请专门针对25岁这一年的运势进行详细分析，包括事业、健康、感情等各方面运势。请用纯英文回答，不要使用中文术语或添加括号注解。请不要使用任何Markdown格式，如#号标题、星号(*)加粗或斜体、列表符号等，直接以纯文本段落形式输出。避免使用"**Bold**"或"###"等markdown语法。每个段落直接使用换行分隔，不要使用标题或分隔线。答案不少于1200字。';
          break;
        case 'fortune':
          prompt += '请提供未来10年的运势分析，重点分析大运和流年对运势的影响，包括事业、健康、感情等各方面运势的变化趋势。请用纯英文回答，不要使用中文术语或添加括号注解。请不要使用任何Markdown格式，如#号标题、星号(*)加粗或斜体、列表符号等，直接以纯文本段落形式输出。避免使用"**Bold**"或"###"等markdown语法。每个段落直接使用换行分隔，不要使用标题或分隔线。答案不少于1500字。';
          break;
        case 'career':
          prompt += '请详细分析事业运势，包括适合的职业方向、事业发展机遇与挑战、升迁机会、创业建议等。请用纯英文回答，不要使用中文术语或添加括号注解。请不要使用任何Markdown格式，如#号标题、星号(*)加粗或斜体、列表符号等，直接以纯文本段落形式输出。避免使用"**Bold**"或"###"等markdown语法。每个段落直接使用换行分隔，不要使用标题或分隔线。答案不少于1200字。';
          break;
        case 'marriage':
          prompt += '请详细分析婚姻与感情运势，包括感情特点、桃花运、婚姻质量、适合的伴侣类型等。请用纯英文回答，不要使用中文术语或添加括号注解。请不要使用任何Markdown格式，如#号标题、星号(*)加粗或斜体、列表符号等，直接以纯文本段落形式输出。避免使用"**Bold**"或"###"等markdown语法。每个段落直接使用换行分隔，不要使用标题或分隔线。答案不少于1200字。';
          break;
        case 'wealth':
          prompt += '请详细分析财运情况，包括财富来源、理财建议、投资机会、破财风险等。请用纯英文回答，不要使用中文术语或添加括号注解。请不要使用任何Markdown格式，如#号标题、星号(*)加粗或斜体、列表符号等，直接以纯文本段落形式输出。避免使用"**Bold**"或"###"等markdown语法。每个段落直接使用换行分隔，不要使用标题或分隔线。答案不少于1200字。';
          break;
        case 'health':
          prompt += '请详细分析健康状况，包括体质特点、易患疾病、养生建议等。请用纯英文回答，不要使用中文术语或添加括号注解。请不要使用任何Markdown格式，如#号标题、星号(*)加粗或斜体、列表符号等，直接以纯文本段落形式输出。避免使用"**Bold**"或"###"等markdown语法。每个段落直接使用换行分隔，不要使用标题或分隔线。答案不少于1200字。';
          break;
      }
      
      messages = [
        { role: 'system', content: '你是一位精通中国传统命理学的资深专家，尤其擅长八字命理分析。请按照用户要求提供专业、详细、准确的命理解读。' },
        { role: 'user', content: prompt }
      ];
    } 
    else {
      return NextResponse.json({ error: 'Unsupported operation type' }, { status: 400 });
    }

    // 调用 DeepSeek API
    console.log('准备调用 DeepSeek API，请求参数:', {
      url: apiUrl,
      model,
      messageCount: messages.length,
      temperature: 0.7,
      max_tokens: 4000
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 增加到 60 秒

    const maxRetries = 3;
    let currentRetry = 0;

    while (currentRetry < maxRetries) {
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            model: model,
            messages: messages,
            temperature: 0.7,
            max_tokens: 4000,
            stream: false
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        // 记录响应状态
        console.log('DeepSeek API 响应状态:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('DeepSeek API 错误响应:', {
            status: response.status,
            statusText: response.statusText,
            errorText,
            url: apiUrl,
            hasApiKey: !!apiKey,
            model: model,
            retryCount: currentRetry + 1
          });

          // 如果是 429 (Too Many Requests) 或 503 (Service Unavailable)，等待后重试
          if ((response.status === 429 || response.status === 503) && currentRetry < maxRetries - 1) {
            const retryAfter = parseInt(response.headers.get('retry-after') || '5');
            await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
            currentRetry++;
            continue;
          }

          let errorMessage = `DeepSeek API Error: ${response.status}`;
          let errorDetails = errorText;

          try {
            const errorJson = JSON.parse(errorText);
            if (errorJson.error) {
              errorMessage = typeof errorJson.error === 'string' ? errorJson.error : JSON.stringify(errorJson.error);
              errorDetails = errorJson.details || errorText;
            }
          } catch (e) {
            // 如果解析失败，使用原始错误文本
          }

          return NextResponse.json(
            { error: errorMessage, details: errorDetails },
            { status: response.status }
          );
        }

        let result;
        const rawText = await response.text();
        console.log('DeepSeek API 原始响应:', rawText);
        
        try {
          result = JSON.parse(rawText);
        } catch (parseError) {
          console.error('JSON 解析失败，原始响应:', rawText);
          return NextResponse.json(
            { 
              error: 'Invalid JSON response from DeepSeek API', 
              details: rawText.substring(0, 1000) // 限制错误详情的长度
            },
            { status: 500 }
          );
        }

        // 如果是排盘操作，尝试从返回内容中提取 JSON
        if (action === 'calculate') {
          const content = result.choices[0].message.content;
          try {
            // 添加日志以查看原始内容
            console.log('DeepSeek API 返回的原始内容:', content);
            
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              try {
                const chart = JSON.parse(jsonMatch[0]);
                return NextResponse.json({ chart });
              } catch (parseError) {
                console.error('解析八字数据失败:', parseError);
                console.error('尝试解析的 JSON 字符串:', jsonMatch[0]);
                return NextResponse.json({ 
                  error: 'Failed to parse BaZi data', 
                  details: `Invalid JSON format in response. Raw content: ${content.substring(0, 1000)}` 
                }, { status: 500 });
              }
            } else {
              console.error('未找到 JSON 数据在响应中');
              return NextResponse.json({ 
                error: 'Invalid response format', 
                details: `No JSON data found in response. Content: ${content.substring(0, 1000)}` 
              }, { status: 500 });
            }
          } catch (error) {
            console.error('处理八字数据失败:', error);
            return NextResponse.json({ 
              error: 'Failed to process response', 
              details: error instanceof Error ? error.message : String(error)
            }, { status: 500 });
          }
        } else {
          // 分析操作直接返回内容
          return NextResponse.json({ analysis: result.choices[0].message.content });
        }
      } catch (error: any) {
        clearTimeout(timeoutId);
        
        if (error.name === 'AbortError') {
          console.error('DeepSeek API 请求超时');
          return NextResponse.json({ 
            error: 'Request timeout', 
            details: 'The request to DeepSeek API timed out after 60 seconds' 
          }, { status: 504 });
        }

        console.error('调用 DeepSeek API 时发生错误:', error);
        return NextResponse.json({ 
          error: 'API request failed', 
          details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
      }
    }
  } catch (error: any) {
    console.error('处理请求时发生错误:', error);
    return NextResponse.json(
      { 
        error: 'Server error processing request', 
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      }, 
      { status: 500 }
    );
  }
} 