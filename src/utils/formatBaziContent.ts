import { tianGanTranslations, diZhiTranslations, wuXingTranslations, shiShenTranslations, naYinTranslations } from './translations';

/**
 * 格式化天干内容为中英文双语格式
 */
export function formatTianGan(tianGan: string): string {
  return `${tianGan} ${tianGanTranslations[tianGan] || ''}`;
}

/**
 * 格式化地支内容为中英文双语格式
 */
export function formatDiZhi(diZhi: string): string {
  return `${diZhi} ${diZhiTranslations[diZhi] || ''}`;
}

/**
 * 格式化干神/十神内容为中英文双语格式
 */
export function formatShiShen(shiShen: string): string {
  return `${shiShen} ${shiShenTranslations[shiShen] || ''}`;
}

/**
 * 格式化藏干内容为中英文双语格式
 * 例：丙火 -> 丙火 Bing (Yang Fire) - Fire
 */
export function formatCangGan(cangGan: string): string {
  if (!cangGan) return '';
  
  // 例：丙火
  const gan = cangGan.charAt(0); // 丙
  const xing = cangGan.substring(1); // 火
  
  return `${cangGan} ${tianGanTranslations[gan] || ''} - ${wuXingTranslations[xing] || ''}`;
}

/**
 * 格式化纳音内容为中英文双语格式
 */
export function formatNaYin(naYin: string): string {
  return `${naYin} ${naYinTranslations[naYin] || ''}`;
}

/**
 * 格式化天干地支关系内容
 * 例：甲木→乙木→丙火→丁火
 */
export function formatRelation(relation: string): string {
  if (!relation) return '';
  
  // 分割关系字符串
  const parts = relation.split('→');
  
  // 格式化每个部分
  const formattedParts = parts.map(part => {
    // 例：甲木
    const gan = part.charAt(0); // 甲
    const xing = part.substring(1); // 木
    
    return `${part} ${tianGanTranslations[gan] || ''} - ${wuXingTranslations[xing] || ''}`;
  });
  
  // 重新组合
  return formattedParts.join(' → ');
}

/**
 * 地支到生肖的映射
 */
export const dizhiToZodiac: Record<string, string> = {
  '子': '鼠',
  '丑': '牛',
  '寅': '虎',
  '卯': '兔',
  '辰': '龙',
  '巳': '蛇',
  '午': '马',
  '未': '羊',
  '申': '猴',
  '酉': '鸡',
  '戌': '狗',
  '亥': '猪'
};

/**
 * 中文生肖的英文翻译
 */
export const zodiacTranslations: Record<string, string> = {
  '鼠': 'Rat',
  '牛': 'Ox',
  '虎': 'Tiger',
  '兔': 'Rabbit',
  '龙': 'Dragon',
  '蛇': 'Snake',
  '马': 'Horse',
  '羊': 'Goat',
  '猴': 'Monkey',
  '鸡': 'Rooster',
  '狗': 'Dog',
  '猪': 'Pig'
};

/**
 * 将地支转换为中文生肖
 */
export function getChineseZodiacFromDizhi(dizhi: string): string {
  return dizhiToZodiac[dizhi] || '';
}

/**
 * 获取生肖的中英文格式
 */
export function formatZodiac(dizhi: string): string {
  const chineseZodiac = getChineseZodiacFromDizhi(dizhi);
  const englishZodiac = zodiacTranslations[chineseZodiac] || '';
  return `${chineseZodiac} (${englishZodiac})`;
} 