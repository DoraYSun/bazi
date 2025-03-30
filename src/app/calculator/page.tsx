'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doBaziCalculation, doBaziAnalysis, BaziChart as BaziChartType, AnalysisType } from '@/utils/deepseekApi';
import { doSxtwlBaziCalculation, SxtwlBaziChart } from '@/utils/sxtwlApi';
import CitySearch, { City } from '@/components/CitySearch/CitySearch';
import { 
  formatTianGan, 
  formatDiZhi, 
  formatShiShen, 
  formatCangGan, 
  formatNaYin,
  formatRelation,
  getChineseZodiacFromDizhi,
  formatZodiac
} from '@/utils/formatBaziContent';

// 分析报告类型
interface AnalysisReport {
  type: AnalysisType;
  content: string;
  timestamp: string;
}

// Year range for the date picker
const currentYear = new Date().getFullYear();
const yearRange = Array.from({ length: 100 }, (_, i) => currentYear - 99 + i);
const monthRange = Array.from({ length: 12 }, (_, i) => i + 1);
const dayRange = Array.from({ length: 31 }, (_, i) => i + 1);
const hourRange = Array.from({ length: 24 }, (_, i) => i);
const minuteRange = Array.from({ length: 60 }, (_, i) => i);

export default function Calculator() {
  const router = useRouter();
  const [calendarType, setCalendarType] = useState('solar');
  const [birthYear, setBirthYear] = useState(1990);
  const [birthMonth, setBirthMonth] = useState(1);
  const [birthDay, setBirthDay] = useState(1);
  const [birthHour, setBirthHour] = useState(12);
  const [birthMinute, setBirthMinute] = useState(0);
  const [gender, setGender] = useState('male');
  const [userName, setUserName] = useState('');
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [customLocation, setCustomLocation] = useState('');
  const [customLongitude, setCustomLongitude] = useState('');
  const [showCustomLocation, setShowCustomLocation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 新增状态
  const [baziChart, setBaziChart] = useState<BaziChartType | null>(null);
  const [selectedAnalysisType, setSelectedAnalysisType] = useState<AnalysisType | null>(null);
  const [analysisReport, setAnalysisReport] = useState<AnalysisReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // 新增逻辑推演相关状态
  const [isSxtwlLoading, setIsSxtwlLoading] = useState(false);
  const [sxtwlBaziChart, setSxtwlBaziChart] = useState<SxtwlBaziChart | null>(null);
  const [sxtwlError, setSxtwlError] = useState('');

  const handleCitySelect = (city: City) => {
    setSelectedCity(city);
  };

  const handleCalculate = async () => {
    try {
      // 验证所有必填项 - 允许默认值作为有效输入
      // birthYear, birthMonth, birthDay, birthHour, birthMinute 都有默认值，所以不需要额外验证
      if (!gender) {
        setError('Please specify gender');
        return;
      }

      // 位置验证 - 确保至少有一种位置信息
      if ((!showCustomLocation && !selectedCity) || (showCustomLocation && (!customLocation || !customLongitude))) {
        setError('Please specify a valid location');
        return;
      }

      setIsLoading(true);
      setError('');
      
      // 准备用户数据
      const userData = {
        calendarType,
        birthYear,
        birthMonth,
        birthDay,
        birthHour,
        birthMinute,
        gender,
        userName,
        location: showCustomLocation 
          ? customLocation 
          : selectedCity ? selectedCity.name : '',
        longitude: showCustomLocation 
          ? parseFloat(customLongitude) 
          : selectedCity ? parseFloat(selectedCity.lng) : 0
      };

      // 调用 DeepSeek API 进行八字排盘
      const chart = await doBaziCalculation(userData);
      setBaziChart(chart);
      
      // 重置之前的分析结果
      setSelectedAnalysisType(null);
      setAnalysisReport(null);
      
      // 重置逻辑推演结果
      setSxtwlBaziChart(null);
      setSxtwlError('');
      
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Calculation error:', err);
      setIsLoading(false);
    }
  };

  // 新增逻辑推演方法
  const handleSxtwlCalculate = async () => {
    try {
      // 验证必填项
      if (!gender) {
        setSxtwlError('Please specify gender');
        return;
      }

      // 位置验证
      if ((!showCustomLocation && !selectedCity) || (showCustomLocation && (!customLocation || !customLongitude))) {
        setSxtwlError('Please specify a valid location');
        return;
      }

      setIsSxtwlLoading(true);
      setSxtwlError('');
      
      // 准备用户数据
      const userData = {
        calendarType,
        birthYear,
        birthMonth,
        birthDay,
        birthHour,
        birthMinute,
        gender,
        userName,
        location: showCustomLocation 
          ? customLocation 
          : selectedCity ? selectedCity.name : '',
        longitude: showCustomLocation 
          ? parseFloat(customLongitude) 
          : selectedCity ? parseFloat(selectedCity.lng) : 0
      };

      // 调用 SXTWL API 进行八字排盘
      const chart = await doSxtwlBaziCalculation(userData);
      
      // 存储计算结果到state
      setSxtwlBaziChart(chart);
      
      // 将结果保存到localStorage
      localStorage.setItem('baziResults', JSON.stringify(chart));
      // 将用户输入的数据也保存到localStorage
      localStorage.setItem('baziUserData', JSON.stringify(userData));
      
      // 导航到结果页面
      router.push('/calculator/results');
      
      setIsSxtwlLoading(false);
    } catch (err) {
      setSxtwlError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('SXTWL calculation error:', err);
      setIsSxtwlLoading(false);
    }
  };

  // 处理分析请求
  const handleAnalysis = async (type: AnalysisType) => {
    try {
      setIsAnalyzing(true);
      setError('');
      setSelectedAnalysisType(type);

      if (!baziChart) {
        throw new Error('Please complete BaZi calculation first');
      }

      // 调用 DeepSeek API 进行具体分析
      const analysisContent = await doBaziAnalysis(baziChart, type);
      
      setAnalysisReport({
        type,
        content: analysisContent,
        timestamp: new Date().toISOString()
      });

      setIsAnalyzing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Analysis error:', err);
      setIsAnalyzing(false);
    }
  };

  // 处理关键词的中英文对照
  const processKeyTerms = (text: string) => {
    // 替换常见命理学关键词为中英文对照格式
    const keyTerms = [
      { en: "Five Elements", zh: "五行" },
      { en: "Wood", zh: "木" },
      { en: "Fire", zh: "火" },
      { en: "Earth", zh: "土" },
      { en: "Metal", zh: "金" },
      { en: "Water", zh: "水" },
      { en: "Heavenly Stem", zh: "天干" },
      { en: "Earthly Branch", zh: "地支" },
      { en: "Day Master", zh: "日主" },
      { en: "Yin", zh: "阴" },
      { en: "Yang", zh: "阳" },
      { en: "Ten Gods", zh: "十神" },
      { en: "Direct Officer", zh: "正官" },
      { en: "Indirect Officer", zh: "七杀" },
      { en: "Direct Resource", zh: "正印" },
      { en: "Indirect Resource", zh: "偏印" },
      { en: "Direct Wealth", zh: "正财" },
      { en: "Indirect Wealth", zh: "偏财" },
      { en: "Eating God", zh: "食神" },
      { en: "Hurting Officer", zh: "伤官" },
      { en: "Friend", zh: "比肩" },
      { en: "Robbing Wealth", zh: "劫财" },
      { en: "Luck Pillar", zh: "大运" },
      { en: "Annual Pillar", zh: "流年" },
      // 添加更多术语
      { en: "Nobility", zh: "贵人" },
      { en: "Scholar", zh: "文昌" },
      { en: "General", zh: "将星" },
      { en: "Flying Star", zh: "飞星" },
      { en: "Self Element", zh: "日元" },
      { en: "Stems and Branches", zh: "干支" },
      { en: "Life Star", zh: "命宫" },
      { en: "Influence", zh: "格局" },
      { en: "Strong", zh: "旺" },
      { en: "Weak", zh: "弱" },
      { en: "Birth Chart", zh: "命盘" },
      { en: "Fortune", zh: "运势" },
      { en: "Natal Chart", zh: "本命" },
      { en: "Peach Blossom", zh: "桃花" },
      { en: "Six Harmony", zh: "六合" },
      { en: "Three Harmony", zh: "三合" },
      { en: "Six Clash", zh: "六冲" },
      { en: "Three Punishment", zh: "三刑" },
      { en: "Year Pillar", zh: "年柱" },
      { en: "Month Pillar", zh: "月柱" },
      { en: "Day Pillar", zh: "日柱" },
      { en: "Hour Pillar", zh: "时柱" },
      { en: "Zodiac Sign", zh: "生肖" },
      { en: "Lunar Calendar", zh: "阴历" },
      { en: "Solar Calendar", zh: "阳历" }
    ];

    // 检查文本是否已经包含中英文对照格式
    // 如果已经有中英文对照了，我们不需要再处理
    if (/[\u4e00-\u9fa5]\s*\([a-zA-Z\s]+\)|\([a-zA-Z\s]+\)\s*[\u4e00-\u9fa5]/.test(text)) {
      return text;
    }

    let processedText = text;
    keyTerms.forEach(term => {
      // 使用正则表达式替换英文词汇，避免替换已经是双语格式的文本
      const enRegex = new RegExp(`\\b${term.en}\\b(?!.*\\(${term.zh}\\))`, 'g');
      processedText = processedText.replace(enRegex, `${term.en} (${term.zh})`);
      
      // 使用正则表达式替换中文词汇，避免替换已经是双语格式的文本
      const zhRegex = new RegExp(`\\b${term.zh}\\b(?!.*\\(${term.en}\\))`, 'g');
      processedText = processedText.replace(zhRegex, `${term.en} (${term.zh})`);
    });

    return processedText;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">BaZi Calculator<br/><span className="text-xl font-normal">(八字排盘)</span></h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Please enter your birth information to get a destiny analysis.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mt-2">
            All fields have default values that can be used directly. Only birth location needs to be selected.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8 max-w-2xl mx-auto">
          <div className="mb-6">
            <div className="flex justify-center space-x-4 mb-6">
              <button
                onClick={() => setCalendarType('solar')}
                className={`px-4 py-2 rounded-md ${
                  calendarType === 'solar'
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Solar
              </button>
              <button
                onClick={() => setCalendarType('lunar')}
                className={`px-4 py-2 rounded-md ${
                  calendarType === 'lunar'
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Lunar
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="userName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name (Optional)
                </label>
                <input
                  type="text"
                  id="userName"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Your name"
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="birthYear" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Birth Year <span className="text-red-500">*</span>
                </label>
                <select
                  id="birthYear"
                  value={birthYear}
                  onChange={(e) => setBirthYear(Number(e.target.value))}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  {yearRange.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="birthMonth" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Birth Month <span className="text-red-500">*</span>
                </label>
                <select
                  id="birthMonth"
                  value={birthMonth}
                  onChange={(e) => setBirthMonth(Number(e.target.value))}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  {monthRange.map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="birthDay" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Birth Day <span className="text-red-500">*</span>
                </label>
                <select
                  id="birthDay"
                  value={birthDay}
                  onChange={(e) => setBirthDay(Number(e.target.value))}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  {dayRange.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="birthHour" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Birth Hour <span className="text-red-500">*</span>
                </label>
                <select
                  id="birthHour"
                  value={birthHour}
                  onChange={(e) => setBirthHour(Number(e.target.value))}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  {hourRange.map((hour) => (
                    <option key={hour} value={hour}>
                      {hour.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="birthMinute" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Birth Minute <span className="text-red-500">*</span>
                </label>
                <select
                  id="birthMinute"
                  value={birthMinute}
                  onChange={(e) => setBirthMinute(Number(e.target.value))}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  {minuteRange.map((minute) => (
                    <option key={minute} value={minute}>
                      {minute.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Gender <span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio text-amber-600"
                      name="gender"
                      value="male"
                      checked={gender === 'male'}
                      onChange={() => setGender('male')}
                    />
                    <span className="ml-2 text-gray-700 dark:text-gray-300">Male</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio text-amber-600"
                      name="gender"
                      value="female"
                      checked={gender === 'female'}
                      onChange={() => setGender('female')}
                    />
                    <span className="ml-2 text-gray-700 dark:text-gray-300">Female</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label htmlFor="birthLocation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Birth Location <span className="text-red-500">*</span>
                </label>
                <div className="mb-2">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio text-amber-600"
                      name="locationType"
                      checked={!showCustomLocation}
                      onChange={() => setShowCustomLocation(false)}
                      required
                    />
                    <span className="ml-2 text-gray-700 dark:text-gray-300">Search City</span>
                  </label>
                  <label className="inline-flex items-center ml-4">
                    <input
                      type="radio"
                      className="form-radio text-amber-600"
                      name="locationType"
                      checked={showCustomLocation}
                      onChange={() => setShowCustomLocation(true)}
                    />
                    <span className="ml-2 text-gray-700 dark:text-gray-300">Custom Location</span>
                  </label>
                </div>
                
                {!showCustomLocation ? (
                  <CitySearch 
                    selectedCity={selectedCity}
                    onCitySelect={handleCitySelect}
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <input
                        type="text"
                        id="customLocation"
                        placeholder="Location Name"
                        value={customLocation}
                        onChange={(e) => setCustomLocation(e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        required={showCustomLocation}
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        id="customLongitude"
                        placeholder="Longitude (e.g.: 114.06 or -73.94)"
                        value={customLongitude}
                        onChange={(e) => setCustomLongitude(e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        required={showCustomLocation}
                      />
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        * East longitude is positive, west longitude is negative
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleCalculate}
              disabled={isLoading}
              className={`hidden w-full sm:w-auto px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg shadow-md transition-colors ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Calculating...' : 'Calculate with Current Values'}
            </button>
            <button
              onClick={handleSxtwlCalculate}
              disabled={isSxtwlLoading}
              className={`w-full sm:w-auto px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-md transition-colors ${
                isSxtwlLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSxtwlLoading ? 'Calculating...' : 'BaZi Chart'}
            </button>
          </div>
          <p className="mt-2 text-sm text-center text-gray-500 dark:text-gray-400">
            You can use default values for all required fields
          </p>
        </div>

        {/* 八字排盘结果 */}
        {baziChart && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8 max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">BaZi Chart Results</h2>
            
            {/* 排盘表格 */}
            <div className="overflow-x-auto mb-8">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700">
                    <th className="border border-gray-300 dark:border-gray-600 p-2 w-1/5"></th>
                    <th className="border border-gray-300 dark:border-gray-600 p-2 w-1/5 text-center text-gray-600 dark:text-gray-300">Year Pillar<br/><span className="text-xs">年柱</span></th>
                    <th className="border border-gray-300 dark:border-gray-600 p-2 w-1/5 text-center text-gray-600 dark:text-gray-300">Month Pillar<br/><span className="text-xs">月柱</span></th>
                    <th className="border border-gray-300 dark:border-gray-600 p-2 w-1/5 text-center text-gray-600 dark:text-gray-300">Day Pillar<br/><span className="text-xs">日柱</span></th>
                    <th className="border border-gray-300 dark:border-gray-600 p-2 w-1/5 text-center text-gray-600 dark:text-gray-300">Hour Pillar<br/><span className="text-xs">时柱</span></th>
                  </tr>
                </thead>
                <tbody>
                  {/* 干神行 */}
                  <tr>
                    <td className="border border-gray-300 dark:border-gray-600 p-2 bg-gray-50 dark:bg-gray-800 font-medium text-gray-600 dark:text-gray-300">Gan Shen<br/><span className="text-xs">干神</span></td>
                    <td className="border border-gray-300 dark:border-gray-600 p-2 text-center text-blue-600 dark:text-blue-400">{baziChart.ganShen.year}</td>
                    <td className="border border-gray-300 dark:border-gray-600 p-2 text-center text-green-600 dark:text-green-400">{baziChart.ganShen.month}</td>
                    <td className="border border-gray-300 dark:border-gray-600 p-2 text-center text-amber-700 dark:text-amber-500">{baziChart.ganShen.day}</td>
                    <td className="border border-gray-300 dark:border-gray-600 p-2 text-center text-teal-600 dark:text-teal-400">{baziChart.ganShen.hour}</td>
                  </tr>
                  
                  {/* 天干行 */}
                  <tr>
                    <td className="border border-gray-300 dark:border-gray-600 p-2 bg-gray-50 dark:bg-gray-800 font-medium text-gray-600 dark:text-gray-300">Heavenly Stem<br/><span className="text-xs">天干</span></td>
                    <td className="border border-gray-300 dark:border-gray-600 p-2 text-center text-blue-600 dark:text-blue-400 text-xl font-bold">{baziChart.tianGan.year}</td>
                    <td className="border border-gray-300 dark:border-gray-600 p-2 text-center text-green-600 dark:text-green-400 text-xl font-bold">{baziChart.tianGan.month}</td>
                    <td className="border border-gray-300 dark:border-gray-600 p-2 text-center text-amber-700 dark:text-amber-500 text-xl font-bold">{baziChart.tianGan.day}</td>
                    <td className="border border-gray-300 dark:border-gray-600 p-2 text-center text-teal-600 dark:text-teal-400 text-xl font-bold">{baziChart.tianGan.hour}</td>
                  </tr>
                  
                  {/* 地支行 */}
                  <tr>
                    <td className="border border-gray-300 dark:border-gray-600 p-2 bg-gray-50 dark:bg-gray-800 font-medium text-gray-600 dark:text-gray-300">Earthly Branch<br/><span className="text-xs">地支</span></td>
                    <td className="border border-gray-300 dark:border-gray-600 p-2 text-center text-orange-600 dark:text-orange-400 text-xl font-bold">{baziChart.diZhi.year}</td>
                    <td className="border border-gray-300 dark:border-gray-600 p-2 text-center text-orange-600 dark:text-orange-400 text-xl font-bold">{baziChart.diZhi.month}</td>
                    <td className="border border-gray-300 dark:border-gray-600 p-2 text-center text-orange-600 dark:text-orange-400 text-xl font-bold">{baziChart.diZhi.day}</td>
                    <td className="border border-gray-300 dark:border-gray-600 p-2 text-center text-orange-600 dark:text-orange-400 text-xl font-bold">{baziChart.diZhi.hour}</td>
                  </tr>
                  
                  {/* 藏干行 */}
                  <tr>
                    <td className="border border-gray-300 dark:border-gray-600 p-2 bg-gray-50 dark:bg-gray-800 font-medium text-gray-600 dark:text-gray-300">Hidden Stem<br/><span className="text-xs">藏干</span></td>
                    <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">
                      {baziChart.cangGan.year.map((cg, idx) => (
                        <div key={idx} className={`${idx > 0 ? 'mt-1' : ''} text-amber-600 dark:text-amber-400`}>{cg}</div>
                      ))}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">
                      {baziChart.cangGan.month.map((cg, idx) => (
                        <div key={idx} className={`${idx > 0 ? 'mt-1' : ''} text-amber-600 dark:text-amber-400`}>{cg}</div>
                      ))}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">
                      {baziChart.cangGan.day.map((cg, idx) => (
                        <div key={idx} className={`${idx > 0 ? 'mt-1' : ''} text-amber-600 dark:text-amber-400`}>{cg}</div>
                      ))}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">
                      {baziChart.cangGan.hour.map((cg, idx) => (
                        <div key={idx} className={`${idx > 0 ? 'mt-1' : ''} text-amber-600 dark:text-amber-400`}>{cg}</div>
                      ))}
                    </td>
                  </tr>
                  
                  {/* 支神行 */}
                  <tr>
                    <td className="border border-gray-300 dark:border-gray-600 p-2 bg-gray-50 dark:bg-gray-800 font-medium text-gray-600 dark:text-gray-300">Branch Deity<br/><span className="text-xs">支神</span></td>
                    <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">
                      {baziChart.zhiShen.year.map((zs, idx) => (
                        <div key={idx} className={`${idx > 0 ? 'mt-1' : ''} text-indigo-600 dark:text-indigo-400`}>{zs}</div>
                      ))}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">
                      {baziChart.zhiShen.month.map((zs, idx) => (
                        <div key={idx} className={`${idx > 0 ? 'mt-1' : ''} text-indigo-600 dark:text-indigo-400`}>{zs}</div>
                      ))}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">
                      {baziChart.zhiShen.day.map((zs, idx) => (
                        <div key={idx} className={`${idx > 0 ? 'mt-1' : ''} text-indigo-600 dark:text-indigo-400`}>{zs}</div>
                      ))}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">
                      {baziChart.zhiShen.hour.map((zs, idx) => (
                        <div key={idx} className={`${idx > 0 ? 'mt-1' : ''} text-indigo-600 dark:text-indigo-400`}>{zs}</div>
                      ))}
                    </td>
                  </tr>
                  
                  {/* 纳音行 */}
                  <tr>
                    <td className="border border-gray-300 dark:border-gray-600 p-2 bg-gray-50 dark:bg-gray-800 font-medium text-gray-600 dark:text-gray-300">Na Yin<br/><span className="text-xs">纳音</span></td>
                    <td className="border border-gray-300 dark:border-gray-600 p-2 text-center text-purple-600 dark:text-purple-400">{baziChart.naYin.year}</td>
                    <td className="border border-gray-300 dark:border-gray-600 p-2 text-center text-purple-600 dark:text-purple-400">{baziChart.naYin.month}</td>
                    <td className="border border-gray-300 dark:border-gray-600 p-2 text-center text-purple-600 dark:text-purple-400">{baziChart.naYin.day}</td>
                    <td className="border border-gray-300 dark:border-gray-600 p-2 text-center text-purple-600 dark:text-purple-400">{baziChart.naYin.hour}</td>
                  </tr>
                  
                  {/* 神煞行 */}
                  <tr>
                    <td className="border border-gray-300 dark:border-gray-600 p-2 bg-gray-50 dark:bg-gray-800 font-medium text-gray-600 dark:text-gray-300">Shen Sha<br/><span className="text-xs">神煞</span></td>
                    <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">
                      {baziChart.shenSha.year.map((ss, idx) => (
                        <div key={idx} className={`${idx > 0 ? 'mt-1' : ''} text-red-600 dark:text-red-400`}>{ss}</div>
                      ))}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">
                      {baziChart.shenSha.month.map((ss, idx) => (
                        <div key={idx} className={`${idx > 0 ? 'mt-1' : ''} text-red-600 dark:text-red-400`}>{ss}</div>
                      ))}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">
                      {baziChart.shenSha.day.map((ss, idx) => (
                        <div key={idx} className={`${idx > 0 ? 'mt-1' : ''} text-red-600 dark:text-red-400`}>{ss}</div>
                      ))}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">
                      {baziChart.shenSha.hour.map((ss, idx) => (
                        <div key={idx} className={`${idx > 0 ? 'mt-1' : ''} text-red-600 dark:text-red-400`}>{ss}</div>
                      ))}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            {/* 天干地支相生相克关系 */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Five Elements Relationships <span className="text-sm font-normal">(天干地支相生相克)</span></h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <h4 className="font-medium text-amber-600 dark:text-amber-400 mb-2">Heavenly Stem Relationships <span className="text-sm font-normal">(天干相生相克)</span></h4>
                  <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                    {baziChart.relations.tianGan}
                  </p>
                </div>
                <div className="border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <h4 className="font-medium text-amber-600 dark:text-amber-400 mb-2">Earthly Branch Relationships <span className="text-sm font-normal">(地支相生相克)</span></h4>
                  <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                    {baziChart.relations.diZhi}
                  </p>
                </div>
              </div>
            </div>
            
            {/* 阴历生日和属相 */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Lunar Date & Zodiac <span className="text-sm font-normal">(阴历生日与属相)</span></h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <h4 className="font-medium text-amber-600 dark:text-amber-400 mb-2">Lunar Date <span className="text-sm font-normal">(阴历生日)</span></h4>
                  <div className="flex flex-col text-gray-700 dark:text-gray-200">
                    <div className="flex items-start">
                      <p className="text-xl font-bold">
                        {baziChart.lunarDate.year}年
                        {baziChart.lunarDate.leap ? '闰' : ''}
                        {baziChart.lunarDate.month}月
                        {baziChart.lunarDate.day}日
                      </p>
                    </div>
                  </div>
                </div>
                <div className="border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <h4 className="font-medium text-amber-600 dark:text-amber-400 mb-2">Zodiac Sign <span className="text-sm font-normal">(属相)</span></h4>
                  <div className="flex items-center">
                    <p className="text-xl font-bold text-gray-700 dark:text-gray-200">
                      {formatZodiac(baziChart.zodiac)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 推荐中文名 */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recommended Chinese Names <span className="text-sm font-normal">(推荐中文名)</span></h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {baziChart.recommendedNames.map((nameInfo, index) => (
                  <div key={index} className="border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                    <h4 className="font-medium text-amber-600 dark:text-amber-400 mb-2">
                      Name {index + 1} <span className="text-sm font-normal">(推荐名 {index + 1})</span>
                    </h4>
                    <p className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2 text-center">
                      {nameInfo.name}
                    </p>
                    <p className="text-base text-gray-600 dark:text-gray-400 mb-2 text-center">
                      <span className="font-medium">Pinyin:</span> {nameInfo.pinyin}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Meaning:</span> {nameInfo.meaning}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Analysis <span className="text-sm font-normal">(基础分析)</span></h3>
              <div className="prose dark:prose-invert prose-amber max-w-none">
                <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                  {baziChart.analysis}
                </p>
              </div>
            </div>

            {/* 分析类型选择 */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Select Analysis Type <span className="text-sm font-normal">(选择分析类型)</span></h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <button
                  onClick={() => handleAnalysis('overall')}
                  disabled={isAnalyzing}
                  className={`p-4 border border-amber-200 dark:border-amber-800 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors ${
                    selectedAnalysisType === 'overall' ? 'bg-amber-100 dark:bg-amber-900/30' : ''
                  }`}
                >
                  <div className="text-lg font-medium text-amber-600 dark:text-amber-400">Overall Analysis <span className="text-sm font-normal">(整体分析)</span></div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Comprehensive BaZi chart interpretation</div>
                </button>
                <button
                  onClick={() => handleAnalysis('age25')}
                  disabled={isAnalyzing}
                  className={`p-4 border border-amber-200 dark:border-amber-800 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors ${
                    selectedAnalysisType === 'age25' ? 'bg-amber-100 dark:bg-amber-900/30' : ''
                  }`}
                >
                  <div className="text-lg font-medium text-amber-600 dark:text-amber-400">Age 25 Forecast <span className="text-sm font-normal">(25岁运势)</span></div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Focus on this significant age</div>
                </button>
                <button
                  onClick={() => handleAnalysis('career')}
                  disabled={isAnalyzing}
                  className={`p-4 border border-amber-200 dark:border-amber-800 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors ${
                    selectedAnalysisType === 'career' ? 'bg-amber-100 dark:bg-amber-900/30' : ''
                  }`}
                >
                  <div className="text-lg font-medium text-amber-600 dark:text-amber-400">Career Analysis <span className="text-sm font-normal">(事业分析)</span></div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Professional development and opportunities</div>
                </button>
                <button
                  onClick={() => handleAnalysis('marriage')}
                  disabled={isAnalyzing}
                  className={`p-4 border border-amber-200 dark:border-amber-800 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors ${
                    selectedAnalysisType === 'marriage' ? 'bg-amber-100 dark:bg-amber-900/30' : ''
                  }`}
                >
                  <div className="text-lg font-medium text-amber-600 dark:text-amber-400">Marriage Analysis <span className="text-sm font-normal">(婚姻分析)</span></div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Relationship fortune and compatibility</div>
                </button>
                <button
                  onClick={() => handleAnalysis('wealth')}
                  disabled={isAnalyzing}
                  className={`p-4 border border-amber-200 dark:border-amber-800 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors ${
                    selectedAnalysisType === 'wealth' ? 'bg-amber-100 dark:bg-amber-900/30' : ''
                  }`}
                >
                  <div className="text-lg font-medium text-amber-600 dark:text-amber-400">Wealth Analysis <span className="text-sm font-normal">(财运分析)</span></div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Financial opportunities and advice</div>
                </button>
                <button
                  onClick={() => handleAnalysis('health')}
                  disabled={isAnalyzing}
                  className={`p-4 border border-amber-200 dark:border-amber-800 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors ${
                    selectedAnalysisType === 'health' ? 'bg-amber-100 dark:bg-amber-900/30' : ''
                  }`}
                >
                  <div className="text-lg font-medium text-amber-600 dark:text-amber-400">Health Analysis <span className="text-sm font-normal">(健康分析)</span></div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Physical condition and wellness tips</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SXTWL 八字计算结果部分修改为按钮 */}
        {sxtwlBaziChart && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => {
                // 将结果保存到localStorage
                localStorage.setItem('baziResults', JSON.stringify(sxtwlBaziChart));
                // 导航到结果页面
                router.push('/calculator/results');
              }}
              className="px-6 py-3 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors font-medium text-lg"
            >
              View BaZi Chart Results
            </button>
          </div>
        )}

        {/* 分析报告 */}
        {analysisReport && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8 max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {analysisReport.type === 'overall' && 'Overall Analysis Report'} <span className="text-lg font-normal">{analysisReport.type === 'overall' && '(整体分析报告)'}</span>
                {analysisReport.type === 'age25' && 'Age 25 Forecast Report'} <span className="text-lg font-normal">{analysisReport.type === 'age25' && '(25岁运势分析)'}</span>
                {analysisReport.type === 'career' && 'Career Analysis Report'} <span className="text-lg font-normal">{analysisReport.type === 'career' && '(事业分析报告)'}</span>
                {analysisReport.type === 'marriage' && 'Marriage Analysis Report'} <span className="text-lg font-normal">{analysisReport.type === 'marriage' && '(婚姻分析报告)'}</span>
                {analysisReport.type === 'wealth' && 'Wealth Analysis Report'} <span className="text-lg font-normal">{analysisReport.type === 'wealth' && '(财运分析报告)'}</span>
                {analysisReport.type === 'health' && 'Health Analysis Report'} <span className="text-lg font-normal">{analysisReport.type === 'health' && '(健康分析报告)'}</span>
              </h2>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(analysisReport.timestamp).toLocaleString('en-US')}
              </div>
            </div>
            <div className="prose dark:prose-invert prose-amber max-w-none">
              <div className="whitespace-pre-line text-gray-600 dark:text-gray-300 leading-relaxed">
                {processKeyTerms(analysisReport.content)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 