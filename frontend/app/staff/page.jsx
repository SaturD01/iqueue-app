'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

const STATUS_BADGE = {
  CALLABLE: 'bg-green-100 text-green-800',
  HELD: 'bg-yellow-100 text-yellow-800',
  PRIORITY: 'bg-purple-100 text-purple-800',
  CALLED: 'bg-blue-100 text-blue-800 animate-pulse',
  SERVED: 'bg-gray-100 text-gray-600',
  NO_SHOW: 'bg-red-100 text-red-800',
};

const PRIORITY_REASONS = ['Elderly', 'Disability', 'VIP', 'Pregnant', 'Other'];

const COUNTERS = [
  { id: 1, name: 'Counter 1', label: 'Cash', color: 'blue', services: ['Cash Deposit'] },
  { id: 2, name: 'Counter 2', label: 'Account & Inquiry', color: 'teal', services: ['Account Opening', 'General Inquiry', 'Document Submission'] },
  { id: 3, name: 'Counter 3', label: 'Loans & Cards', color: 'indigo', services: ['Loan Inquiry', 'Card Services'] },
];

const COUNTER_STYLES = {
  blue:   { tab: 'border-blue-600 text-blue-700 bg-blue-50',   inactive: 'border-gray-200 text-gray-500 hover:border-blue-300',   badge: 'bg-blue-100 text-blue-700' },
  teal:   { tab: 'border-teal-600 text-teal-700 bg-teal-50',   inactive: 'border-gray-200 text-gray-500 hover:border-teal-300',   badge: 'bg-teal-100 text-teal-700' },
  indigo: { tab: 'border-indigo-600 text-indigo-700 bg-indigo-50', inactive: 'border-gray-200 text-gray-500 hover:border-indigo-300', badge: 'bg-indigo-100 text-indigo-700' },
};

function getCounterForService(serviceName) {
  return COUNTERS.find(c => c.services.includes(serviceName)) || COUNTERS[0];
}

export default function StaffPanelPage() {
  const router = useRouter();
  const [queue, setQueue] = useState([]);
  const [calledToken, setCalledToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [actionError, setActionError] = useState('');
  const [branchId, setBranchId] = useState('');
  const [branchName, setBranchName] = useState('');
  const [activeCounter, setActiveCounter] = useState(1);

  const [showWalkIn, setShowWalkIn] = useState(false);
  const [walkInForm, setWalkInForm] = useState({
    walkInName: '', serviceName: '', walkInEmail: '',
    isPriority: false, priorityReason: '',
  });
  const [walkInLoading, setWalkInLoading] = useState(false);
  const [walkInError, setWalkInError] = useState('');
  const [printSlip, setPrintSlip] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('iqueue_token');
    if (!token) { router.push('/login'); return; }
    const user = JSON.parse(localStorage.getItem('iqueue_user') || '{}');
    if (user.role !== 'staff') { router.push('/login'); return; }
    if (user.branchId) {
      setBranchId(user.branchId);
      setBranchName(user.branchName || 'Colombo Fort Branch');
    }
  }, []);

  const fetchQueue = useCallback(async () => {
    if (!branchId) return;
    try {
      setFetchError('');
      const response = await api.get(`/api/tokens/queue?branchId=${branchId}`);
      const tokens = response.data.tokens || [];
      setQueue(tokens);
      setCalledToken(prev => {
        if (!prev) return null;
        const stillActive = tokens.find(t => t._id === prev._id && t.status === 'CALLED');
        return stillActive || null;
      });
    } catch (err) {
      setFetchError('Could not load queue. Please refresh.');
    }
  }, [branchId]);

  useEffect(() => {
    if (!branchId) return;
    fetchQueue();
    const interval = setInterval(fetchQueue, 10000);
    return () => clearInterval(interval);
  }, [fetchQueue, branchId]);

  const handleCallNext = async () => {
    setLoading(true); setActionError('');
    try {
      const response = await api.post('/api/tokens/call-next', { branchId });
      setCalledToken(response.data.token);
      await fetchQueue();
    } catch (err) {
      setActionError(err.response?.data?.message || 'No tokens to call.');
    } finally { setLoading(false); }
  };

  const handleServed = async (tokenId) => {
    setLoading(true); setActionError('');
    try {
      await api.patch(`/api/tokens/${tokenId}/served`);
      setCalledToken(null);
      await fetchQueue();
    } catch (err) {
      setActionError('Could not mark as served.');
    } finally { setLoading(false); }
  };

  const handleNoShow = async (tokenId) => {
    setLoading(true); setActionError('');
    try {
      await api.patch(`/api/tokens/${tokenId}/no-show`);
      setCalledToken(null);
      await fetchQueue();
    } catch (err) {
      setActionError('Could not mark as no-show.');
    } finally { setLoading(false); }
  };

  const handleWalkInSubmit = async () => {
    if (!walkInForm.walkInName || !walkInForm.serviceName) {
      setWalkInError('Customer name and service are required.');
      return;
    }
    setWalkInLoading(true); setWalkInError('');
    try {
      const body = {
        branchId,
        walkInName: walkInForm.walkInName,
        serviceName: walkInForm.serviceName,
        isPriority: walkInForm.isPriority,
        priorityReason: walkInForm.isPriority ? walkInForm.priorityReason : undefined,
      };
      if (walkInForm.walkInEmail) body.walkInEmail = walkInForm.walkInEmail;
      const response = await api.post('/api/tokens/walkin', body);
      setPrintSlip(response.data.token);
      setShowWalkIn(false);
      setWalkInForm({ walkInName: '', serviceName: '', walkInEmail: '', isPriority: false, priorityReason: '' });
      await fetchQueue();
    } catch (err) {
      setWalkInError(err.response?.data?.message || 'Walk-in booking failed.');
    } finally { setWalkInLoading(false); }
  };

  const handlePrint = () => window.print();

  const activeCounter_obj = COUNTERS.find(c => c.id === activeCounter);
  const counterTokens = queue.filter(t =>
    !['SERVED', 'NO_SHOW'].includes(t.status) &&
    activeCounter_obj.services.includes(t.serviceName)
  );

  return (
    <div className='min-h-screen bg-gray-50'>

      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #print-slip, #print-slip * { visibility: visible !important; }
          #print-slip {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            padding: 40px !important;
          }
        }
      `}</style>

      {printSlip && (
        <div id='print-slip' style={{ display: 'none' }}>
          <div style={{ fontFamily: 'Arial, sans-serif', textAlign: 'center', padding: '40px 32px', border: '3px solid #1e3a5f', borderRadius: '16px', maxWidth: '340px', width: '100%' }}>
            <span style={{ fontSize: '32px', fontWeight: '900', color: '#1e3a5f' }}>iQueue</span>
            <p style={{ color: '#888', fontSize: '11px', margin: '4px 0 6px', letterSpacing: '1px', textTransform: 'uppercase' }}>Smart Bank Queue Management</p>
            <p style={{ color: '#aaa', fontSize: '11px', margin: '0 0 24px' }}>{branchName}</p>
            <div style={{ borderTop: '1px dashed #ddd', margin: '0 0 24px' }}></div>
            <p style={{ color: '#555', fontSize: '12px', margin: '0 0 4px', letterSpacing: '2px', textTransform: 'uppercase' }}>Your Token Number</p>
            <p style={{ color: '#1e3a5f', fontSize: '88px', fontWeight: '900', margin: '0 0 4px', fontFamily: 'monospace', lineHeight: 1 }}>{printSlip.tokenNumber}</p>
            {printSlip.priorityReason && (
              <div style={{ display: 'inline-block', background: '#f3e8ff', color: '#6b21a8', fontSize: '12px', fontWeight: '700', padding: '4px 14px', borderRadius: '99px', margin: '8px 0 0' }}>
                ★ PRIORITY — {printSlip.priorityReason.toUpperCase()}
              </div>
            )}
            <p style={{ color: '#444', fontSize: '14px', margin: '16px 0 0', fontWeight: '600' }}>{printSlip.serviceName}</p>
            {printSlip.walkInName && <p style={{ color: '#888', fontSize: '12px', margin: '4px 0 0' }}>{printSlip.walkInName}</p>}
            <p style={{ color: '#666', fontSize: '12px', margin: '8px 0 0' }}>
              {getCounterForService(printSlip.serviceName).name} — {getCounterForService(printSlip.serviceName).label}
            </p>
            <div style={{ borderTop: '1px dashed #ddd', margin: '20px 0' }}></div>
            <p style={{ color: '#333', fontSize: '12px', margin: '0 0 6px', lineHeight: '1.6' }}>
              Please watch the display screen.<br />Proceed to the counter when your number is called.
            </p>
            <p style={{ color: '#e74c3c', fontSize: '12px', fontWeight: '600', margin: '0 0 16px' }}>You have 5 minutes to reach the counter when called.</p>
            <p style={{ color: '#bbb', fontSize: '10px', margin: '0' }}>
              {new Date().toLocaleString('en-LK', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className='bg-brand-navy text-white px-6 py-4 flex items-center justify-between'>
        <div>
          <h1 className='text-xl font-bold'>iQueue</h1>
          <p className='text-blue-300 text-sm'>Staff Queue Panel</p>
        </div>
        <div className='flex items-center gap-3'>
          <button onClick={() => { setShowWalkIn(true); setPrintSlip(null); }}
            className='bg-orange-500 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-orange-600 transition'>
            + Walk-in
          </button>
          <button onClick={handleCallNext} disabled={loading}
            className='bg-white text-brand-navy px-5 py-2 rounded-xl font-bold text-sm hover:bg-blue-50 transition disabled:opacity-60'>
            {loading ? 'Loading...' : 'Call Next'}
          </button>
        </div>
      </div>

      {/* Called notification */}
      {calledToken && (
        <div className='bg-brand-teal text-white text-center py-3 font-semibold'>
          Now calling: {calledToken.tokenNumber} — {calledToken.serviceName}
          <span className='ml-2 text-green-100 text-sm'>({getCounterForService(calledToken.serviceName).name})</span>
          <div className='flex justify-center gap-3 mt-2'>
            <button onClick={() => handleServed(calledToken._id)} disabled={loading}
              className='bg-white text-green-700 px-4 py-1 rounded-lg text-sm font-semibold hover:bg-green-50 transition disabled:opacity-60'>
              Served
            </button>
            <button onClick={() => handleNoShow(calledToken._id)} disabled={loading}
              className='bg-green-700 text-white px-4 py-1 rounded-lg text-sm font-semibold hover:bg-green-800 transition disabled:opacity-60'>
              No Show
            </button>
          </div>
        </div>
      )}

      {/* Print slip banner */}
      {printSlip && (
        <div className='bg-orange-50 border-b border-orange-200 px-6 py-3 flex items-center justify-between'>
          <div>
            <p className='text-orange-800 font-semibold text-sm'>Walk-in token booked: {printSlip.tokenNumber}</p>
            <p className='text-orange-600 text-xs'>
              {printSlip.walkInEmail ? 'Confirmation email sent to customer.' : 'Print the slip and hand it to the customer.'}
            </p>
          </div>
          <div className='flex gap-2'>
            <button onClick={handlePrint}
              className='bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-orange-600 transition'>
              Print Slip
            </button>
            <button onClick={() => setPrintSlip(null)}
              className='bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-300 transition'>
              Dismiss
            </button>
          </div>
        </div>
      )}

      {fetchError && <div className='bg-red-50 border-b border-red-200 text-red-600 text-sm px-6 py-3'>{fetchError}</div>}
      {actionError && <div className='bg-orange-50 border-b border-orange-200 text-orange-600 text-sm px-6 py-3'>{actionError}</div>}

      <div className='p-6'>

        {/* Counter tabs */}
        <div className='grid grid-cols-3 gap-4 mb-6'>
          {COUNTERS.map(counter => {
            const count = queue.filter(t =>
              !['SERVED', 'NO_SHOW'].includes(t.status) &&
              counter.services.includes(t.serviceName)
            ).length;
            const styles = COUNTER_STYLES[counter.color];
            return (
              <button key={counter.id} onClick={() => setActiveCounter(counter.id)}
                className={`rounded-xl border-2 p-4 text-center transition ${activeCounter === counter.id ? styles.tab : styles.inactive + ' bg-white'}`}>
                <p className='text-2xl font-bold'>{count}</p>
                <p className='text-xs font-semibold mt-1'>{counter.name}</p>
                <p className='text-xs opacity-70'>{counter.label}</p>
              </button>
            );
          })}
        </div>

        {/* Active counter label */}
        <div className='flex items-center gap-2 mb-4'>
          <span className={`text-xs px-3 py-1 rounded-full font-semibold ${COUNTER_STYLES[activeCounter_obj.color].badge}`}>
            {activeCounter_obj.name} — {activeCounter_obj.label}
          </span>
          <span className='text-xs text-gray-400'>{activeCounter_obj.services.join(' · ')}</span>
        </div>

        {/* Token table */}
        {counterTokens.length === 0 ? (
          <div className='bg-white rounded-xl border border-gray-200 p-12 text-center'>
            <p className='text-gray-400 text-lg'>No tokens for this counter</p>
            <p className='text-gray-300 text-sm mt-1'>{activeCounter_obj.services.join(' and ')} — all clear</p>
          </div>
        ) : (
          <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
            <table className='w-full'>
              <thead>
                <tr className='bg-gray-50 border-b border-gray-200'>
                  <th className='text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase'>Token</th>
                  <th className='text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase'>Service</th>
                  <th className='text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase'>Status</th>
                  <th className='text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase'>Actions</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100'>
                {counterTokens.map(token => (
                  <tr key={token._id} className='hover:bg-gray-50 transition'>
                    <td className='px-4 py-4'>
                      <span className='font-bold text-brand-navy'>{token.tokenNumber}</span>
                      {token.isWalkIn && <span className='ml-2 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full'>Walk-in</span>}
                    </td>
                    <td className='px-4 py-4'><span className='text-sm text-gray-500'>{token.serviceName}</span></td>
                    <td className='px-4 py-4'>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_BADGE[token.status] || ''}`}>{token.status}</span>
                    </td>
                    <td className='px-4 py-4'>
                      <div className='flex gap-2'>
                        <button onClick={() => handleServed(token._id)} disabled={loading}
                          className='bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-green-700 transition disabled:opacity-60'>
                          Served
                        </button>
                        <button onClick={() => handleNoShow(token._id)} disabled={loading}
                          className='bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-600 transition disabled:opacity-60'>
                          No-Show
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Walk-in Modal */}
      {showWalkIn && (
        <div className='fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center px-4 z-50'>
          <div className='bg-white rounded-2xl shadow-xl w-full max-w-md p-6'>
            <h2 className='text-lg font-bold text-gray-800 mb-1'>Walk-in Customer</h2>
            <p className='text-sm text-gray-400 mb-6'>Book a token for a customer who walked in</p>
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Customer Name *</label>
                <input type='text' value={walkInForm.walkInName}
                  onChange={e => setWalkInForm({...walkInForm, walkInName: e.target.value})}
                  placeholder='e.g. Somawathie Perera'
                  className='w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-400 transition' />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Service Type *</label>
                <select value={walkInForm.serviceName}
                  onChange={e => setWalkInForm({...walkInForm, serviceName: e.target.value})}
                  className='w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-400 transition'>
                  <option value=''>Choose a service...</option>
                  {COUNTERS.map(counter => (
                    <optgroup key={counter.id} label={`${counter.name} — ${counter.label}`}>
                      {counter.services.map(s => <option key={s} value={s}>{s}</option>)}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Customer Email <span className='text-gray-400 font-normal'>(optional)</span>
                </label>
                <input type='email' value={walkInForm.walkInEmail}
                  onChange={e => setWalkInForm({...walkInForm, walkInEmail: e.target.value})}
                  placeholder='customer@gmail.com'
                  className='w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-400 transition' />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Priority Token</label>
                <div className='flex gap-2 mb-3'>
                  <button type='button'
                    onClick={() => setWalkInForm({...walkInForm, isPriority: false, priorityReason: ''})}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition ${!walkInForm.isPriority ? 'bg-brand-navy text-white border-brand-navy' : 'bg-white text-gray-600 border-gray-200'}`}>
                    Normal
                  </button>
                  <button type='button'
                    onClick={() => setWalkInForm({...walkInForm, isPriority: true})}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition ${walkInForm.isPriority ? 'bg-purple-700 text-white border-purple-700' : 'bg-white text-gray-600 border-gray-200'}`}>
                    Priority
                  </button>
                </div>
                {walkInForm.isPriority && (
                  <select value={walkInForm.priorityReason}
                    onChange={e => setWalkInForm({...walkInForm, priorityReason: e.target.value})}
                    className='w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-purple-400 transition'>
                    <option value=''>Select reason...</option>
                    {PRIORITY_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                )}
              </div>
            </div>
            {walkInError && <p className='text-red-500 text-sm mt-4'>{walkInError}</p>}
            <div className='flex gap-3 mt-6'>
              <button onClick={() => { setShowWalkIn(false); setWalkInError(''); }}
                className='flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition'>
                Cancel
              </button>
              <button onClick={handleWalkInSubmit} disabled={walkInLoading}
                className='flex-1 py-3 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition disabled:opacity-60 flex items-center justify-center gap-2'>
                {walkInLoading && <span className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></span>}
                {walkInLoading ? 'Booking...' : 'Book Token'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
