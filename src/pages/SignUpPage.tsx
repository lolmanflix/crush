import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../context/ProductContext';

const SignUpPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (!name || !email || !password || !phone || !address) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }
    // Supabase sign up with extra fields
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, phone, address } }
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    alert('Account created! Please check your email to confirm.');
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
          <span className="text-3xl sm:text-4xl font-extrabold tracking-widest text-black dark:text-white mb-2">CRUSH</span>
          <span className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-300">Create Your Account</span>
        </div>
        {error && <div className="mb-4 text-red-500 text-center">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-200">Name</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>
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
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-200">Phone Number</label>
            <input
              type="tel"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
              autoComplete="tel"
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold text-gray-700 dark:text-gray-200">Address</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={address}
              onChange={e => setAddress(e.target.value)}
              required
              autoComplete="street-address"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>
        <div className="mt-6 text-center text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline font-semibold">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage; 