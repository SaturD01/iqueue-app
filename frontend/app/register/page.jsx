'use client';

import { useState } from 'react';

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Full name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = 'Please enter a valid email address';
    if (!form.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^[0-9]{10}$/.test(form.phone))
      newErrors.phone = 'Phone number must be 10 digits';
    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 8)
      newErrors.password = 'Password must be at least 8 characters';
    if (!form.confirmPassword)
      newErrors.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';
    return newErrors;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    // API call will be wired here in Phase 2
    // For now simulate a successful registration
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1500);
  };

  if (success) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center px-4'>
        <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-md text-center'>
          <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <span className='text-3xl'>✓</span>
          </div>
          <h2 className='text-2xl font-bold text-blue-900 mb-2'>Account Created!</h2>
          <p className='text-gray-500 mb-6'>Your iQueue account has been created successfully.</p>
          <a href='/login' className='block w-full bg-blue-900 text-white py-3 rounded-xl font-semibold text-center hover:bg-blue-800 transition'>
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8'>
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
            <h2 className='text-xl font-bold text-gray-800 mb-6'>Create your account</h2>
            <form onSubmit={handleSubmit} className='space-y-4'>

              {/* Full Name */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Full Name</label>
                <input
                  type='text' name='name' value={form.name} onChange={handleChange}
                  placeholder='Nimali Fernando'
                  className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition ${errors.name ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-blue-400'}`}
                />
                {errors.name && <p className='text-red-500 text-xs mt-1'>{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Gmail Address</label>
                <input
                  type='email' name='email' value={form.email} onChange={handleChange}
                  placeholder='nimali@gmail.com'
                  className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-blue-400'}`}
                />
                {errors.email && <p className='text-red-500 text-xs mt-1'>{errors.email}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Phone Number</label>
                <input
                  type='text' name='phone' value={form.phone} onChange={handleChange}
                  placeholder='0771234567'
                  className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition ${errors.phone ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-blue-400'}`}
                />
                {errors.phone && <p className='text-red-500 text-xs mt-1'>{errors.phone}</p>}
              </div>

              {/* Password */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Password</label>
                <input
                  type='password' name='password' value={form.password} onChange={handleChange}
                  placeholder='Minimum 8 characters'
                  className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition ${errors.password ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-blue-400'}`}
                />
                {errors.password && <p className='text-red-500 text-xs mt-1'>{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Confirm Password</label>
                <input
                  type='password' name='confirmPassword' value={form.confirmPassword} onChange={handleChange}
                  placeholder='Re-enter your password'
                  className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition ${errors.confirmPassword ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-blue-400'}`}
                />
                {errors.confirmPassword && <p className='text-red-500 text-xs mt-1'>{errors.confirmPassword}</p>}
              </div>

              {/* Submit */}
              <button
                type='submit' disabled={loading}
                className='w-full bg-blue-900 text-white py-3 rounded-xl font-semibold hover:bg-blue-800 transition disabled:opacity-60 flex items-center justify-center gap-2 mt-2'
              >
                {loading && <span className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></span>}
                {loading ? 'Creating account...' : 'Create Account'}
              </button>

            </form>
            <p className='text-center text-sm text-gray-400 mt-6'>
              Already have an account?{' '}
              <a href='/login' className='text-blue-700 font-medium hover:underline'>Login</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
