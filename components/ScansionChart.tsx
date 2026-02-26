
import React from 'react';

interface ScansionChartProps {
  scansion: string;
}

const ScansionChart: React.FC<ScansionChartProps> = ({ scansion }) => {
  // scansion example: "||0|0 ||0|0|0"
  const parts = scansion.split(' ');

  return (
    <div className="space-y-4">
      <div className="flex flex-row-reverse flex-wrap gap-6 items-start justify-center bg-slate-50 p-6 rounded-3xl border border-slate-200/60 shadow-inner">
        {parts.map((part, idx) => (
          <div key={idx} className="flex flex-col items-center gap-3">
            <div className="flex flex-row-reverse gap-2">
              {part.split('').map((char, charIdx) => (
                <div
                  key={charIdx}
                  className={`group relative w-10 h-16 flex items-center justify-center border-b-[6px] ${
                    char === '|' 
                      ? 'border-emerald-500 bg-emerald-100/50 text-emerald-800' 
                      : 'border-amber-500 bg-amber-100/50 text-amber-800'
                  } rounded-t-xl transition-all hover:-translate-y-1.5 hover:shadow-lg cursor-default shadow-sm`}
                >
                  <span className="text-4xl font-black select-none poetry-font leading-none mb-1">
                    {char === '|' ? 'ࡄ' : '٠'}
                  </span>
                  {/* Tooltip on hover */}
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl z-10">
                    {char === '|' ? 'حركة' : 'سكون'}
                  </div>
                </div>
              ))}
            </div>
            <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest bg-white px-2 py-0.5 rounded-full border border-slate-100">
              تفعيلة {parts.length - idx}
            </div>
          </div>
        ))}
      </div>
      
      {/* Legend */}
      <div className="flex justify-center gap-8 text-xs font-black text-slate-400 uppercase tracking-widest">
        <div className="flex items-center gap-2 group cursor-default">
          <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200" />
          <span className="group-hover:text-emerald-600 transition-colors">حركة (ࡄ)</span>
        </div>
        <div className="flex items-center gap-2 group cursor-default">
          <div className="w-3 h-3 rounded-full bg-amber-500 shadow-sm shadow-amber-200" />
          <span className="group-hover:text-amber-600 transition-colors">سكون (٠)</span>
        </div>
      </div>
    </div>
  );
};

export default ScansionChart;
