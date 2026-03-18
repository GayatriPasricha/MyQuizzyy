import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { BrainCircuit, LogOut, User, Sun, Moon, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = React.useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="bg-white/80 dark:bg-dark-800/80 backdrop-blur-md border-b border-slate-200 dark:border-dark-700 px-4 sm:px-6 py-4 sticky top-0 z-50 transition-colors">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <BrainCircuit className="w-7 h-7 sm:w-8 sm:h-8 text-primary-600 group-hover:scale-110 transition-transform" />
          <h1 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-primary-600 to-green-400 bg-clip-text text-transparent">
            MyQuizzyy
          </h1>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 dark:bg-dark-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-dark-600 transition-all active:scale-95"
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>

          {user ? (
            <>
              <Link to="/dashboard" className="text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-500 font-medium transition-colors flex items-center gap-2">
                <User className="w-4 h-4" /> Dashboard
              </Link>
              <button 
                onClick={handleLogout}
                className="text-slate-600 dark:text-slate-300 hover:text-red-500 font-medium transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium transition-colors">Login</Link>
              <Link to="/register" className="bg-primary-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-primary-700 hover:shadow-lg transition-all active:scale-95">
                Get Started
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Controls */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 dark:bg-dark-700 text-slate-600 dark:text-slate-300"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-dark-700 text-slate-600 dark:text-slate-300"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-dark-800 overflow-hidden border-t border-slate-100 dark:border-dark-700 mt-4 shadow-xl"
          >
            <div className="flex flex-col p-4 space-y-4">
              {user ? (
                <>
                  <Link 
                    to="/dashboard" 
                    onClick={() => setIsMenuOpen(false)}
                    className="p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-dark-700 text-slate-700 dark:text-slate-300 font-bold flex items-center gap-3"
                  >
                    <User className="w-5 h-5" /> Dashboard
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 font-bold flex items-center gap-3 text-left w-full"
                  >
                    <LogOut className="w-5 h-5" /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    onClick={() => setIsMenuOpen(false)}
                    className="p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-dark-700 text-slate-700 dark:text-slate-300 font-bold"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    onClick={() => setIsMenuOpen(false)}
                    className="p-4 bg-primary-600 text-white rounded-xl font-bold text-center shadow-lg shadow-primary-500/30"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
