import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import QuizTake from './pages/QuizTake';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-slate-50 dark:bg-dark-900 flex flex-col font-sans transition-colors duration-300 selection:bg-primary-100 selection:text-primary-900">
            <Navbar />
            <main className="flex-1 flex flex-col w-full">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/quiz/:shortId" element={<QuizTake />} />
              </Routes>
            </main>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
