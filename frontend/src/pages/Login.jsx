import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, error, user } = useAuth();
  const navigate = useNavigate();

  // If already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const success = await login(email, password);
    setIsLoading(false);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-genesis-bg font-body p-4">
      <div className="bg-genesis-surface p-6 md:p-10 rounded-[16px] shadow-genesis border border-genesis-border w-full max-w-[400px]">
        <div className="text-center mb-8">
          <h1 className="text-[28px] font-display font-bold text-genesis-textMain tracking-tight">KVS Spices</h1>
          <p className="text-[14px] text-genesis-textSub mt-1">Owner Dashboard Login</p>
        </div>
        
        {error && (
          <div className="mb-6 bg-genesis-error/10 border border-genesis-error/20 text-genesis-error px-4 py-3 rounded-lg text-[13px] font-medium" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-[13px] font-medium text-genesis-textSub mb-1.5">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-genesis-border rounded-md text-[14px] focus:outline-none focus:ring-[3px] focus:ring-genesis-primary/12 focus:border-genesis-primary transition-all text-genesis-textMain" 
              required 
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-genesis-textSub mb-1.5">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-genesis-border rounded-md text-[14px] focus:outline-none focus:ring-[3px] focus:ring-genesis-primary/12 focus:border-genesis-primary transition-all text-genesis-textMain" 
              required 
            />
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full flex justify-center items-center h-[44px] rounded-md text-[14px] font-medium text-white bg-genesis-primary hover:bg-genesis-primaryHover focus:outline-none focus:ring-[3px] focus:ring-genesis-primary/20 disabled:opacity-50 transition-all hover:-translate-y-px shadow-btn mt-2"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
