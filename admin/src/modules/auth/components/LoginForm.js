import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', { email, password });
      
      const { user, accessToken } = response.data.data;
      
      if (user.role !== 'ADMIN') {
        setError('Access denied. Insufficient administrative privileges.');
        setIsLoading(false);
        return;
      }

      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      const message = err.response?.data?.error?.message || 'Invalid email or password. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Email Address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
          placeholder="admin@somlance.com"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
          placeholder="••••••••"
          required
        />
      </div>

      <div className="flex items-center justify-between text-sm py-1">
        <label className="flex items-center text-slate-400 cursor-pointer">
          <input type="checkbox" className="mr-2 rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-offset-slate-900" />
          Remember me
        </label>
        <button type="button" className="text-blue-500 hover:text-blue-400 transition-colors bg-transparent border-0 p-0 cursor-pointer">Forgot password?</button>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-semibold rounded-xl py-3.5 mt-2 shadow-lg shadow-emerald-500/20 transform transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
      >
        {isLoading ? (
          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : "Sign In to Admin"}
      </button>
    </form>
  );
};

export default LoginForm;
