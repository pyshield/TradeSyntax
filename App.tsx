import React, { useState, useEffect, useMemo } from 'react';
import { CandlestickChart } from './components/CandlestickChart';
import { AnalysisPanel } from './components/AnalysisPanel';
import { LiveVoiceControl } from './components/LiveVoiceControl';
import { generateMarketData } from './services/marketData';
import { analyzeMarketStructure } from './services/geminiService';
import { ChartContext, Timeframe, TradeSetup, Candle } from './types';
import { Zap, LayoutDashboard, Settings, Maximize2, Bell, Shield, Globe, RefreshCw, MoreHorizontal, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

const INITIAL_PRICE = 4900;

// --- Components ---

const MarketTicker = () => (
  <div className="flex items-center gap-8 overflow-x-auto whitespace-nowrap text-xs font-mono text-slate-400 py-2 px-4 border-b border-slate-800/50 bg-slate-900/30 mb-4 scrollbar-hide">
    <div className="flex items-center gap-2 pl-2">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
      <span className="text-emerald-400 font-bold">NY SESSION OPEN</span>
    </div>
    <div className="w-px h-3 bg-slate-700"></div>
    <div className="flex items-center gap-2">
      <span className="font-bold text-slate-300">BTC/USD</span>
      <span className="text-white">4,932.50</span>
      <span className="text-emerald-400 flex items-center"><ArrowUpRight className="w-3 h-3" /> 1.24%</span>
    </div>
    <div className="w-px h-3 bg-slate-700"></div>
    <div className="flex items-center gap-2">
      <span className="font-bold text-slate-300">ETH/USD</span>
      <span className="text-white">1,845.10</span>
      <span className="text-red-400 flex items-center"><ArrowDownRight className="w-3 h-3" /> 0.45%</span>
    </div>
    <div className="w-px h-3 bg-slate-700"></div>
     <div className="flex items-center gap-2">
      <span className="font-bold text-slate-300">VOLATILITY</span>
      <span className="text-amber-400">HIGH</span>
    </div>
    <div className="w-px h-3 bg-slate-700"></div>
     <div className="flex items-center gap-2">
      <span className="font-bold text-slate-300">NEXT NEWS</span>
      <span className="text-indigo-400">FOMC Minutes (2h 14m)</span>
    </div>
  </div>
);

const SettingsView = () => (
  <div className="max-w-4xl mx-auto w-full bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
    <div className="mb-8 pb-4 border-b border-slate-800">
      <h2 className="text-2xl font-bold text-white flex items-center gap-3">
        <Settings className="w-7 h-7 text-indigo-500" /> System Configuration
      </h2>
      <p className="text-slate-400 mt-2">Manage your trading preferences, API connections, and alert settings.</p>
    </div>
    
    <div className="space-y-8">
      {/* Account Section */}
      <section className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" /> Account & Security
          </h3>
          <p className="text-sm text-slate-500 mt-1">Manage API keys and access control.</p>
        </div>
        <div className="md:col-span-2 space-y-4">
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
            <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2 block">Gemini API Key Status</label>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded border border-emerald-500/20 text-sm font-mono">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                Active (Environment Variable)
              </div>
              <span className="text-xs text-slate-500">Managed via .env</span>
            </div>
          </div>
        </div>
      </section>

      {/* Trading Preferences */}
      <section className="grid md:grid-cols-3 gap-6 pt-6 border-t border-slate-800">
         <div className="md:col-span-1">
          <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <Globe className="w-4 h-4 text-indigo-400" /> Trading Preferences
          </h3>
          <p className="text-sm text-slate-500 mt-1">Customize chart parameters and risk.</p>
        </div>
        <div className="md:col-span-2 grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
             <label className="text-sm text-slate-300">Default Risk Per Trade</label>
             <select className="bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200 text-sm focus:border-indigo-500 outline-none transition-colors">
               <option>1% (Conservative)</option>
               <option>2% (Moderate)</option>
               <option>5% (Aggressive)</option>
             </select>
          </div>
          <div className="flex flex-col gap-2">
             <label className="text-sm text-slate-300">Timezone</label>
             <select className="bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200 text-sm focus:border-indigo-500 outline-none transition-colors">
               <option>UTC (Auto)</option>
               <option>New York (EST)</option>
               <option>London (BST)</option>
               <option>Tokyo (JST)</option>
             </select>
          </div>
          <div className="flex flex-col gap-2">
             <label className="text-sm text-slate-300">Chart Type</label>
             <select className="bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200 text-sm focus:border-indigo-500 outline-none transition-colors">
               <option>Candlestick</option>
               <option>Heikin Ashi</option>
               <option>Line</option>
             </select>
          </div>
        </div>
      </section>
      
      {/* Notifications */}
      <section className="grid md:grid-cols-3 gap-6 pt-6 border-t border-slate-800">
         <div className="md:col-span-1">
          <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400" /> Alerts & Sound
          </h3>
          <p className="text-sm text-slate-500 mt-1">Configure audio feedback.</p>
        </div>
         <div className="md:col-span-2 space-y-4">
            <label className="flex items-center gap-3 cursor-pointer group p-3 rounded-lg border border-slate-800 bg-slate-950 hover:border-slate-700 transition-all">
              <input type="checkbox" className="w-5 h-5 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900" defaultChecked />
              <div className="flex flex-col">
                <span className="text-slate-200 font-medium group-hover:text-white transition-colors">Setup Detection Sound</span>
                <span className="text-xs text-slate-500">Play a chime when AI identifies a high-confidence setup.</span>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group p-3 rounded-lg border border-slate-800 bg-slate-950 hover:border-slate-700 transition-all">
              <input type="checkbox" className="w-5 h-5 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900" defaultChecked />
              <div className="flex flex-col">
                <span className="text-slate-200 font-medium group-hover:text-white transition-colors">Live Analyst Voice Auto-Start</span>
                <span className="text-xs text-slate-500">Automatically connect to voice session on startup.</span>
              </div>
            </label>
         </div>
      </section>
    </div>
  </div>
);

// --- Main App ---

export default function App() {
  const [activeView, setActiveView] = useState<'dashboard' | 'settings'>('dashboard');
  
  const [charts, setCharts] = useState<ChartContext[]>([
    {
      id: 'daily',
      timeframe: Timeframe.Daily,
      symbol: 'BTC/USD',
      data: [],
      title: 'Daily: Major Supply Zone',
      description: 'Bias: Higher TF → Pullback in uptrend',
      supplyZones: [{ top: 5200, bottom: 5000, label: 'MAJOR SUPPLY' }],
      demandZones: [{ top: 4800, bottom: 4700, label: 'DAILY DEMAND' }]
    },
    {
      id: 'h4',
      timeframe: Timeframe.H4,
      symbol: 'BTC/USD',
      data: [],
      title: '4H: Short-term down',
      description: 'Relief bounce likely from demand',
      supplyZones: [{ top: 5000, bottom: 4950, label: 'ST RESISTANCE' }],
      demandZones: [{ top: 4820, bottom: 4700, label: 'SUPPORT' }]
    },
    {
      id: 'h2',
      timeframe: Timeframe.H2,
      symbol: 'BTC/USD',
      data: [],
      title: '2H: Consolidation',
      description: 'Possible breakout pending',
      supplyZones: [{ top: 5000, bottom: 4950, label: 'RESISTANCE' }]
    },
    {
      id: 'm30',
      timeframe: Timeframe.M30,
      symbol: 'BTC/USD',
      data: [],
      title: '30m: Intraday bounce',
      description: 'Micro pullback likely for entry',
      supplyZones: [{ top: 5000, bottom: 4950, label: 'MINOR RESISTANCE' }]
    }
  ]);

  const [aiSetups, setAiSetups] = useState<Record<string, TradeSetup | null>>({
    daily: {
      bias: 'Bullish',
      condition: 'Uptrend Pullback',
      entryZone: '4,700 - 4,800',
      targets: ['4,920', '5,000', '5,150'],
      invalidation: 'Below 4,700',
      summary: 'Price is respecting the daily demand zone. Look for LTF confirmations for long entries targeting the range high.',
      entryAdvice: 'Wait for a bullish engulfing candle on the 4H timeframe within the demand zone before entering.',
      riskRewardRatio: '1:3.5',
      confidenceScore: 85
    },
    h4: {
      bias: 'Bearish',
      condition: 'Short-term correction',
      entryZone: '4,950 - 5,000',
      targets: ['4,820', '4,700'],
      invalidation: 'Above 5,050',
      summary: 'Rejected from 5k psychological level. Expect rotation back to range lows unless volume spikes.',
      entryAdvice: 'Enter on a retest of the 4,950 resistance level with a tight stop loss.',
      riskRewardRatio: '1:2',
      confidenceScore: 65
    }
  });

  const [loadingAnalysis, setLoadingAnalysis] = useState<Record<string, boolean>>({});

  // Generate initial data
  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    // Determine a new random start price to simulate different market conditions
    const basePrice = 4500 + Math.random() * 1000;
    
    setCharts(prev => prev.map((chart, idx) => {
      // Vary volatility slightly per chart to simulate different timeframes visually
      const vol = 0.005 + (idx * 0.002);
      const points = 50 + (idx * 10);
      return {
        ...chart,
        data: generateMarketData(basePrice, points, vol)
      };
    }));
  };

  const handleAnalyze = async (chartId: string, timeframe: Timeframe, data: Candle[]) => {
    setLoadingAnalysis(prev => ({ ...prev, [chartId]: true }));
    
    // Simulate slight delay for UX or actually call API
    const setup = await analyzeMarketStructure(timeframe, data);
    
    if (setup) {
      setAiSetups(prev => ({ ...prev, [chartId]: setup }));
    }
    
    setLoadingAnalysis(prev => ({ ...prev, [chartId]: false }));
  };

  // Construct context string for the Live Analyst
  const liveContext = useMemo(() => {
    let context = "Here is the current dashboard status:\n";
    if (aiSetups['daily']) {
      context += `- Daily Chart: Bias is ${aiSetups['daily'].bias}. Summary: ${aiSetups['daily'].summary}\n`;
      context += `  Key Levels: Targets ${aiSetups['daily'].targets.join(', ')}. Invalidation ${aiSetups['daily'].invalidation}.\n`;
    }
    if (aiSetups['h4']) {
      context += `- 4H Chart: Bias is ${aiSetups['h4'].bias}. Summary: ${aiSetups['h4'].summary}\n`;
    }
    context += "The user is looking at these charts now. Focus on these specific setups.";
    return context;
  }, [aiSetups]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 h-14 flex items-center px-6 justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-indigo-600 to-violet-600 p-1.5 rounded-lg shadow-lg shadow-indigo-500/20">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-bold text-lg tracking-tight text-white">Trade<span className="text-indigo-400">Sync</span> <span className="text-slate-500 text-sm font-normal ml-1 border-l border-slate-700 pl-2">AI Terminal</span></h1>
        </div>
        
        <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
          <LiveVoiceControl context={liveContext} />
          
          <div className="h-6 w-px bg-slate-700 mx-2" />
          
          <button 
             onClick={() => setActiveView('dashboard')}
             className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
               activeView === 'dashboard' 
               ? 'bg-slate-800 text-white shadow-sm ring-1 ring-slate-700' 
               : 'hover:text-slate-200 hover:bg-slate-800/50'
             }`}
           >
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </button>

           <button
             onClick={() => setActiveView('settings')}
             className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
               activeView === 'settings' 
               ? 'bg-slate-800 text-white shadow-sm ring-1 ring-slate-700' 
               : 'hover:text-slate-200 hover:bg-slate-800/50'
             }`}
           >
            <Settings className="w-4 h-4" /> Settings
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto">
        {activeView === 'dashboard' ? (
          <div className="p-4 animate-in fade-in duration-300">
            
            <div className="flex justify-between items-center mb-2">
               <MarketTicker />
               <button 
                onClick={refreshData}
                className="flex items-center gap-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-lg border border-slate-700 transition-colors whitespace-nowrap ml-4 mb-4"
               >
                 <RefreshCw className="w-3.5 h-3.5" /> Regenerate Data
               </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-[minmax(350px,auto)]">
              {/* Top Left: Daily - The Anchor */}
              <section className="bg-slate-900 rounded-xl border border-slate-800 p-1 flex flex-col gap-0 relative group shadow-sm hover:border-slate-700 transition-colors">
                 {/* Card Header */}
                 <div className="flex justify-between items-center p-3 border-b border-slate-800/50 bg-slate-900/50">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                      <div>
                        <h2 className="text-sm font-bold text-slate-100">{charts[0].title}</h2>
                        <p className="text-slate-500 text-xs font-mono">{charts[0].description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded text-[10px] text-slate-400 font-mono tracking-wide">D1</span>
                       <button className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-white transition-colors"><Maximize2 className="w-3.5 h-3.5" /></button>
                       <button className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-white transition-colors"><MoreHorizontal className="w-3.5 h-3.5" /></button>
                    </div>
                 </div>
                
                <div className="flex-1 min-h-[200px] relative p-2">
                   <CandlestickChart 
                      data={charts[0].data} 
                      supplyZones={charts[0].supplyZones} 
                      demandZones={charts[0].demandZones} 
                   />
                   
                   <div className="absolute bottom-2 left-2 max-w-[280px] z-10 shadow-2xl">
                     <AnalysisPanel 
                       title="AI Bias Analysis" 
                       setup={aiSetups['daily'] || undefined}
                       loading={loadingAnalysis['daily']}
                       onAnalyze={() => handleAnalyze('daily', Timeframe.Daily, charts[0].data)}
                       className="backdrop-blur-md bg-slate-900/90 border-emerald-500/30"
                       isMain={true}
                     />
                   </div>
                </div>
              </section>

              {/* Top Right: 4H */}
              <section className="bg-slate-900 rounded-xl border border-slate-800 p-1 flex flex-col gap-0 shadow-sm hover:border-slate-700 transition-colors">
                <div className="flex justify-between items-center p-3 border-b border-slate-800/50 bg-slate-900/50">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                      <div>
                        <h2 className="text-sm font-bold text-slate-100">{charts[1].title}</h2>
                        <p className="text-slate-500 text-xs font-mono">{charts[1].description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded text-[10px] text-slate-400 font-mono tracking-wide">H4</span>
                       <button className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-white transition-colors"><Maximize2 className="w-3.5 h-3.5" /></button>
                    </div>
                 </div>
                <div className="flex-1 min-h-[200px] relative p-2">
                   <CandlestickChart 
                     data={charts[1].data}
                     supplyZones={charts[1].supplyZones}
                     demandZones={charts[1].demandZones}
                   />
                    <div className="absolute bottom-2 right-2 max-w-[260px] z-10 shadow-xl">
                     <AnalysisPanel 
                       title="Short-Term Outlook" 
                       setup={aiSetups['h4'] || undefined}
                       loading={loadingAnalysis['h4']}
                       onAnalyze={() => handleAnalyze('h4', Timeframe.H4, charts[1].data)}
                       className="backdrop-blur-md bg-slate-900/90 border-indigo-500/30"
                     />
                   </div>
                </div>
              </section>

              {/* Bottom Left: 2H */}
              <section className="bg-slate-900 rounded-xl border border-slate-800 p-1 flex flex-col gap-0 shadow-sm hover:border-slate-700 transition-colors">
                 <div className="flex justify-between items-center p-3 border-b border-slate-800/50 bg-slate-900/50">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                      <div>
                        <h2 className="text-sm font-bold text-slate-100">{charts[2].title}</h2>
                        <p className="text-slate-500 text-xs font-mono">{charts[2].description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded text-[10px] text-slate-400 font-mono tracking-wide">H2</span>
                       <button className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-white transition-colors"><Maximize2 className="w-3.5 h-3.5" /></button>
                    </div>
                 </div>
                <div className="flex-1 min-h-[200px] relative p-2">
                  <CandlestickChart 
                    data={charts[2].data}
                    supplyZones={charts[2].supplyZones}
                  />
                  {/* Embedded text note style */}
                  <div className="absolute top-10 left-10 bg-amber-500/10 text-amber-200 px-3 py-2 rounded border border-amber-500/30 text-xs max-w-[200px] backdrop-blur-sm">
                    <div className="font-bold mb-1 flex items-center gap-1 text-amber-400"><Activity className="w-3 h-3"/> Consolidation Phase</div>
                    Price squeezing between 4950 resistance and 4800 support. Awaiting volume expansion.
                  </div>
                </div>
              </section>

              {/* Bottom Right: Trade Execution / Main Idea */}
              <section className="bg-slate-900 rounded-xl border border-slate-800 p-1 flex flex-col gap-0 shadow-sm hover:border-slate-700 transition-colors">
                 <div className="flex justify-between items-center p-3 border-b border-slate-800/50 bg-slate-900/50">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                      <div>
                        <h2 className="text-sm font-bold text-white">Execution Plan</h2>
                        <p className="text-slate-500 text-xs font-mono">Confluence Check</p>
                      </div>
                    </div>
                    <span className="bg-indigo-600/20 border border-indigo-500/30 px-2 py-0.5 rounded text-[10px] text-indigo-300 font-bold uppercase tracking-wide">Active Strategy</span>
                 </div>
                
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-3">
                  <div className="h-full min-h-[200px]">
                     <CandlestickChart 
                       data={charts[3].data}
                       supplyZones={charts[3].supplyZones}
                     />
                  </div>
                  
                  {/* Enhanced Trade Cards */}
                  <div className="flex flex-col gap-3">
                    <div className="bg-gradient-to-br from-emerald-900/20 to-slate-900 border border-emerald-500/30 rounded-lg p-4 shadow-lg flex-1 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-bl-full -mr-8 -mt-8 transition-all group-hover:bg-emerald-500/20"></div>
                      
                      <div className="flex items-center gap-2 mb-3 border-b border-emerald-500/20 pb-2">
                        <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                        <h3 className="font-bold text-emerald-100 text-sm uppercase tracking-wider">Long Setup</h3>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-400">Entry Zone</span>
                          <span className="text-xs font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">4,800 - 4,820</span>
                        </div>
                         <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-400">Stop Loss</span>
                          <span className="text-xs font-mono font-bold text-red-300 bg-red-900/20 px-2 py-0.5 rounded border border-red-900/30">4,780</span>
                        </div>
                        
                         <div className="mt-2 pt-2 border-t border-emerald-500/10">
                            <span className="text-[10px] uppercase text-slate-500 font-bold mb-1 block">Take Profits</span>
                            <div className="flex gap-2">
                               <span className="text-[10px] font-mono text-emerald-400 bg-emerald-900/20 border border-emerald-500/20 px-1.5 py-0.5 rounded">TP1: 4,920</span>
                               <span className="text-[10px] font-mono text-emerald-400 bg-emerald-900/20 border border-emerald-500/20 px-1.5 py-0.5 rounded">TP2: 5,150</span>
                            </div>
                         </div>
                      </div>
                    </div>

                    {/* Short Setup (Compact) */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3 hover:border-red-500/30 transition-colors group">
                       <div className="flex items-center justify-between mb-1">
                          <h4 className="text-red-200 text-xs font-bold uppercase flex items-center gap-1">
                            <ArrowDownRight className="w-3 h-3" /> Hedge Short
                          </h4>
                          <span className="text-[10px] text-slate-500 bg-slate-800 px-1 rounded">IF 5K REJECTS</span>
                       </div>
                       <div className="flex justify-between items-center text-xs text-slate-300 font-mono mt-2">
                         <span className="text-slate-500">Entry: <span className="text-white">4,980</span></span>
                         <span className="text-slate-500">Target: <span className="text-white">4,700</span></span>
                       </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        ) : (
          <div className="p-4">
            <SettingsView />
          </div>
        )}
      </main>
    </div>
  );
}