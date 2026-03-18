import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, Loader2, Wand2, Sparkles, Pencil } from 'lucide-react';
import api from '../api/axios';

const Home = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState('pdf'); // 'pdf' or 'topic'
  const [topic, setTopic] = useState('');
  const [file, setFile] = useState(null);
  const [numQuestions, setNumQuestions] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    multiple: false
  });

  const handleGenerate = async () => {
    if (mode === 'pdf' && !file) return;
    if (mode === 'topic' && !topic.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    
    const formData = new FormData();
    if (mode === 'pdf') {
      formData.append('file', file);
      formData.append('title', file.name.replace('.pdf', ''));
    } else {
      formData.append('topic', topic);
      formData.append('title', topic.length > 30 ? topic.substring(0, 30) + '...' : topic);
    }
    formData.append('numQuestions', numQuestions.toString());
    formData.append('mode', mode);

    try {
      const res = await api.post('/quiz/generate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      navigate(`/quiz/${res.data.quiz.shortId}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || "Something went wrong. Please check your text/PDF.");
      setIsGenerating(false);
    }
  };

  const renderConfigUI = () => (
    <div className="w-full">
      {error && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }} 
          animate={{ opacity: 1, height: 'auto' }} 
          className="w-full p-4 mb-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-900/30 font-semibold text-sm sm:text-base"
        >
          {error}
        </motion.div>
      )}

      <div className="w-full mb-8 px-2">
        <div className="flex justify-between items-center mb-4">
          <label className="font-bold text-slate-700 dark:text-slate-300 text-base sm:text-lg">Number of Questions</label>
          <span className="font-bold text-primary-600 dark:text-primary-400 text-lg sm:text-xl bg-primary-100 dark:bg-primary-900/30 px-3 py-1 rounded-lg">{numQuestions}</span>
        </div>
        <input 
          type="range" 
          min="3" 
          max="30" 
          value={numQuestions}
          onChange={(e) => setNumQuestions(e.target.value)}
          disabled={isGenerating}
          className="w-full h-3 bg-slate-200 dark:bg-dark-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
        />
        <div className="flex justify-between text-[10px] sm:text-xs font-semibold text-slate-400 dark:text-slate-500 mt-2 px-1">
          <span>3 (Quick)</span>
          <span>30 (Detailed)</span>
        </div>
      </div>

      <button 
        onClick={handleGenerate}
        disabled={isGenerating || (mode === 'pdf' && !file) || (mode === 'topic' && !topic.trim())}
        className="w-full bg-primary-600 text-white font-bold text-lg sm:text-xl py-4 sm:py-5 rounded-xl hover:bg-primary-700 transition-all hover:shadow-xl hover:shadow-primary-500/30 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group active:scale-[0.98]"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin" /> 
            <span className="animate-pulse">Generating Magic...</span>
          </>
        ) : (
          <>
            <Wand2 className="w-6 h-6 group-hover:rotate-12 transition-transform" /> 
            Generate Quiz
          </>
        )}
      </button>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col items-center justify-start p-4 sm:p-6 relative overflow-hidden bg-gradient-to-b from-slate-50 to-primary-50/30 dark:from-dark-900 dark:to-dark-800 transition-colors min-h-screen">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary-200 dark:bg-primary-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 z-0"></div>
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-green-200 dark:bg-green-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-40 z-0"></div>

      <div className="w-full max-w-4xl z-10 text-center mt-8 mb-8 sm:mb-12">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-semibold text-xs sm:text-sm mb-6 border border-primary-200 dark:border-primary-800 shadow-sm">
            <Sparkles className="w-4 h-4" /> AI-Powered Generation
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-6 px-2">
            Turn Any {mode === 'pdf' ? 'PDF' : 'Topic'} Into an <br className="hidden md:block"/>
            <span className="bg-gradient-to-r from-primary-600 via-green-500 to-teal-400 bg-clip-text text-transparent">
              Interactive Quiz
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed px-4">
            {mode === 'pdf' 
              ? "Upload your lecture notes, ebooks, or summaries, and let our AI automatically generate a high-quality MCQ quiz with instant grading."
              : "Simply type a topic (e.g., 'Modern Architecture' or 'Photosynthesis') and our AI will craft a custom quiz for you in seconds."
            }
          </p>
        </motion.div>
      </div>

      {/* Mode Selector */}
      <div className="flex bg-slate-100 dark:bg-dark-700 p-1.5 rounded-2xl mb-10 z-10 shadow-inner">
        <button
          onClick={() => setMode('pdf')}
          className={`flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-bold transition-all text-sm sm:text-base ${mode === 'pdf' ? 'bg-white dark:bg-dark-600 text-primary-600 dark:text-primary-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          <FileText className="w-4 h-4 sm:w-5 sm:h-5" /> PDF Upload
        </button>
        <button
          onClick={() => setMode('topic')}
          className={`flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-bold transition-all text-sm sm:text-base ${mode === 'topic' ? 'bg-white dark:bg-dark-600 text-primary-600 dark:text-primary-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" /> Expert Topic
        </button>
      </div>

      <motion.div 
        initial={{ y: 30, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full max-w-3xl z-10"
      >
        <div className="bg-white/70 dark:bg-dark-800/70 backdrop-blur-xl border border-white dark:border-dark-700 p-6 sm:p-8 rounded-[2rem] shadow-2xl shadow-primary-900/5 dark:shadow-black/20">
          <AnimatePresence mode="wait">
            {mode === 'pdf' ? (
              !file ? (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  {...getRootProps()}
                  className={`border-3 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[300px] ${isDragActive ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 scale-[1.02]' : 'border-slate-300 dark:border-dark-600 hover:border-primary-400 hover:bg-slate-50 dark:hover:bg-dark-700/50'}`}
                >
                  <input {...getInputProps()} />
                  <div className="p-5 bg-white dark:bg-dark-700 shadow-sm border border-slate-100 dark:border-dark-600 rounded-2xl mb-6 shadow-primary-900/5">
                    <UploadCloud className={`w-14 h-14 transition-colors ${isDragActive ? 'text-primary-600' : 'text-slate-400 dark:text-slate-500'}`} />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white mb-2">
                    {isDragActive ? "Drop your PDF here!" : "Drag & Drop your PDF"}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 font-medium mb-6 text-sm sm:text-base">Maximum file size 10MB.</p>
                  <button className="bg-white dark:bg-dark-700 border-2 border-slate-200 dark:border-dark-600 text-slate-700 dark:text-slate-300 font-semibold px-6 py-3 rounded-xl hover:border-primary-500 hover:text-primary-600 transition-colors shadow-sm cursor-pointer pointer-events-none text-sm sm:text-base">
                    Browse Files
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="pdf-selected"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center p-4 sm:p-6 min-h-[300px] justify-center"
                >
                  <div className="w-full bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-900/30 rounded-2xl p-4 sm:p-6 flex items-center justify-between mb-8 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white dark:bg-dark-700 rounded-xl shadow-sm text-primary-600 dark:text-primary-400">
                        <FileText className="w-8 h-8" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-bold text-slate-800 dark:text-white text-base sm:text-lg line-clamp-1 break-all">{file.name}</h4>
                        <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB • PDF</p>
                      </div>
                    </div>
                    {!isGenerating && (
                       <button onClick={() => setFile(null)} className="text-sm text-slate-500 dark:text-slate-400 hover:text-red-500 font-semibold transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                          Remove
                       </button>
                    )}
                  </div>
                  {renderConfigUI()}
                </motion.div>
              )
            ) : (
              <motion.div
                key="topic"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col p-4 sm:p-6 min-h-[300px]"
              >
                <div className="w-full mb-8">
                  <div className="flex items-center gap-2 mb-4 text-primary-600 dark:text-primary-400">
                    <Pencil className="w-5 h-5" />
                    <h3 className="text-xl font-bold">What's the topic?</h3>
                  </div>
                  <textarea
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Enter a subject, topic, or paste some text here..."
                    className="w-full h-40 p-5 bg-white dark:bg-dark-700 border border-slate-200 dark:border-dark-600 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-slate-800 dark:text-white font-medium resize-none shadow-inner"
                    disabled={isGenerating}
                  />
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 font-medium">The more specific you are, the better the quiz!</p>
                </div>
                {renderConfigUI()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

    </div>
  );
};

export default Home;
