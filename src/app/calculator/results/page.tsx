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
import { doBaziAnalysis, convertToBaziChart, AnalysisType } from '@/utils/deepseekApi';

// Define tab types
type TabType = 'basic' | 'personality' | 'overview' | 'fortune' | 'career' | 'love' | 'wealth';

// Format personality report text - Enhanced version
const formatReportText = (text: string) => {
  // Clean any potential markdown before processing
  // Remove markdown headers (###)
  let processedText = text.replace(/^###\s*(.+?)$/gm, '$1');
  
  // Remove other markdown headers (## and #)
  processedText = processedText.replace(/^##\s*(.+?)$/gm, '$1');
  processedText = processedText.replace(/^#\s*(.+?)$/gm, '$1');
  
  // Clean bold and italic markdown
  processedText = processedText.replace(/\*\*(.+?)\*\*/g, '$1');
  processedText = processedText.replace(/\*([^*]+)\*/g, '$1');
  
  // Now apply our own styling
  
  // Check if paragraph is a potential section header by length and content
  if (processedText.length < 60 && 
     (processedText.includes('Personality') || 
      processedText.includes('Character') || 
      processedText.includes('Career') || 
      processedText.includes('Relationship') || 
      processedText.includes('Health') || 
      processedText.includes('Wealth') || 
      processedText.includes('Life') || 
      processedText.includes('Fortune') || 
      processedText.includes('Analysis') || 
      processedText.includes('Recommendation'))) {
    return `<h4 class="text-lg font-medium text-amber-700 dark:text-amber-400 mt-6 mb-3">${processedText}</h4>`;
  }
  
  // Check if it's a subsection (usually contains ":")
  if (processedText.includes(':')) {
    const parts = processedText.split(':');
    if (parts[0].length < 50) {
      return `<div class="mb-2">
        <span class="font-semibold text-amber-600 dark:text-amber-400">${parts[0]}:</span>
        <span>${parts.slice(1).join(':')}</span>
      </div>`;
    }
  }
  
  // Process parenthetical remarks for emphasis
  processedText = processedText.replace(/\(([^)]+)\)/g, '<span class="text-blue-600 dark:text-blue-400">($1)</span>');
  
  // Highlight key terms
  const keyTerms = [
    'Day Master', 'Wood', 'Fire', 'Earth', 'Metal', 'Water',
    'Yin', 'Yang', 'Heavenly Stem', 'Earthly Branch',
    'Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'
  ];
  
  keyTerms.forEach(term => {
    const regex = new RegExp(`\\b${term}\\b`, 'g');
    processedText = processedText.replace(regex, `<span class="text-amber-600 dark:text-amber-400">${term}</span>`);
  });
  
  return `<p class="mb-4">${processedText}</p>`;
};

// Intelligently split text into sections, adding visual elements
const renderPersonalityReport = (reportText: string) => {
  if (!reportText) return null;
  
  // First, clean any unwanted markdown completely
  const cleanedText = reportText
    .replace(/^#+\s/gm, '')     // Remove Markdown headers
    .replace(/\*\*/g, '')       // Remove bold markup
    .replace(/\*/g, '')         // Remove italic markup
    .replace(/^-\s/gm, '')      // Remove list items
    .replace(/^>\s/gm, '');     // Remove blockquotes
  
  // Split by double newlines to get paragraphs
  const paragraphs = cleanedText.split(/\n\n+/);
  
  return (
    <div className="space-y-2">
      {paragraphs.map((paragraph, index) => {
        if (!paragraph.trim()) return null;
        
        // Format text and apply styles
        const formattedText = formatReportText(paragraph.trim());
        
        return (
          <div 
            key={index} 
            className="text-gray-700 dark:text-gray-300 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: formattedText }}
          />
        );
      })}
    </div>
  );
};

// Create a reusable component for rendering report sections
const renderReportSection = (
  title: string, 
  reportContent: string, 
  fetchReportFn: () => void, 
  description: string,
  isLoading: boolean,
  error: string | null
) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8">
    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
    
    {isLoading ? (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Generating report, please wait...</p>
      </div>
    ) : error ? (
      <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
        <p className="text-red-700 dark:text-red-400">{error}</p>
        <button 
          onClick={fetchReportFn}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    ) : reportContent ? (
      <div className="prose dark:prose-invert max-w-none">
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-lg p-6 mb-6">
          <h4 className="text-lg font-medium text-amber-800 dark:text-amber-400 mb-2">{title} Analysis</h4>
          <p className="text-gray-600 dark:text-gray-300">
            {description}
          </p>
        </div>
        
        {/* Render with intelligent formatting */}
        {renderPersonalityReport(reportContent)}
        
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print Report
              </button>
              
              <button
                onClick={() => {
                  // Clear specific report from localStorage
                  const reportKey = 
                    title === 'Personality' ? 'personalityReport' :
                    title === 'Life Overview' ? 'overviewReport' :
                    title === 'Fortune Years' ? 'fortuneReport' :
                    title === 'Career' ? 'careerReport' :
                    title === 'Love and Marriage' ? 'loveReport' :
                    title === 'Wealth' ? 'wealthReport' : '';
                    
                  if (reportKey) {
                    localStorage.removeItem(reportKey);
                    fetchReportFn(); // Regenerate report
                  }
                }}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Regenerate
              </button>
            </div>
            
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: `My BaZi ${title} Analysis`,
                    text: `Check out my BaZi ${title.toLowerCase()} analysis!`,
                    url: window.location.href,
                  });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copied to clipboard');
                }
              }}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share Report
            </button>
          </div>
        </div>
      </div>
    ) : (
      <div className="flex flex-col items-center py-8">
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Click the button below to generate a detailed {title.toLowerCase()} analysis report.
        </p>
        <button
          onClick={fetchReportFn}
          className="px-6 py-3 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
          </svg>
          Generate {title} Report
        </button>
      </div>
    )}
  </div>
);

export default function BaziResults() {
  const router = useRouter();
  const [sxtwlBaziChart, setSxtwlBaziChart] = useState<SxtwlBaziChart | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabType>('basic');
  
  // Reports content
  const [personalityReport, setPersonalityReport] = useState<string>('');
  const [overviewReport, setOverviewReport] = useState<string>('');
  const [fortuneReport, setFortuneReport] = useState<string>('');
  const [careerReport, setCareerReport] = useState<string>('');
  const [loveReport, setLoveReport] = useState<string>('');
  const [wealthReport, setWealthReport] = useState<string>('');
  
  // Individual loading states for each report type
  const [loadingStates, setLoadingStates] = useState({
    personality: false,
    overview: false,
    fortune: false,
    career: false,
    love: false,
    wealth: false
  });
  
  // Error states for each report
  const [errorStates, setErrorStates] = useState({
    personality: null as string | null,
    overview: null as string | null,
    fortune: null as string | null,
    career: null as string | null,
    love: null as string | null,
    wealth: null as string | null
  });

  useEffect(() => {
    // Get saved results from localStorage
    const savedData = localStorage.getItem('baziResults');
    const savedUserData = localStorage.getItem('baziUserData');
    
    // Load all saved reports from localStorage
    const savedPersonalityReport = localStorage.getItem('personalityReport');
    const savedOverviewReport = localStorage.getItem('overviewReport');
    const savedFortuneReport = localStorage.getItem('fortuneReport');
    const savedCareerReport = localStorage.getItem('careerReport');
    const savedLoveReport = localStorage.getItem('loveReport');
    const savedWealthReport = localStorage.getItem('wealthReport');
    
    if (savedData) {
      setSxtwlBaziChart(JSON.parse(savedData));
    } 
    if (savedUserData) {
      setUserData(JSON.parse(savedUserData));
    }
    if (savedPersonalityReport) setPersonalityReport(savedPersonalityReport);
    if (savedOverviewReport) setOverviewReport(savedOverviewReport);
    if (savedFortuneReport) setFortuneReport(savedFortuneReport);
    if (savedCareerReport) setCareerReport(savedCareerReport);
    if (savedLoveReport) setLoveReport(savedLoveReport);
    if (savedWealthReport) setWealthReport(savedWealthReport);
    
    if (!savedData) {
      // If no results, return to calculation page
      router.push('/calculator');
    }
  }, [router]);

  // Auto-fetch reports when switching tabs only if no saved data exists
  useEffect(() => {
    if (!sxtwlBaziChart) return;
    
    // Don't fetch if any report is currently loading
    const isAnyReportLoading = Object.values(loadingStates).some(state => state);
    if (isAnyReportLoading) return;
    
    // Only fetch if the report doesn't exist yet
    switch (activeTab) {
      case 'personality':
        if (!personalityReport && !localStorage.getItem('personalityReport')) 
          fetchPersonalityReport();
        break;
      case 'overview':
        if (!overviewReport && !localStorage.getItem('overviewReport')) 
          fetchOverviewReport();
        break;
      case 'fortune':
        if (!fortuneReport && !localStorage.getItem('fortuneReport')) 
          fetchFortuneReport();
        break;
      case 'career':
        if (!careerReport && !localStorage.getItem('careerReport')) 
          fetchCareerReport();
        break;
      case 'love':
        if (!loveReport && !localStorage.getItem('loveReport')) 
          fetchLoveReport();
        break;
      case 'wealth':
        if (!wealthReport && !localStorage.getItem('wealthReport')) 
          fetchWealthReport();
        break;
    }
  }, [activeTab, sxtwlBaziChart, loadingStates, personalityReport, overviewReport, fortuneReport, careerReport, loveReport, wealthReport]);

  // Clear saved reports when recalculating
  const handleRecalculate = () => {
    // Clear all saved reports
    localStorage.removeItem('personalityReport');
    localStorage.removeItem('overviewReport');
    localStorage.removeItem('fortuneReport');
    localStorage.removeItem('careerReport');
    localStorage.removeItem('loveReport');
    localStorage.removeItem('wealthReport');
    
    router.push('/calculator');
  };

  const fetchReport = async (reportType: AnalysisType) => {
    if (!sxtwlBaziChart) return;
    
    // Get the report key
    const reportKey = reportTypeToKey(reportType);
    
    // Set the loading state for the specific report type
    setLoadingStates(prev => ({
      ...prev,
      [reportKey]: true
    }));
    
    // Clear error for this specific report
    setErrorStates(prev => ({
      ...prev,
      [reportKey]: null
    }));
    
    try {
      // Convert SXTWL BaZi chart to DeepSeek API format
      const baziChart = convertToBaziChart(sxtwlBaziChart);
      const analysis = await doBaziAnalysis(baziChart, reportType);
      
      // Save to localStorage and state based on report type
      switch (reportType) {
        case 'overall':
          setPersonalityReport(analysis);
          localStorage.setItem('personalityReport', analysis);
          break;
        case 'age25':
          setOverviewReport(analysis);
          localStorage.setItem('overviewReport', analysis);
          break;
        case 'fortune':
          setFortuneReport(analysis);
          localStorage.setItem('fortuneReport', analysis);
          break;
        case 'career':
          setCareerReport(analysis);
          localStorage.setItem('careerReport', analysis);
          break;
        case 'marriage':
          setLoveReport(analysis);
          localStorage.setItem('loveReport', analysis);
          break;
        case 'wealth':
          setWealthReport(analysis);
          localStorage.setItem('wealthReport', analysis);
          break;
      }
    } catch (err) {
      console.error(`Failed to get ${reportType} analysis:`, err);
      // Set error for this specific report
      setErrorStates(prev => ({
        ...prev,
        [reportKey]: err instanceof Error ? err.message : 'Failed to get analysis'
      }));
    } finally {
      // Clear the loading state for the specific report type
      setLoadingStates(prev => ({
        ...prev,
        [reportKey]: false
      }));
    }
  };

  // Helper function to convert analysis type to loading state key
  const reportTypeToKey = (reportType: AnalysisType): string => {
    switch (reportType) {
      case 'overall': return 'personality';
      case 'age25': return 'overview';
      case 'fortune': return 'fortune';
      case 'career': return 'career';
      case 'marriage': return 'love';
      case 'wealth': return 'wealth';
      default: return 'personality';
    }
  };

  // Fetch personality report
  const fetchPersonalityReport = () => fetchReport('overall');
  
  // Fetch life overview report
  const fetchOverviewReport = () => fetchReport('age25');
  
  // Fetch fortune years report
  const fetchFortuneReport = () => fetchReport('fortune');
  
  // Fetch career report
  const fetchCareerReport = () => fetchReport('career');
  
  // Fetch love and marriage report
  const fetchLoveReport = () => fetchReport('marriage');
  
  // Fetch wealth report
  const fetchWealthReport = () => fetchReport('wealth');

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
            
            {/* Content for all analysis tabs using the reusable component */}
            {activeTab === 'personality' && renderReportSection(
              'Personality', 
              personalityReport, 
              fetchPersonalityReport,
              'Based on your BaZi chart, here is a comprehensive analysis of your personality and character traits.',
              loadingStates.personality,
              errorStates.personality
            )}
            
            {activeTab === 'overview' && renderReportSection(
              'Life Overview', 
              overviewReport, 
              fetchOverviewReport,
              'Based on your BaZi chart, here is a comprehensive overview of your life and upcoming years.',
              loadingStates.overview,
              errorStates.overview
            )}
            
            {activeTab === 'fortune' && renderReportSection(
              'Fortune Years', 
              fortuneReport, 
              fetchFortuneReport,
              'Based on your BaZi chart, here is an analysis of significant years and their potential impact on your life.',
              loadingStates.fortune,
              errorStates.fortune
            )}
            
            {activeTab === 'career' && renderReportSection(
              'Career', 
              careerReport, 
              fetchCareerReport,
              'Based on your BaZi chart, here is an analysis of your career potential, strengths, and opportunities.',
              loadingStates.career,
              errorStates.career
            )}
            
            {activeTab === 'love' && renderReportSection(
              'Love and Marriage', 
              loveReport, 
              fetchLoveReport,
              'Based on your BaZi chart, here is an analysis of your relationships, marriage prospects, and love life.',
              loadingStates.love,
              errorStates.love
            )}
            
            {activeTab === 'wealth' && renderReportSection(
              'Wealth', 
              wealthReport, 
              fetchWealthReport,
              'Based on your BaZi chart, here is an analysis of your wealth potential, financial trends, and money management.',
              loadingStates.wealth,
              errorStates.wealth
            )}
          </div>
        </div>
      </div>
    </div>
  );
}