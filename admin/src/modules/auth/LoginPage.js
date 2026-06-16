import React from 'react';
import LoginForm from './components/LoginForm';

const LoginPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] relative overflow-hidden">
      {/* Abstract Background Shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-md px-6 animate-fade-in relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
            Kul<span className="text-blue-500">mis</span>
          </h1>
          <p className="text-slate-400">Administrative Dashboard</p>
        </div>

        <div className="glass-morphism rounded-2xl p-8 shadow-2xl">
          <h2 className="text-2xl font-semibold text-white mb-6">Welcome Back</h2>
          <LoginForm />
        </div>

        <p className="text-center mt-8 text-slate-500 text-sm">
          &copy; 2024 Somlance Platform. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
