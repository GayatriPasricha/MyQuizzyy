import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, Loader2, Wand2, Sparkles } from 'lucide-react';
import api from '../api/axios';

const Home = () => {
  const navigate = useNavigate();
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
    if (!file) return;
    
    setIsGenerating(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('numQuestions', numQuestions.toString());
    formData.append('title', file.name.replace('.pdf', ''));

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

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden bg-gradient-to-b from-slate-50 to-primary-50/30">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 z-0"></div>
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 z-0"></div>

      <div className="w-full max-w-4xl z-10 text-center mb-12">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 text-primary-700 font-semibold text-sm mb-6 border border-primary-200 shadow-sm">
            <Sparkles className="w-4 h-4" /> AI-Powered Generation
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
            Turn Any PDF Into an <br className="hidden md:block"/>
            <span className="bg-gradient-to-r from-primary-600 via-green-500 to-teal-400 bg-clip-text text-transparent">
              Interactive Quiz
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
            Upload your lecture notes, ebooks, or summaries, and let our AI automatically generate a high-quality MCQ quiz with instant grading. 
          </p>
        </motion.div>
      </div>

      <motion.div 
        initial={{ y: 30, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full max-w-3xl z-10"
      >
        <div className="bg-white/70 backdrop-blur-xl border border-white p-8 rounded-[2rem] shadow-2xl shadow-primary-900/5">
          <AnimatePresence mode="wait">
            {!file ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                {...getRootProps()}
                className={`border-3 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[300px] ${isDragActive ? 'border-primary-500 bg-primary-50 scale-[1.02]' : 'border-slate-300 hover:border-primary-400 hover:bg-slate-50'}`}
              >
                <input {...getInputProps()} />
                <div className="p-5 bg-white shadow-sm border border-slate-100 rounded-2xl mb-6 shadow-primary-900/5">
                  <UploadCloud className={`w-14 h-14 transition-colors ${isDragActive ? 'text-primary-600' : 'text-slate-400'}`} />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">
                  {isDragActive ? "Drop your PDF here!" : "Drag & Drop your PDF"}
                </h3>
                <p className="text-slate-500 font-medium mb-6">Maximum file size 10MB.</p>
                <button className="bg-white border-2 border-slate-200 text-slate-700 font-semibold px-6 py-3 rounded-xl hover:border-primary-500 hover:text-primary-600 transition-colors shadow-sm cursor-pointer pointer-events-none">
                  Browse Files
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="config"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center p-6 min-h-[300px] justify-center"
              >
                <div className="w-full bg-primary-50 border border-primary-100 rounded-2xl p-6 flex items-center justify-between mb-8 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm text-primary-600">
                      <FileText className="w-8 h-8" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold text-slate-800 text-lg line-clamp-1 break-all">{file.name}</h4>
                      <p className="text-sm font-medium text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB • PDF</p>
                    </div>
                  </div>
                  {!isGenerating && (
                     <button onClick={() => setFile(null)} className="text-sm text-slate-500 hover:text-red-500 font-semibold transition-colors px-4 py-2 rounded-lg hover:bg-red-50">
                        Remove
                     </button>
                  )}
                </div>

                {error && <div className="w-full p-4 mb-6 bg-red-50 text-red-600 rounded-xl border border-red-100 font-semibold">{error}</div>}

                <div className="w-full mb-8 px-2">
                  <div className="flex justify-between items-center mb-4">
                    <label className="font-bold text-slate-700 text-lg">Number of Questions</label>
                    <span className="font-bold text-primary-600 text-xl bg-primary-100 px-3 py-1 rounded-lg">{numQuestions}</span>
                  </div>
                  <input 
                    type="range" 
                    min="3" 
                    max="200" 
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(e.target.value)}
                    disabled={isGenerating}
                    className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                  />
                  <div className="flex justify-between text-xs font-semibold text-slate-400 mt-2 px-1">
                    <span>3 (Quick)</span>
                    <span>200 (Detailed)</span>
                  </div>
                </div>

                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full bg-primary-600 text-white font-bold text-xl py-5 rounded-xl hover:bg-primary-700 transition-all hover:shadow-xl hover:shadow-primary-500/30 flex items-center justify-center gap-3 disabled:opacity-80 disabled:cursor-not-allowed group active:scale-[0.98]"
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

    </div>
  );
};

export default Home;
