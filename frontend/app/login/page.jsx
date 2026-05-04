'use client';

import { useState } from 'react';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Please enter your email and password');
      return;
    }
    setLoading(true);
    // API call will be wired here in Phase 2
    // For now simulate login
    setTimeout(() => {
      setLoading(false);
      // Simulate wrong credentials for demo
      if (form.password === 'wrong') {
        setError('Invalid email or password');
      } else {
        console.log('Login successful:', form.email);
        // Will redirect based on role in Phase 2
      }
    }, 1500);
  };

  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center px-4'>
      <div className='w-full max-w-md'>

        {/* Header */}
        <div className='text-center mb-8'>
          <div className='inline-block bg-blue-900 text-white px-6 py-2 rounded-xl mb-3'>
            <h1 className='text-2xl font-bold'>iQueue</h1>
          </div>
          <p className='text-gray-400 text-sm'>Skip the queue. Bank smarter.</p>
        </div>

        {/* Card */}
        <div className='bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden'>
          <div className='h-1.5 bg-blue-900'></div>
          <div className='p-8'>
            <h2 className='text-xl font-bold text-gray-800 mb-6'>Welcome back</h2>

            {error && (
              <div className='bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4'>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className='space-y-4'>

              {/* Email */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Email Address</label>
                <input
                  type='email' name='email' value={form.email} onChange={handleChange}
                  placeholder='nimali@gmail.com'
                  className='w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-400 transition'
                />
              </div>

              {/* Password */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Password</label>
                <input
                  type='password' name='password' value={form.password} onChange={handleChange}
                  placeholder='Enter your password'
                  className='w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-400 transition'
                />
              </div>

              {/* Submit */}
              <button
                type='submit' disabled={loading}
                className='w-full bg-blue-900 text-white py-3 rounded-xl font-semibold hover:bg-blue-800 transition disabled:opacity-60 flex items-center justify-center gap-2 mt-2'
              >
                {loading && <span className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></span>}
                {loading ? 'Signing in...' : 'Sign In'}
              </button>

            </form>
            <p className='text-center text-sm text-gray-400 mt-6'>
              New here?{' '}
              <a href='/register' className='text-blue-700 font-medium hover:underline'>Create an account</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
