import React from 'react';
import { TradeSetup } from '../types';
import { RefreshCw, TrendingUp, AlertTriangle, Target, XCircle, Activity, ClipboardList, Scale } from 'lucide-react';

interface Props {
  title: string;
  setup?: TradeSetup;
  loading?: boolean;
  onAnalyze?: () => void;
  className?: string;
  isMain?: boolean;
}

export const AnalysisPanel: React.FC<Props> = ({ title, setup, loading, onAnalyze, className, isMain }) => {
  return (
    <div className={`bg-slate-800/50 border border-slate-700 rounded-lg p-4 flex flex-col h-full relative overflow-hidden ${className}`}>
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-emerald-400" />
          <h3 className="font-bold text-slate-100 uppercase tracking-wider text-sm">{title}</h3>
        </div>
        {onAnalyze && (
          <button 
            onClick={onAnalyze} 
            disabled={loading}
            className="text-xs flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-1 rounded transition-colors disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
            {loading ? 'Analyzing...' : 'AI Analyze'}
          </button>
        )}
      </div>

      {!setup ? (
        <div className="flex-1 flex items-center justify-center text-slate-500 text-xs italic">
          Waiting for analysis data...
        </div>
      ) : (
        <div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700">
          {/* Bias Header */}
          <div className={`flex items-center justify-between p-2 rounded ${
            setup.bias === 'Bullish' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
            setup.bias === 'Bearish' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
            'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
          }`}>
            <div className="flex items-center gap-2">
               <TrendingUp className="w-4 h-4" />
               <span className="font-bold text-sm">{setup.bias}</span>
            </div>
            <span className="text-xs font-mono opacity-80">{setup.condition}</span>
          </div>

          {/* Setup Details */}
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
               <span className="w-2 h-2 rounded-full bg-slate-400 mt-1.5 shrink-0" />
               <p className="text-slate-300 text-xs leading-relaxed">
                 {setup.summary}
               </p>
            </div>

            {/* Entry Advice Section */}
            {setup.entryAdvice && (
              <div className="mt-2 bg-indigo-900/20 border border-indigo-500/20 p-2 rounded">
                 <h4 className="text-[10px] uppercase text-indigo-300 font-bold mb-1 flex items-center gap-1">
                   <Activity className="w-3 h-3" /> Entry Advice
                 </h4>
                 <p className="text-indigo-100 text-xs italic">
                   "{setup.entryAdvice}"
                 </p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="bg-slate-900/50 p-2 rounded border border-slate-700/50">
                <div className="flex items-center gap-1 text-emerald-400 mb-1 text-xs font-bold uppercase">
                  <Target className="w-3 h-3" /> Targets
                </div>
                <div className="flex flex-col gap-0.5">
                  {setup.targets.map((t, i) => (
                    <span key={i} className="text-slate-200 font-mono text-xs">TP{i+1}: {t}</span>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900/50 p-2 rounded border border-slate-700/50 flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-1 text-red-400 mb-1 text-xs font-bold uppercase">
                    <XCircle className="w-3 h-3" /> Invalidation
                    </div>
                    <span className="text-slate-200 font-mono text-xs block mb-2">{setup.invalidation}</span>
                </div>
                
                {setup.riskRewardRatio && (
                    <div className="pt-2 border-t border-slate-700/50">
                        <div className="flex items-center gap-1 text-amber-400 mb-0.5 text-xs font-bold uppercase">
                        <Scale className="w-3 h-3" /> R:R Ratio
                        </div>
                        <span className="text-slate-200 font-mono text-xs">{setup.riskRewardRatio}</span>
                    </div>
                )}
              </div>
            </div>
          </div>
          
          {isMain && setup.confidenceScore !== undefined && (
             <div className="mt-auto pt-2 border-t border-slate-700/50">
               <div className="text-xs text-slate-500 flex justify-between items-center mb-1">
                 <span>Confidence Score</span>
                 <span className={`${
                     setup.confidenceScore >= 80 ? 'text-emerald-400' : 
                     setup.confidenceScore >= 50 ? 'text-yellow-400' : 'text-red-400'
                 } font-mono font-bold`}>{setup.confidenceScore}%</span>
               </div>
               <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                 <div 
                   className={`h-full transition-all duration-500 ${
                     setup.confidenceScore >= 80 ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' : 
                     setup.confidenceScore >= 50 ? 'bg-gradient-to-r from-yellow-600 to-yellow-400' : 'bg-gradient-to-r from-red-600 to-red-400'
                   }`}
                   style={{ width: `${setup.confidenceScore}%` }}
                 ></div>
               </div>
             </div>
          )}
        </div>
      )}
    </div>
  );
};