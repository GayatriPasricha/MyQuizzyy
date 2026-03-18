import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { BrainCircuit, Mail, Lock } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-primary-50 dark:from-dark-900 dark:to-dark-800 relative overflow-hidden transition-colors">
      {/* Decorative Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-200 dark:bg-primary-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-green-200 dark:bg-green-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/70 dark:bg-dark-800/70 backdrop-blur-xl p-8 rounded-3xl shadow-xl shadow-primary-900/5 dark:shadow-black/20 border border-white dark:border-dark-700"
      >
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-2xl">
            <BrainCircuit className="w-10 h-10 text-primary-600 dark:text-primary-400" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-2">Welcome Back</h2>
        <p className="text-center text-slate-500 dark:text-slate-400 mb-8 font-medium">Log in to track your quizzes and attempts.</p>
        
        {error && <div className="p-3 mb-6 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/30 text-center font-medium animate-pulse">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 group-focus-within:text-primary-500 transition-colors" />
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white/50 dark:bg-dark-700/50 border border-slate-200 dark:border-dark-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium text-slate-700 dark:text-white outline-none"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Password</label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 group-focus-within:text-primary-500 transition-colors" />
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white/50 dark:bg-dark-700/50 border border-slate-200 dark:border-dark-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium text-slate-700 dark:text-white outline-none"
                placeholder="••••••••"
                required
              />
            </div>
          </div>
          <button 
            type="submit" 
            className="w-full bg-primary-600 text-white py-3.5 rounded-xl font-bold text-lg hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-500/30 transition-all active:scale-95"
          >
            Sign In
          </button>
        </form>
        <p className="mt-8 text-center text-slate-600 dark:text-slate-400 font-medium">
          Don't have an account? <Link to="/register" className="text-primary-600 dark:text-primary-400 font-bold hover:underline decoration-2 underline-offset-4">Register here</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
