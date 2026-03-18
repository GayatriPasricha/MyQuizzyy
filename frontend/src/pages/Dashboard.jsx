import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FileText, Calendar, Plus, ExternalLink, Activity } from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/quiz/user/my-quizzes');
        setQuizzes(res.data);
      } catch (err) {
        console.error("Failed to fetch quizzes");
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchDashboard();
  }, [user]);

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );

  return (
    <div className="flex-1 bg-slate-50 dark:bg-dark-900 p-6 sm:p-10 transition-colors">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-white mb-2">My Dashboard</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Welcome back, {user?.name}</p>
          </div>
          <Link to="/" className="bg-primary-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-primary-700 transition-colors shadow-md shadow-primary-600/20 active:scale-95">
            <Plus className="w-5 h-5" /> Create New Quiz
          </Link>
        </div>

        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          My Generated Quizzes
        </h2>

        {quizzes.length === 0 ? (
          <div className="bg-white dark:bg-dark-800 p-12 rounded-3xl text-center border border-slate-100 dark:border-dark-700 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 dark:bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200 dark:border-dark-600">
               <FileText className="w-10 h-10 text-slate-300 dark:text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 dark:text-white mb-2">No quizzes yet</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium mb-6">You haven't generated any quizzes with AI yet.</p>
            <Link to="/" className="text-primary-600 dark:text-primary-400 font-bold hover:underline underline-offset-4">Generate your first one now!</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                key={quiz._id} 
                className="bg-white dark:bg-dark-800 rounded-2xl p-6 border border-slate-100 dark:border-dark-700 shadow-xl shadow-slate-200/30 dark:shadow-black/20 hover:border-primary-200 dark:hover:border-primary-900/50 hover:-translate-y-1 transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div className="bg-slate-50 dark:bg-dark-700 px-3 py-1 rounded-lg text-xs font-bold text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-dark-600">
                    {quiz.questions.length} Qs
                  </div>
                </div>
                <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-2 line-clamp-2">{quiz.title}</h3>
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-medium mb-6">
                  <Calendar className="w-4 h-4" />
                  {new Date(quiz.createdAt).toLocaleDateString()}
                </div>
                
                <div className="pt-4 border-t border-slate-100 dark:border-dark-700 flex gap-3">
                  <Link to={`/quiz/${quiz.shortId}`} className="flex-1 bg-slate-50 dark:bg-dark-700 hover:bg-slate-100 dark:hover:bg-dark-600 text-slate-700 dark:text-slate-300 font-bold py-2 rounded-lg text-center transition-colors border border-slate-200 dark:border-dark-600">
                    Take Quiz
                  </Link>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/quiz/${quiz.shortId}`);
                      alert("Link copied to clipboard!");
                    }}
                    className="p-2 border border-slate-200 dark:border-dark-600 rounded-lg text-slate-500 dark:text-slate-400 hover:text-primary-600 hover:border-primary-200 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
