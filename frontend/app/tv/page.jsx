'use client';

import { useState, useEffect } from 'react';

const NOW_SERVING = {
  1: { tokenNumber: 'CA-003', counter: 'Counter 1', sublabel: 'Cash Services' },
  2: { tokenNumber: 'AC-002', counter: 'Counter 2', sublabel: 'Account Services' },
  3: { tokenNumber: 'LI-001', counter: 'Counter 3', sublabel: 'Loans & Inquiry' },
};

const UP_NEXT = {
  1: ['CA-004', 'CA-005', 'CA-006'],
  2: ['AC-003', 'AC-004', 'AC-005'],
  3: ['LI-002', 'LI-003', 'LI-004'],
};

const COUNTER_COLORS = {
  1: { border: 'border-blue-400',   bg: 'bg-blue-900',   badge: 'bg-blue-700',   text: 'text-blue-300' },
  2: { border: 'border-teal-400',   bg: 'bg-teal-900',   badge: 'bg-teal-700',   text: 'text-teal-300' },
  3: { border: 'border-indigo-400', bg: 'bg-indigo-900', badge: 'bg-indigo-700', text: 'text-indigo-300' },
};

export default function TVDisplayPage() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', hour12: true
      }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col overflow-hidden">

      {/* Top bar */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <span className="text-white font-bold text-2xl">iQueue</span>
          <span className="text-gray-500 text-sm">Smart Bank Queue System</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          <span className="text-gray-400 text-sm font-mono">{time}</span>
        </div>
      </div>

      {/* NOW SERVING — 3 counters */}
      <div className="flex-1 grid grid-cols-3 gap-6 px-8 py-6">
        {[1, 2, 3].map(counterId => {
          const serving = NOW_SERVING[counterId];
          const next = UP_NEXT[counterId];
          const colors = COUNTER_COLORS[counterId];

          return (
            <div
              key={counterId}
              className={`${colors.bg} rounded-2xl border-2 ${colors.border} flex flex-col overflow-hidden`}
            >
              {/* Counter header */}
              <div className={`${colors.badge} px-4 py-3 text-center`}>
                <p className="text-white font-bold text-sm">{serving.counter}</p>
                <p className={`${colors.text} text-xs`}>{serving.sublabel}</p>
              </div>

              {/* Now serving */}
              <div className="flex-1 flex flex-col items-center justify-center px-4 py-6">
                <p className={`${colors.text} text-xs uppercase tracking-widest mb-3`}>
                  Now Serving
                </p>
                <p
                  className="font-black text-white leading-none"
                  style={{ fontSize: 'clamp(40px, 6vw, 80px)' }}
                >
                  {serving.tokenNumber}
                </p>
              </div>

              {/* Divider */}
              <div className={`border-t ${colors.border} mx-4 opacity-40`}></div>

              {/* Up next */}
              <div className="px-4 py-4">
                <p className={`${colors.text} text-xs uppercase tracking-widest mb-3 text-center`}>
                  Up Next
                </p>
                <div className="space-y-2">
                  {next.map((tokenNumber, index) => (
                    <div
                      key={tokenNumber}
                      className={`flex items-center justify-center px-3 py-2 rounded-lg ${
                        index === 0 ? colors.badge : 'bg-black/20'
                      }`}
                    >
                      <span className={`font-bold text-white ${index === 0 ? 'text-base' : 'text-sm'}`}>
                        {tokenNumber}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-8 py-3 text-center border-t border-gray-800">
        <p className="text-gray-600 text-xs">
          Please proceed to your counter when your token is called — iQueue Smart Bank Queue Management
        </p>
      </div>

    </div>
  );
}