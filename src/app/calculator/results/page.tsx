'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SxtwlBaziChart } from '@/utils/sxtwlApi';
import Link from 'next/link';
import { 
  formatTianGan, 
  formatDiZhi, 
  formatShiShen, 
  formatCangGan, 
  formatNaYin,
  formatRelation,
  getChineseZodiacFromDizhi,
  formatZodiac,
  zodiacTranslations
} from '@/utils/formatBaziContent';

// Define tab types
type TabType = 'basic' | 'personality' | 'overview' | 'fortune' | 'career' | 'love' | 'wealth';

export default function BaziResults() {
  const router = useRouter();
  const [sxtwlBaziChart, setSxtwlBaziChart] = useState<SxtwlBaziChart | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabType>('basic');

  useEffect(() => {
    // Get saved results from localStorage
    const savedData = localStorage.getItem('baziResults');
    const savedUserData = localStorage.getItem('baziUserData');
    if (savedData) {
      setSxtwlBaziChart(JSON.parse(savedData));
    } 
    if (savedUserData) {
      setUserData(JSON.parse(savedUserData));
    }
    if (!savedData) {
      // If no results, return to calculation page
      router.push('/calculator');
    }
  }, [router]);

  const handleRecalculate = () => {
    router.push('/calculator');
  };

  if (!sxtwlBaziChart) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600 dark:text-gray-400">Loading results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">SXTWL BaZi Results <span className="text-lg font-normal">(BaZi Chart Results)</span></h2>
          <button
            onClick={handleRecalculate}
            className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
          >
            Recalculate
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          {/* Left navigation panel - fixed position */}
          <div className="bg-gray-900 text-white rounded-lg shadow-lg p-6 md:sticky md:top-6 h-fit">
            <nav className="space-y-3">
              <button
                onClick={() => setActiveTab('basic')}
                className={`w-full flex items-center gap-3 p-3 ${activeTab === 'basic' ? 'bg-gray-800' : 'hover:bg-gray-800'} rounded-md transition-colors text-left`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${activeTab === 'basic' ? 'text-amber-500' : 'text-gray-400'}`} viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                <span className={activeTab === 'basic' ? 'text-white font-medium' : 'text-gray-300'}>Basic Information</span>
              </button>
              
              <button
                onClick={() => setActiveTab('personality')}
                className={`w-full flex items-center gap-3 p-3 ${activeTab === 'personality' ? 'bg-gray-800' : 'hover:bg-gray-800'} rounded-md transition-colors text-left`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className={activeTab === 'personality' ? 'text-white font-medium' : 'text-gray-300'}>Personality Report</span>
              </button>
              
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center gap-3 p-3 ${activeTab === 'overview' ? 'bg-gray-800' : 'hover:bg-gray-800'} rounded-md transition-colors text-left`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className={activeTab === 'overview' ? 'text-white font-medium' : 'text-gray-300'}>Life Overview</span>
              </button>
              
              <button
                onClick={() => setActiveTab('fortune')}
                className={`w-full flex items-center gap-3 p-3 ${activeTab === 'fortune' ? 'bg-gray-800' : 'hover:bg-gray-800'} rounded-md transition-colors text-left`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className={activeTab === 'fortune' ? 'text-white font-medium' : 'text-gray-300'}>Fortune Years</span>
              </button>
              
              <button
                onClick={() => setActiveTab('career')}
                className={`w-full flex items-center gap-3 p-3 ${activeTab === 'career' ? 'bg-gray-800' : 'hover:bg-gray-800'} rounded-md transition-colors text-left`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className={activeTab === 'career' ? 'text-white font-medium' : 'text-gray-300'}>Career</span>
              </button>
              
              <button
                onClick={() => setActiveTab('love')}
                className={`w-full flex items-center gap-3 p-3 ${activeTab === 'love' ? 'bg-gray-800' : 'hover:bg-gray-800'} rounded-md transition-colors text-left`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className={activeTab === 'love' ? 'text-white font-medium' : 'text-gray-300'}>Love and Marriage</span>
              </button>
              
              <button
                onClick={() => setActiveTab('wealth')}
                className={`w-full flex items-center gap-3 p-3 ${activeTab === 'wealth' ? 'bg-gray-800' : 'hover:bg-gray-800'} rounded-md transition-colors text-left`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className={activeTab === 'wealth' ? 'text-white font-medium' : 'text-gray-300'}>Wealth</span>
              </button>
            </nav>
          </div>
          
          {/* Right content area - scrollable */}
          <div className="md:col-span-3 md:max-h-[calc(100vh-6rem)] md:overflow-y-auto">
            {activeTab === 'basic' && (
              <>
                {/* User information summary card */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8 mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* User basic information */}
                    <div>
                      <div className="flex items-start">
                        <div className="flex-1">
                          {userData?.userName && (
                            <p className="text-gray-700 dark:text-gray-200">
                              <span className="font-medium">Name:</span> {userData.userName}
                            </p>
                          )}
                          <p className="text-gray-700 dark:text-gray-200">
                            <span className="font-medium">Gender:</span> {userData?.gender === 'male' ? 'Male' : 'Female'}
                          </p>
                          <p className="text-gray-700 dark:text-gray-200">
                            <span className="font-medium">Solar:</span> {userData?.birthYear}-{userData?.birthMonth.toString().padStart(2, '0')}-{userData?.birthDay.toString().padStart(2, '0')} {userData?.birthHour.toString().padStart(2, '0')}:{userData?.birthMinute?.toString().padStart(2, '0')}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Solar time and lunar information */}
                    <div>
                      <div className="flex items-start">
                        <div className="flex-1">
                          {sxtwlBaziChart?.真太阳时 && (
                            <>
                              <p className="text-gray-700 dark:text-gray-200">
                                <span className="font-medium">True Solar Time:</span> {sxtwlBaziChart.真太阳时}
                              </p>
                            </>
                          )}
                          {sxtwlBaziChart?.lunarDate && (
                            <p className="text-gray-700 dark:text-gray-200">
                              <span className="font-medium">Lunar:</span> Year {sxtwlBaziChart.lunarDate.year}, {sxtwlBaziChart.lunarDate.leap ? 'Leap ' : ''}{sxtwlBaziChart.lunarDate.month} lunar month, {sxtwlBaziChart.lunarDate.day} day, {sxtwlBaziChart.diZhi.hour} hour
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Chart table */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8 mb-8">
                  <div className="overflow-x-auto mb-8">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100 dark:bg-gray-700">
                          <th className="border border-gray-300 dark:border-gray-600 p-2 w-1/5"></th>
                          <th className="border border-gray-300 dark:border-gray-600 p-2 w-1/5 text-center text-gray-600 dark:text-gray-300">Year Pillar</th>
                          <th className="border border-gray-300 dark:border-gray-600 p-2 w-1/5 text-center text-gray-600 dark:text-gray-300">Month Pillar</th>
                          <th className="border border-gray-300 dark:border-gray-600 p-2 w-1/5 text-center text-gray-600 dark:text-gray-300">Day Pillar</th>
                          <th className="border border-gray-300 dark:border-gray-600 p-2 w-1/5 text-center text-gray-600 dark:text-gray-300">Hour Pillar</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Gan Shen row */}
                        <tr>
                          <td className="border border-gray-300 dark:border-gray-600 p-2 bg-gray-50 dark:bg-gray-800 font-medium text-gray-600 dark:text-gray-300">Gan Shen</td>
                          <td className="border border-gray-300 dark:border-gray-600 p-2 text-center text-blue-600 dark:text-blue-400">{formatShiShen(sxtwlBaziChart.ganShen.year)}</td>
                          <td className="border border-gray-300 dark:border-gray-600 p-2 text-center text-green-600 dark:text-green-400">{formatShiShen(sxtwlBaziChart.ganShen.month)}</td>
                          <td className="border border-gray-300 dark:border-gray-600 p-2 text-center text-amber-700 dark:text-amber-500">{formatShiShen(sxtwlBaziChart.ganShen.day)}</td>
                          <td className="border border-gray-300 dark:border-gray-600 p-2 text-center text-teal-600 dark:text-teal-400">{formatShiShen(sxtwlBaziChart.ganShen.hour)}</td>
                        </tr>
                        
                        {/* Heavenly Stem row */}
                        <tr>
                          <td className="border border-gray-300 dark:border-gray-600 p-2 bg-gray-50 dark:bg-gray-800 font-medium text-gray-600 dark:text-gray-300">Heavenly Stem</td>
                          <td className="border border-gray-300 dark:border-gray-600 p-2 text-center text-blue-600 dark:text-blue-400 text-lg font-bold">{formatTianGan(sxtwlBaziChart.tianGan.year)}</td>
                          <td className="border border-gray-300 dark:border-gray-600 p-2 text-center text-green-600 dark:text-green-400 text-lg font-bold">{formatTianGan(sxtwlBaziChart.tianGan.month)}</td>
                          <td className="border border-gray-300 dark:border-gray-600 p-2 text-center text-amber-700 dark:text-amber-500 text-lg font-bold">{formatTianGan(sxtwlBaziChart.tianGan.day)}</td>
                          <td className="border border-gray-300 dark:border-gray-600 p-2 text-center text-teal-600 dark:text-teal-400 text-lg font-bold">{formatTianGan(sxtwlBaziChart.tianGan.hour)}</td>
                        </tr>
                        
                        {/* Earthly Branch row */}
                        <tr>
                          <td className="border border-gray-300 dark:border-gray-600 p-2 bg-gray-50 dark:bg-gray-800 font-medium text-gray-600 dark:text-gray-300">Earthly Branch</td>
                          <td className="border border-gray-300 dark:border-gray-600 p-2 text-center text-orange-600 dark:text-orange-400 text-lg font-bold">{formatDiZhi(sxtwlBaziChart.diZhi.year)}</td>
                          <td className="border border-gray-300 dark:border-gray-600 p-2 text-center text-orange-600 dark:text-orange-400 text-lg font-bold">{formatDiZhi(sxtwlBaziChart.diZhi.month)}</td>
                          <td className="border border-gray-300 dark:border-gray-600 p-2 text-center text-orange-600 dark:text-orange-400 text-lg font-bold">{formatDiZhi(sxtwlBaziChart.diZhi.day)}</td>
                          <td className="border border-gray-300 dark:border-gray-600 p-2 text-center text-orange-600 dark:text-orange-400 text-lg font-bold">{formatDiZhi(sxtwlBaziChart.diZhi.hour)}</td>
                        </tr>
                        
                        {/* Hidden Stem row */}
                        <tr>
                          <td className="border border-gray-300 dark:border-gray-600 p-2 bg-gray-50 dark:bg-gray-800 font-medium text-gray-600 dark:text-gray-300">Hidden Stem</td>
                          <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">
                            {sxtwlBaziChart.cangGan.year.map((cg, idx) => (
                              <div key={idx} className={`${idx > 0 ? 'mt-1' : ''} text-amber-600 dark:text-amber-400`}>{formatCangGan(cg)}</div>
                            ))}
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">
                            {sxtwlBaziChart.cangGan.month.map((cg, idx) => (
                              <div key={idx} className={`${idx > 0 ? 'mt-1' : ''} text-amber-600 dark:text-amber-400`}>{formatCangGan(cg)}</div>
                            ))}
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">
                            {sxtwlBaziChart.cangGan.day.map((cg, idx) => (
                              <div key={idx} className={`${idx > 0 ? 'mt-1' : ''} text-amber-600 dark:text-amber-400`}>{formatCangGan(cg)}</div>
                            ))}
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">
                            {sxtwlBaziChart.cangGan.hour.map((cg, idx) => (
                              <div key={idx} className={`${idx > 0 ? 'mt-1' : ''} text-amber-600 dark:text-amber-400`}>{formatCangGan(cg)}</div>
                            ))}
                          </td>
                        </tr>
                        
                        {/* Branch Deity row */}
                        <tr>
                          <td className="border border-gray-300 dark:border-gray-600 p-2 bg-gray-50 dark:bg-gray-800 font-medium text-gray-600 dark:text-gray-300">Branch Deity</td>
                          <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">
                            {sxtwlBaziChart.zhiShen.year.map((zs, idx) => (
                              <div key={idx} className={`${idx > 0 ? 'mt-1' : ''} text-indigo-600 dark:text-indigo-400`}>{formatShiShen(zs)}</div>
                            ))}
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">
                            {sxtwlBaziChart.zhiShen.month.map((zs, idx) => (
                              <div key={idx} className={`${idx > 0 ? 'mt-1' : ''} text-indigo-600 dark:text-indigo-400`}>{formatShiShen(zs)}</div>
                            ))}
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">
                            {sxtwlBaziChart.zhiShen.day.map((zs, idx) => (
                              <div key={idx} className={`${idx > 0 ? 'mt-1' : ''} text-indigo-600 dark:text-indigo-400`}>{formatShiShen(zs)}</div>
                            ))}
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">
                            {sxtwlBaziChart.zhiShen.hour.map((zs, idx) => (
                              <div key={idx} className={`${idx > 0 ? 'mt-1' : ''} text-indigo-600 dark:text-indigo-400`}>{formatShiShen(zs)}</div>
                            ))}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {/* Chinese Zodiac component - MOVED TO BOTTOM */}
                <div className="bg-gray-800 rounded-lg shadow-lg p-6 md:p-8 mb-8">
                  <h3 className="text-lg font-semibold text-amber-500 mb-4">Chinese Zodiac</h3>
                  
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex items-start">
                      {sxtwlBaziChart?.zodiac && (
                        <div className="flex flex-col items-start">
                          <h4 className="text-3xl font-bold text-red-500 mb-2">
                            {getChineseZodiacFromDizhi(sxtwlBaziChart.zodiac)} ({zodiacTranslations[getChineseZodiacFromDizhi(sxtwlBaziChart.zodiac)]})
                          </h4>
                          <p className="text-gray-300 mb-4">
                            {formatTianGan(sxtwlBaziChart.tianGan.year)} {formatDiZhi(sxtwlBaziChart.zodiac)} 
                          </p>
                          <div className="bg-amber-900/30 rounded-full p-4 mb-4">
                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-500/30 to-orange-500/30 flex items-center justify-center relative">
                              <div className="absolute inset-0 flex items-center justify-center">
                                <svg viewBox="0 0 100 100" className="w-full h-full text-orange-600/20">
                                  <circle cx="50" cy="50" r="45" fill="currentColor" />
                                </svg>
                              </div>
                              <span className="relative text-orange-500 text-6xl font-bold">
                                {getChineseZodiacFromDizhi(sxtwlBaziChart.zodiac)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 flex flex-col">
                      <div className="mb-4">
                        <h5 className="font-semibold text-white mb-1">[Loyal and Reliable]</h5>
                        <p className="text-gray-300">
                          {zodiacTranslations[getChineseZodiacFromDizhi(sxtwlBaziChart?.zodiac || '')]} is loyal and dependable, a strong support for friends and family.
                        </p>
                      </div>
                      
                      <div className="mb-4">
                        <h5 className="font-semibold text-white mb-1">[Just]</h5>
                        <p className="text-gray-300">
                          They bravely speak out against injustice, earning respect.
                        </p>
                      </div>
                      
                      <div className="mb-4">
                        <h5 className="font-semibold text-white mb-1">[Patient and Meticulous]</h5>
                        <p className="text-gray-300">
                          {zodiacTranslations[getChineseZodiacFromDizhi(sxtwlBaziChart?.zodiac || '')]} is patient and thorough, ensuring high efficiency.
                        </p>
                      </div>
                      
                      <div className="mb-4">
                        <h5 className="font-semibold text-white mb-1">[Emotional]</h5>
                        <p className="text-gray-300">
                          Sometimes easily affected emotionally, they need to regulate their feelings.
                        </p>
                      </div>
                      
                      <div className="mb-4">
                        <h5 className="font-semibold text-white mb-1">[Harmonious Relationships]</h5>
                        <p className="text-gray-300">
                          They have a harmonious relationship with friends, progressing together and supporting each other.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* BaZi Patterns section - MOVED TO BOTTOM */}
                <div className="bg-gray-800 rounded-lg shadow-lg p-6 md:p-8 mb-8">
                  <h3 className="text-lg font-semibold text-amber-500 mb-4">BaZi Patterns</h3>
                  
                  <div className="mb-6">
                    <h4 className="text-xl font-semibold text-amber-500 mb-2">Talent Pattern</h4>
                    
                    <p className="text-gray-300 mb-4">
                      As a Talent type, you symbolize a kind-hearted and optimistic sage, considered a deity of fortune. You are optimistic, love life, and have a particular fondness for food, often seen as a gourmet. You are naturally blessed, especially in terms of basic needs, never worrying about food and clothing. This gives you a relaxed and carefree attitude towards life.
                    </p>
                    
                    <p className="text-gray-300 mb-4">
                      As a Talent, you are emotionally delicate, kind-hearted, and loving. You are intelligent, eloquent, and talented, with refined tastes. However, you can be somewhat laid-back, loving freedom and disliking constraints. You tend to daydream, but with strong self-discipline and financial support, you can turn your ideas into reality, embodying the saying "Talent generates wealth, and fortune comes naturally."
                    </p>
                    
                    <p className="text-gray-300 mb-4">
                      Your sage-like qualities and optimistic attitude give you a wide range of career options. You can excel in the food industry as a food critic, restaurateur, or chef. Your intelligent and flexible mind and eloquence also suit roles involving communication, such as teacher, trainer, marketer, or broadcaster. Additionally, your refined taste and talent make you thrive in creative fields like design, writing, or art.
                    </p>
                    
                    <p className="text-gray-300">
                      Keep your optimism and kindness, using your wisdom and talent to enrich your life. While pursuing freedom and quality of life, remember to turn your dreams into reality, making your life more fulfilling and beautiful.
                    </p>
                  </div>
                </div>
              </>
            )}
            
            {/* Content for other tabs */}
            {activeTab === 'personality' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Personality Report</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  This content requires premium access. Please upgrade your account to view the complete personality analysis.
                </p>
              </div>
            )}
            
            {activeTab === 'overview' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Life Overview</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  This content requires premium access. Please upgrade your account to view the complete life overview analysis.
                </p>
              </div>
            )}
            
            {activeTab === 'fortune' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Fortune Years</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  This content requires premium access. Please upgrade your account to view the complete fortune years analysis.
                </p>
              </div>
            )}
            
            {activeTab === 'career' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Career</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  This content requires premium access. Please upgrade your account to view the complete career analysis.
                </p>
              </div>
            )}
            
            {activeTab === 'love' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Love and Marriage</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  This content requires premium access. Please upgrade your account to view the complete love and marriage analysis.
                </p>
              </div>
            )}
            
            {activeTab === 'wealth' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Wealth</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  This content requires premium access. Please upgrade your account to view the complete wealth analysis.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}