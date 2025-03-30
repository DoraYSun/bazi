import datetime
from typing import Dict, List
import sxtwl

# 天干地支名称
TIANGAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"]
DIZHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]

# 生肖对应
SHENGXIAO = {
    "子": "鼠",
    "丑": "牛",
    "寅": "虎",
    "卯": "兔",
    "辰": "龙",
    "巳": "蛇",
    "午": "马",
    "未": "羊",
    "申": "猴",
    "酉": "鸡",
    "戌": "狗",
    "亥": "猪"
}

# 五行属性
WUXING = ["木", "火", "土", "金", "水"]

# 天干五行对应
TIANGAN_WUXING = {
    "甲": "木", "乙": "木", 
    "丙": "火", "丁": "火", 
    "戊": "土", "己": "土", 
    "庚": "金", "辛": "金", 
    "壬": "水", "癸": "水"
}

# 地支藏干（按照主气、中气、余气排序）
DIZHI_CANGGAN = {
    "子": ["癸"],
    "丑": ["己", "辛", "癸"],
    "寅": ["甲", "丙", "戊"],
    "卯": ["乙"],
    "辰": ["戊", "乙", "癸"],
    "巳": ["丙", "庚", "戊"],
    "午": ["丁", "己"],
    "未": ["己", "丁", "乙"],
    "申": ["庚", "壬", "戊"],
    "酉": ["辛"],
    "戌": ["戊", "辛", "丁"],
    "亥": ["壬", "甲"]
}

# 十神名称
SHISHEN = ["比肩", "劫财", "食神", "伤官", "偏财", "正财", "七杀", "正官", "偏印", "正印"]

# 纳音五行
NAYIN = {
    "甲子": "海中金", "乙丑": "海中金",
    "丙寅": "炉中火", "丁卯": "炉中火",
    "戊辰": "大林木", "己巳": "大林木",
    "庚午": "路旁土", "辛未": "路旁土",
    "壬申": "剑锋金", "癸酉": "剑锋金",
    "甲戌": "山头火", "乙亥": "山头火",
    "丙子": "涧下水", "丁丑": "涧下水",
    "戊寅": "城头土", "己卯": "城头土",
    "庚辰": "白蜡金", "辛巳": "白蜡金",
    "壬午": "杨柳木", "癸未": "杨柳木",
    "甲申": "泉中水", "乙酉": "泉中水",
    "丙戌": "屋上土", "丁亥": "屋上土",
    "戊子": "霹雳火", "己丑": "霹雳火",
    "庚寅": "松柏木", "辛卯": "松柏木",
    "壬辰": "长流水", "癸巳": "长流水",
    "甲午": "沙中金", "乙未": "沙中金",
    "丙申": "山下火", "丁酉": "山下火",
    "戊戌": "平地木", "己亥": "平地木",
    "庚子": "壁上土", "辛丑": "壁上土",
    "壬寅": "金箔金", "癸卯": "金箔金",
    "甲辰": "覆灯火", "乙巳": "覆灯火",
    "丙午": "天河水", "丁未": "天河水",
    "戊申": "大驿土", "己酉": "大驿土",
    "庚戌": "钗环金", "辛亥": "钗环金",
    "壬子": "桑柘木", "癸丑": "桑柘木",
    "甲寅": "大溪水", "乙卯": "大溪水",
    "丙辰": "沙中土", "丁巳": "沙中土",
    "戊午": "天上火", "己未": "天上火",
    "庚申": "石榴木", "辛酉": "石榴木",
    "壬戌": "大海水", "癸亥": "大海水"
}

# 神煞表（简化，仅包含部分常见神煞）
SHENSHAS = {
    "贵人": {
        "甲": ["丑", "未"], "乙": ["子", "申"],
        "丙": ["亥", "酉"], "丁": ["亥", "酉"],
        "戊": ["丑", "未"], "己": ["子", "申"],
        "庚": ["丑", "未"], "辛": ["子", "申"],
        "壬": ["卯", "巳"], "癸": ["卯", "巳"]
    },
    "天乙贵人": {
        "甲": ["巳", "申"], "乙": ["午", "酉"],
        "丙": ["申", "亥"], "丁": ["酉", "子"],
        "戊": ["申", "亥"], "己": ["酉", "子"],
        "庚": ["亥", "寅"], "辛": ["子", "卯"],
        "壬": ["寅", "巳"], "癸": ["卯", "午"]
    },
    "文昌": {
        "甲": "巳", "乙": "午", "丙": "申", "丁": "酉",
        "戊": "申", "己": "酉", "庚": "亥", "辛": "子",
        "壬": "寅", "癸": "卯"
    },
    "华盖": {
        "子": "未", "丑": "午", "寅": "巳", "卯": "辰",
        "辰": "卯", "巳": "寅", "午": "丑", "未": "子",
        "申": "亥", "酉": "戌", "戌": "酉", "亥": "申"
    },
    "桃花": {
        "子": "酉", "丑": "辰", "寅": "亥", "卯": "午",
        "辰": "丑", "巳": "申", "午": "卯", "未": "戌",
        "申": "巳", "酉": "子", "戌": "未", "亥": "寅"
    },
    "驿马": {
        "子": "寅", "丑": "亥", "寅": "申", "卯": "巳",
        "辰": "寅", "巳": "亥", "午": "申", "未": "巳",
        "申": "寅", "酉": "亥", "戌": "申", "亥": "巳"
    }
}

def get_ganzhi_str(gz):
    """将干支对象转换为字符串"""
    return TIANGAN[gz.tg] + DIZHI[gz.dz]

def get_shichen(hour):
    """根据小时确定时辰"""
    return DIZHI[hour // 2]

def get_nayin(ganzhi):
    """获取纳音五行"""
    return NAYIN.get(ganzhi, "未知")

def get_cang_gan(dizhi):
    """获取地支藏干"""
    return DIZHI_CANGGAN.get(dizhi, [])

def get_cang_gan_with_wuxing(dizhi):
    """获取带五行的藏干"""
    cang_gans = get_cang_gan(dizhi)
    return [f"{gan}{TIANGAN_WUXING[gan]}" for gan in cang_gans]

def get_gan_shen(day_gan, other_gan):
    """计算天干十神"""
    # 以日干为主，计算其它天干的十神关系
    
    # 十神索引表 - 标准命理学顺序
    # 固定十神排列: 比肩、劫财、食神、伤官、偏财、正财、七杀、正官、偏印、正印
    SHISHEN_MAP = {
        # 甲见甲到癸
        "甲": ["比肩", "劫财", "食神", "伤官", "偏财", "正财", "七杀", "正官", "偏印", "正印"],
        # 乙见甲到癸
        "乙": ["劫财", "比肩", "伤官", "食神", "正财", "偏财", "正官", "七杀", "正印", "偏印"],
        # 丙见甲到癸
        "丙": ["偏印", "正印", "比肩", "劫财", "食神", "伤官", "偏财", "正财", "七杀", "正官"],
        # 丁见甲到癸
        "丁": ["正印", "偏印", "劫财", "比肩", "伤官", "食神", "正财", "偏财", "正官", "七杀"],
        # 戊见甲到癸
        "戊": ["七杀", "正官", "偏印", "正印", "比肩", "劫财", "食神", "伤官", "偏财", "正财"],
        # 己见甲到癸
        "己": ["正官", "七杀", "正印", "偏印", "劫财", "比肩", "伤官", "食神", "正财", "偏财"],
        # 庚见甲到癸
        "庚": ["偏财", "正财", "七杀", "正官", "偏印", "正印", "比肩", "劫财", "食神", "伤官"],
        # 辛见甲到癸
        "辛": ["正财", "偏财", "正官", "七杀", "正印", "偏印", "劫财", "比肩", "伤官", "食神"],
        # 壬见甲到癸
        "壬": ["食神", "伤官", "偏财", "正财", "七杀", "正官", "偏印", "正印", "比肩", "劫财"],
        # 癸见甲到癸
        "癸": ["伤官", "食神", "正财", "偏财", "正官", "七杀", "正印", "偏印", "劫财", "比肩"],
    }
    
    other_index = TIANGAN.index(other_gan)
    return SHISHEN_MAP[day_gan][other_index]

def get_zhi_shen(day_gan, cang_gans):
    """计算地支十神"""
    if not cang_gans:
        return ["无"] 
    return [get_gan_shen(day_gan, cg) for cg in cang_gans]

def get_shen_sha(year_gz, month_gz, day_gz, hour_gz):
    """获取四柱神煞（简化版）"""
    result = {"year": [], "month": [], "day": [], "hour": []}
    
    # 提取天干地支
    year_gan, year_zhi = year_gz[0], year_gz[1]
    month_gan, month_zhi = month_gz[0], month_gz[1]
    day_gan, day_zhi = day_gz[0], day_gz[1]
    hour_gan, hour_zhi = hour_gz[0], hour_gz[1]
    
    # 检查贵人
    if "贵人" in SHENSHAS and year_zhi in SHENSHAS["贵人"].get(day_gan, []):
        result["year"].append("贵人")
    if "贵人" in SHENSHAS and month_zhi in SHENSHAS["贵人"].get(day_gan, []):
        result["month"].append("贵人")
    if "贵人" in SHENSHAS and hour_zhi in SHENSHAS["贵人"].get(day_gan, []):
        result["hour"].append("贵人")
    
    # 检查天乙贵人
    if "天乙贵人" in SHENSHAS and year_zhi in SHENSHAS["天乙贵人"].get(day_gan, []):
        result["year"].append("天乙贵人")
    if "天乙贵人" in SHENSHAS and month_zhi in SHENSHAS["天乙贵人"].get(day_gan, []):
        result["month"].append("天乙贵人")
    if "天乙贵人" in SHENSHAS and hour_zhi in SHENSHAS["天乙贵人"].get(day_gan, []):
        result["hour"].append("天乙贵人")
    
    # 检查文昌
    if "文昌" in SHENSHAS and year_zhi == SHENSHAS["文昌"].get(day_gan, ""):
        result["year"].append("文昌")
    if "文昌" in SHENSHAS and month_zhi == SHENSHAS["文昌"].get(day_gan, ""):
        result["month"].append("文昌")
    if "文昌" in SHENSHAS and hour_zhi == SHENSHAS["文昌"].get(day_gan, ""):
        result["hour"].append("文昌")
    
    # 检查华盖
    if "华盖" in SHENSHAS and year_zhi == SHENSHAS["华盖"].get(year_zhi, ""):
        result["year"].append("华盖")
    if "华盖" in SHENSHAS and month_zhi == SHENSHAS["华盖"].get(month_zhi, ""):
        result["month"].append("华盖")
    if "华盖" in SHENSHAS and day_zhi == SHENSHAS["华盖"].get(day_zhi, ""):
        result["day"].append("华盖")
    if "华盖" in SHENSHAS and hour_zhi == SHENSHAS["华盖"].get(hour_zhi, ""):
        result["hour"].append("华盖")
    
    # 检查桃花
    if "桃花" in SHENSHAS and year_zhi == SHENSHAS["桃花"].get(year_zhi, ""):
        result["year"].append("桃花")
    if "桃花" in SHENSHAS and month_zhi == SHENSHAS["桃花"].get(month_zhi, ""):
        result["month"].append("桃花")
    if "桃花" in SHENSHAS and day_zhi == SHENSHAS["桃花"].get(day_zhi, ""):
        result["day"].append("桃花")
    if "桃花" in SHENSHAS and hour_zhi == SHENSHAS["桃花"].get(hour_zhi, ""):
        result["hour"].append("桃花")
    
    # 检查驿马
    if "驿马" in SHENSHAS and year_zhi == SHENSHAS["驿马"].get(year_zhi, ""):
        result["year"].append("驿马")
    if "驿马" in SHENSHAS and month_zhi == SHENSHAS["驿马"].get(month_zhi, ""):
        result["month"].append("驿马")
    if "驿马" in SHENSHAS and day_zhi == SHENSHAS["驿马"].get(day_zhi, ""):
        result["day"].append("驿马")
    if "驿马" in SHENSHAS and hour_zhi == SHENSHAS["驿马"].get(hour_zhi, ""):
        result["hour"].append("驿马")
    
    return result

def get_shengxiao(dizhi_index):
    """根据地支索引获取对应的生肖"""
    return SHENGXIAO[DIZHI[dizhi_index]]

def calculate_bazi(dt: datetime.datetime, longitude: float) -> Dict[str, str]:
    """使用sxtwl库计算八字"""
    
    # 真太阳时校正（简化版本）
    local_minutes = longitude * 4
    delta = datetime.timedelta(minutes=local_minutes - 120 * 4)  # 北京时间校正
    true_dt = dt + delta
    
    # 获取基本信息
    day = sxtwl.fromSolar(dt.year, dt.month, dt.day)
    
    # 计算年柱
    year_gz = day.getYearGZ()
    year_str = get_ganzhi_str(year_gz)
    
    # 计算月柱
    month_gz = day.getMonthGZ()
    month_str = get_ganzhi_str(month_gz)
    
    # 计算日柱
    day_gz = day.getDayGZ()
    day_str = get_ganzhi_str(day_gz)
    
    # 计算时柱
    hour_gz = day.getHourGZ(true_dt.hour)
    hour_str = get_ganzhi_str(hour_gz)
    
    # 时支
    shichen = get_shichen(true_dt.hour)
    
    # 提取天干地支
    year_gan, year_zhi = year_str[0], year_str[1]
    month_gan, month_zhi = month_str[0], month_str[1]
    day_gan, day_zhi = day_str[0], day_str[1]
    hour_gan, hour_zhi = hour_str[0], hour_str[1]
    
    # 计算干神
    gan_shen = {
        "year": get_gan_shen(day_gan, year_gan),
        "month": get_gan_shen(day_gan, month_gan),
        "day": "日主",
        "hour": get_gan_shen(day_gan, hour_gan)
    }
    
    # 提取天干
    tian_gan = {
        "year": year_gan,
        "month": month_gan,
        "day": day_gan,
        "hour": hour_gan
    }
    
    # 提取地支
    di_zhi = {
        "year": year_zhi,
        "month": month_zhi,
        "day": day_zhi,
        "hour": hour_zhi
    }
    
    # 计算藏干
    cang_gan = {
        "year": get_cang_gan_with_wuxing(year_zhi),
        "month": get_cang_gan_with_wuxing(month_zhi),
        "day": get_cang_gan_with_wuxing(day_zhi),
        "hour": get_cang_gan_with_wuxing(hour_zhi)
    }
    
    # 计算支神
    zhi_shen = {
        "year": get_zhi_shen(day_gan, get_cang_gan(year_zhi)),
        "month": get_zhi_shen(day_gan, get_cang_gan(month_zhi)),
        "day": get_zhi_shen(day_gan, get_cang_gan(day_zhi)),
        "hour": get_zhi_shen(day_gan, get_cang_gan(hour_zhi))
    }
    
    # 计算纳音
    na_yin = {
        "year": get_nayin(year_str),
        "month": get_nayin(month_str),
        "day": get_nayin(day_str),
        "hour": get_nayin(hour_str)
    }
    
    # 计算神煞
    shen_sha = get_shen_sha(year_str, month_str, day_str, hour_str)
    
    # 五行属性
    year_gan_wuxing = TIANGAN_WUXING.get(year_gan, "")
    month_gan_wuxing = TIANGAN_WUXING.get(month_gan, "")
    day_gan_wuxing = TIANGAN_WUXING.get(day_gan, "")
    hour_gan_wuxing = TIANGAN_WUXING.get(hour_gan, "")

    # 天干地支相生相克关系（使用五行属性）
    relations = {
        "tianGan": f"{year_gan}{year_gan_wuxing}→{month_gan}{month_gan_wuxing}→{day_gan}{day_gan_wuxing}→{hour_gan}{hour_gan_wuxing}",
        "diZhi": f"{year_zhi}→{month_zhi}→{day_zhi}→{hour_zhi}"
    }
    
    # 返回完整结果
    result = {
        "年柱": year_str,
        "月柱": month_str,
        "日柱": day_str,
        "时柱": hour_str,
        "ganShen": gan_shen,
        "tianGan": tian_gan,
        "diZhi": di_zhi,
        "cangGan": cang_gan,
        "zhiShen": zhi_shen,
        "naYin": na_yin,
        "shenSha": shen_sha,
        "relations": relations,
        "lunarDate": {
            "year": day.getLunarYear(),
            "month": day.getLunarMonth(),
            "day": day.getLunarDay(),
            "leap": day.isLunarLeap()
        },
        "zodiac": DIZHI[(day.getLunarYear() - 4) % 12],
        "zodiacCN": get_shengxiao((day.getLunarYear() - 4) % 12),
        "真太阳时": true_dt.strftime("%Y-%m-%d %H:%M"),
        "时支": shichen
    }
    
    return result
