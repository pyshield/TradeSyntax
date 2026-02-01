import React, { useMemo } from 'react';
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  Line,
  Cell
} from 'recharts';
import { Candle } from '../types';

interface Props {
  data: Candle[];
  height?: number;
  supplyZones?: { top: number; bottom: number; label: string }[];
  demandZones?: { top: number; bottom: number; label: string }[];
}

export const CandlestickChart: React.FC<Props> = ({ data, height = 300, supplyZones, demandZones }) => {
  // Pre-process data to create ranges for Wicks and Bodies
  // This avoids the need for Custom Shapes that rely on unstable internal API access (yAxis.scale)
  const processedData = useMemo(() => {
    return data.map(d => ({
      ...d,
      // Body is the range between Open and Close
      body: [Math.min(d.open, d.close), Math.max(d.open, d.close)], 
      // Wick is the range between Low and High
      wick: [d.low, d.high],
      // Determine color based on price action
      color: d.close >= d.open ? '#22c55e' : '#ef4444', // green-500 : red-500
    }));
  }, [data]);

  const minPrice = Math.min(...data.map(d => d.low));
  const maxPrice = Math.max(...data.map(d => d.high));
  const padding = (maxPrice - minPrice) * 0.1;

  // Custom Tooltip to display OHLC data clearly
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // payload[0] corresponds to the first chart element (the wick in our case), which contains the full payload
      const dataItem = payload[0].payload; 
      return (
        <div className="bg-slate-800 border border-slate-700 p-2 text-xs rounded shadow-lg z-50">
          <p className="text-slate-400 mb-1">{new Date(dataItem.time).toLocaleString()}</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-200">
            <span>O: {dataItem.open.toFixed(2)}</span>
            <span>H: {dataItem.high.toFixed(2)}</span>
            <span>L: {dataItem.low.toFixed(2)}</span>
            <span>C: {dataItem.close.toFixed(2)}</span>
          </div>
          {dataItem.ma7 && <div className="text-sky-400 mt-1">MA7: {dataItem.ma7.toFixed(2)}</div>}
          {dataItem.ma25 && <div className="text-pink-400">MA25: {dataItem.ma25.toFixed(2)}</div>}
          {dataItem.ma99 && <div className="text-orange-400">MA99: {dataItem.ma99.toFixed(2)}</div>}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={processedData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.4} />
        
        <XAxis 
          dataKey="time" 
          tickFormatter={(tick) => new Date(tick).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}
          stroke="#94a3b8" 
          fontSize={11}
          minTickGap={30}
        />
        
        <YAxis 
          domain={[minPrice - padding, maxPrice + padding]} 
          stroke="#94a3b8"
          fontSize={11}
          tickFormatter={(val) => val.toFixed(0)}
          orientation="right"
        />

        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#334155', opacity: 0.1 }} />

        {/* Zones */}
        {supplyZones?.map((zone, idx) => (
          <ReferenceArea
            key={`supply-${idx}`}
            y1={zone.bottom}
            y2={zone.top}
            fill="#eab308"
            fillOpacity={0.15}
            strokeOpacity={0}
            label={{ position: 'insideTopRight', value: zone.label, fill: '#eab308', fontSize: 10 }}
          />
        ))}
        
        {demandZones?.map((zone, idx) => (
          <ReferenceArea
            key={`demand-${idx}`}
            y1={zone.bottom}
            y2={zone.top}
            fill="#22c55e"
            fillOpacity={0.15}
            strokeOpacity={0}
            label={{ position: 'insideBottomRight', value: zone.label, fill: '#22c55e', fontSize: 10 }}
          />
        ))}

        {/* Moving Averages */}
        <Line type="monotone" dataKey="ma7" stroke="#38bdf8" dot={false} strokeWidth={1} isAnimationActive={false} />
        <Line type="monotone" dataKey="ma25" stroke="#f472b6" dot={false} strokeWidth={1} isAnimationActive={false} />
        <Line type="monotone" dataKey="ma99" stroke="#fb923c" dot={false} strokeWidth={2} isAnimationActive={false} />

        {/* Wick Bar (Thin) */}
        <Bar dataKey="wick" barSize={2} isAnimationActive={false}>
          {processedData.map((entry, index) => (
            <Cell key={`wick-${index}`} fill={entry.color} />
          ))}
        </Bar>

        {/* Body Bar (Thicker) */}
        <Bar dataKey="body" barSize={8} isAnimationActive={false}>
          {processedData.map((entry, index) => (
            <Cell key={`body-${index}`} fill={entry.color} />
          ))}
        </Bar>
        
      </ComposedChart>
    </ResponsiveContainer>
  );
};
