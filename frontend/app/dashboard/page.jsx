'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '@/lib/api';

export default function ManagerDashboardPage() {
  const router = useRouter();
  const [summary, setSummary] = useState(null);
  const [hourlyData, setHourlyData] = useState([]);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [loadingData, setLoadingData] = useState(true);
  const [loadingAi, setLoadingAi] = useState(false);
  const [fetchError, setFetchError] = useState('');

  // Auth guard — manager/admin only
  useEffect(() => {
    const token = localStorage.getItem('iqueue_token');
    if (!token) { router.push('/login'); return; }
    const user = JSON.parse(localStorage.getItem('iqueue_user') || '{}');
    if (user.role !== 'manager' && user.role !== 'admin') {
      router.push('/login');
    }
  }, []);

  // Fetch analytics on page load
  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoadingData(true);
      setFetchError('');
      try {
        const [summaryRes, hourlyRes] = await Promise.all([
          api.get('/api/analytics/summary'),
          api.get('/api/analytics/hourly'),
        ]);
        setSummary(summaryRes.data);
        setHourlyData(hourlyRes.data);
      } catch (err) {
        setFetchError('Could not load analytics. Please refresh.');
      } finally {
        setLoadingData(false);
      }
    };
    fetchAnalytics();
  }, []);

  const handleAiAnalysis = async () => {
    setLoadingAi(true);
    setAiAnalysis('');
    try {
      const res = await api.get('/api/analytics/summary');
      const stats = res.data;
      const aiRes = await api.post('/api/admin/ai-recommendation', {
        servedCount: stats.servedCount || 0,
        avgWaitMinutes: stats.avgWaitMinutes || 0,
        noShowCount: stats.noShowCount || 0,
      });
      setAiAnalysis(aiRes.data.recommendation);
    } catch (err) {
      setAiAnalysis('AI analysis unavailable right now. Please try again later.');
    } finally {
      setLoadingAi(false);
    }
  };

  if (loadingData) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <div className='w-10 h-10 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-gray-400 text-sm'>Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>

      {/* Header */}
      <div className='bg-blue-900 text-white px-6 py-4'>
        <h1 className='text-xl font-bold'>iQueue</h1>
        <p className='text-blue-300 text-sm'>Branch Analytics Dashboard</p>
      </div>

      {fetchError && (
        <div className='bg-red-50 border-b border-red-200 text-red-600 text-sm px-6 py-3'>
          {fetchError}
        </div>
      )}

      <div className='p-6 max-w-5xl mx-auto'>

        {/* Stat cards */}
        <div className='grid grid-cols-3 gap-4 mb-6'>
          <div className='bg-white rounded-2xl border border-gray-200 p-5'>
            <p className='text-xs text-gray-400 uppercase tracking-wide mb-1'>Customers Served Today</p>
            <p className='text-4xl font-bold text-blue-900'>{summary?.servedCount ?? '--'}</p>
          </div>
          <div className='bg-white rounded-2xl border border-gray-200 p-5'>
            <p className='text-xs text-gray-400 uppercase tracking-wide mb-1'>No-Shows Today</p>
            <p className='text-4xl font-bold text-red-600'>{summary?.noShowCount ?? '--'}</p>
          </div>
          <div className='bg-white rounded-2xl border border-gray-200 p-5'>
            <p className='text-xs text-gray-400 uppercase tracking-wide mb-1'>Avg Wait Time</p>
            <p className='text-4xl font-bold text-green-700'>
              {summary?.avgWaitMinutes ?? '--'}
              <span className='text-lg font-normal text-gray-400 ml-1'>min</span>
            </p>
          </div>
        </div>

        {/* Bar chart */}
        <div className='bg-white rounded-2xl border border-gray-200 p-6 mb-6'>
          <h3 className='text-sm font-semibold text-gray-700 mb-4'>Customers Per Hour — Today</h3>
          {hourlyData.length === 0 ? (
            <div className='flex items-center justify-center h-48 text-gray-400 text-sm'>
              No hourly data available yet for today.
            </div>
          ) : (
            <ResponsiveContainer width='100%' height={220}>
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
                <XAxis dataKey='hour' tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey='servedCount' fill='#002244' radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* AI Analysis */}
        <div className='bg-white rounded-2xl border border-gray-200 p-6'>
          <h3 className='text-sm font-semibold text-gray-700 mb-4'>AI Staffing Analysis</h3>
          <button
            onClick={handleAiAnalysis}
            disabled={loadingAi}
            className='w-full bg-blue-900 text-white py-3 rounded-xl font-semibold hover:bg-blue-800 transition disabled:opacity-60 flex items-center justify-center gap-2'
          >
            {loadingAi && (
              <span className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></span>
            )}
            {loadingAi ? 'Analysing...' : 'Run AI Analysis'}
          </button>
          <div className={`mt-4 rounded-xl p-4 text-sm ${aiAnalysis ? 'bg-blue-50 border border-blue-200 text-blue-900' : 'bg-gray-50 border border-gray-200 text-gray-400'}`}>
            {aiAnalysis || 'AI analysis will appear here after you click Run AI Analysis.'}
          </div>
        </div>

      </div>
    </div>
  );
}