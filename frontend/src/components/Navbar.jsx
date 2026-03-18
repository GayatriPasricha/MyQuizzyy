import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { BrainCircuit, LogOut, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 group">
          <BrainCircuit className="w-8 h-8 text-primary-600 group-hover:scale-110 transition-transform" />
          <h1 className="text-2xl font-black bg-gradient-to-r from-primary-600 to-green-400 bg-clip-text text-transparent">
            MyQuizzyy
          </h1>
        </Link>
        
        <nav className="flex items-center space-x-6">
          {user ? (
            <>
              <Link to="/dashboard" className="text-slate-600 hover:text-primary-600 font-medium transition-colors flex items-center gap-2">
                <User className="w-4 h-4" /> Dashboard
              </Link>
              <button 
                onClick={handleLogout}
                className="text-slate-600 hover:text-red-500 font-medium transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">Login</Link>
              <Link to="/register" className="bg-primary-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-primary-700 hover:shadow-lg transition-all active:scale-95">
                Get Started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
