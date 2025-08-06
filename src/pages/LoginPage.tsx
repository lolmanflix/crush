import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../context/ProductContext';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (!email || !password) {
      setError('Please enter both email and password.');
      setLoading(false);
      return;
    }
    // Always authenticate with Supabase
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    // Check if user is admin or super admin
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (
      (email === 'badr75161@gmail.com' && password === '200610') ||
      (email === 'kareemdiyaaa2007@gmail.com' && password === 'lolmanflix@1972') ||
      (user && ((user as any).is_super_admin || user.user_metadata?.is_admin))
    ) {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    setLoading(false);
    if (error) setError(error.message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-white dark:from-black dark:to-gray-900 px-2 sm:px-0">
      <button
        className="absolute top-6 left-6 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        onClick={() => navigate(-1)}
      >
        &larr; Back
      </button>
      <div className="bg-white/90 dark:bg-gray-900/90 shadow-2xl rounded-2xl px-4 sm:px-10 py-8 sm:py-12 w-full max-w-md border border-gray-200 dark:border-gray-800 relative">
        <div className="flex flex-col items-center mb-8">
          <span className="text-3xl sm:text-4xl font-extrabold tracking-widest text-black dark:text-white mb-2">crush</span>
          <span className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-300">Welcome Back</span>
        </div>
        {error && <div className="mb-4 text-red-500 text-center">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-200">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-200">Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
          <span className="mx-3 text-gray-400">or</span>
          <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
        </div>
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 dark:bg-gray-800 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-semibold py-2 rounded-lg shadow hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          disabled={loading}
        >
          <svg className="w-5 h-5" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.85-6.85C35.64 2.68 30.18 0 24 0 14.82 0 6.71 5.82 2.69 14.09l7.98 6.2C12.13 14.13 17.62 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.43-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.65 7.04l7.19 5.6C43.98 37.13 46.1 31.3 46.1 24.55z"/><path fill="#FBBC05" d="M10.67 28.29c-1.13-3.36-1.13-6.97 0-10.33l-7.98-6.2C.9 15.1 0 19.41 0 24c0 4.59.9 8.9 2.69 12.24l7.98-6.2z"/><path fill="#EA4335" d="M24 48c6.18 0 11.64-2.05 15.53-5.57l-7.19-5.6c-2.01 1.35-4.59 2.15-8.34 2.15-6.38 0-11.87-4.63-13.33-10.74l-7.98 6.2C6.71 42.18 14.82 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></g></svg>
          Login with Google
        </button>
        <div className="mt-6 text-center text-gray-600 dark:text-gray-400">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-600 hover:underline font-semibold">Sign Up</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 