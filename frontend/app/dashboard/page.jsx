'use client';

import { useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SUMMARY = { totalServed: 47, totalNoShows: 3, avgServiceTimeMinutes: 6.2 };

const HOURLY_DATA = [
  { hour: '8am', served: 5 }, { hour: '9am', served: 12 },
  { hour: '10am', served: 18 }, { hour: '11am', served: 22 },
  { hour: '12pm', served: 9 }, { hour: '1pm', served: 14 },
  { hour: '2pm', served: 19 }, { hour: '3pm', served: 11 },
  { hour: '4pm', served: 7 }, { hour: '5pm', served: 3 },
];

const TREND_DATA = [
  { date: 'Mon', served: 82 }, { date: 'Tue', served: 91 },
  { date: 'Wed', served: 78 }, { date: 'Thu', served: 95 },
  { date: 'Fri', served: 88 }, { date: 'Sat', served: 62 },
  { date: 'Sun', served: 47 },
];

export default function ManagerDashboardPage() {
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const handleAiAnalysis = () => {
    setAiLoading(true);
    // Real API call will be wired in Phase 2
    setTimeout(() => {
      setAiLoading(false);
      setAiAnalysis(
        'Peak hours: 10am-12pm and 2pm-3pm. Recommended tellers: 4 during peak hours (10am-12pm and 2pm-3pm), ' +
        '2 during normal hours (9am, 12pm-2pm, 3pm-5pm), 1 during off-peak (8am, 5pm). ' +
        'No-show rate is 6.4% which is within acceptable range. ' +
        'Consider sending reminder notifications to customers 3 positions before their turn.'
      );
    }, 2000);
  };

  return (
    <div className='min-h-screen bg-gray-50'>

      {/* Header */}
      <div className='bg-blue-900 text-white px-6 py-4'>
        <h1 className='text-xl font-bold'>iQueue</h1>
        <p className='text-blue-300 text-sm'>Branch Analytics Dashboard</p>
      </div>

      <div className='p-6 max-w-5xl mx-auto'>

        {/* Stat cards */}
        <div className='grid grid-cols-3 gap-4 mb-6'>
          <div className='bg-white rounded-2xl border border-gray-200 p-5'>
            <p className='text-xs text-gray-400 uppercase tracking-wide mb-1'>Customers Served Today</p>
            <p className='text-4xl font-bold text-blue-900'>{SUMMARY.totalServed}</p>
          </div>
          <div className='bg-white rounded-2xl border border-gray-200 p-5'>
            <p className='text-xs text-gray-400 uppercase tracking-wide mb-1'>No-Shows Today</p>
            <p className='text-4xl font-bold text-red-600'>{SUMMARY.totalNoShows}</p>
          </div>
          <div className='bg-white rounded-2xl border border-gray-200 p-5'>
            <p className='text-xs text-gray-400 uppercase tracking-wide mb-1'>Avg Service Time</p>
            <p className='text-4xl font-bold text-green-700'>{SUMMARY.avgServiceTimeMinutes}<span className='text-lg font-normal text-gray-400 ml-1'>min</span></p>
          </div>
        </div>

        {/* Bar chart */}
        <div className='bg-white rounded-2xl border border-gray-200 p-6 mb-6'>
          <h3 className='text-sm font-semibold text-gray-700 mb-4'>Customers Per Hour — Today</h3>
          <ResponsiveContainer width='100%' height={220}>
            <BarChart data={HOURLY_DATA}>
              <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
              <XAxis dataKey='hour' tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey='served' fill='#002244' radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Line chart */}
        <div className='bg-white rounded-2xl border border-gray-200 p-6 mb-6'>
          <h3 className='text-sm font-semibold text-gray-700 mb-4'>7-Day Served Count Trend</h3>
          <ResponsiveContainer width='100%' height={200}>
            <LineChart data={TREND_DATA}>
              <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
              <XAxis dataKey='date' tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type='monotone' dataKey='served' stroke='#002244' strokeWidth={2} dot={{ fill: '#002244', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* AI Analysis */}
        <div className='bg-white rounded-2xl border border-gray-200 p-6'>
          <h3 className='text-sm font-semibold text-gray-700 mb-4'>AI Staffing Analysis</h3>
          <button
            onClick={handleAiAnalysis}
            disabled={aiLoading}
            className='w-full bg-blue-900 text-white py-3 rounded-xl font-semibold hover:bg-blue-800 transition disabled:opacity-60 flex items-center justify-center gap-2'
          >
            {aiLoading && <span className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></span>}
            {aiLoading ? 'Analysing...' : 'Run AI Analysis'}
          </button>
          <div className={`mt-4 rounded-xl p-4 text-sm ${aiAnalysis ? 'bg-blue-50 border border-blue-200 text-blue-900' : 'bg-gray-50 border border-gray-200 text-gray-400'}`}>
            {aiAnalysis || 'AI analysis will appear here after you click Run AI Analysis.'}
          </div>
        </div>

      </div>
    </div>
  );
}
