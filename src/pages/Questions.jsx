import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
const Questions = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }

    const fetchQuestions = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/forum/questions`);
        const data = await response.json();
        
        if (data.success && savedUser) {
          const userObj = JSON.parse(savedUser);
          // Filter questions for current user
          const myQuestions = data.questions.filter(q => q.user?._id === userObj._id || q.user === userObj._id);
          setQuestions(myQuestions);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching questions:', error);
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  return (
    <main className="flex-1 ml-[280px] py-12 px-16 max-h-screen overflow-y-auto">
      <header className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Public Forum</h1>
          <p className="text-slate-500 text-sm font-medium">Public health queries you've posted on the forum.</p>
        </div>
        <button 
          className="px-8 py-3.5 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-100 hover:bg-blue-700 hover:-translate-y-0.5 transition-all flex items-center gap-2" 
          onClick={() => navigate('/dashboard')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Ask Question
        </button>
      </header>

      <section className="questions-container">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-slate-400 font-bold text-sm animate-pulse">Loading your forum history...</p>
          </div>
        ) : questions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {questions.map((q) => (
              <div key={q._id} className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all flex flex-col group">
                <div className="flex justify-between items-center mb-6">
                  <div className="q-status-tag">
                    {q.answers?.length > 0 ? (
                      <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 border border-emerald-100">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                        Answered
                      </span>
                    ) : (
                      <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-amber-100">Pending</span>
                    )}
                  </div>
                  <div className="text-[11px] font-bold text-slate-400">{new Date(q.createdAt).toLocaleDateString()}</div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-3 leading-snug group-hover:text-blue-600 transition-colors">{q.title}</h3>
                <p className="text-sm text-slate-500 mb-8 line-clamp-3 leading-relaxed font-medium">{q.content}</p>

                {q.answers?.length > 0 && (
                  <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-50 mb-8 relative">
                    <div className="absolute top-0 right-8 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-blue-100 shadow-sm border border-blue-50">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] font-black uppercase">
                        {q.answers[0].doctor?.name.charAt(0)}
                      </div>
                      <span className="text-[11px] font-black text-blue-600 uppercase tracking-wider">Dr. {q.answers[0].doctor?.name}</span>
                    </div>
                    <p className="text-[13px] text-slate-600 italic line-clamp-2 leading-relaxed">"{q.answers[0].content}"</p>
                  </div>
                )}

                <div className="flex justify-between items-center mt-auto pt-5 border-t border-slate-50">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {q.isAnonymous ? 'Anonymous Post' : 'Public Post'}
                  </span>
                  <button className="text-xs font-black text-blue-600 hover:text-blue-700 uppercase tracking-wider">View Thread</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-[40px] border border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 text-slate-200">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight">No forum activity</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto mb-8 font-medium">You haven't posted any health queries on the public forum yet. Our specialists are here to help!</p>
            <button 
              className="px-8 py-3.5 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-100 hover:bg-blue-700 hover:-translate-y-0.5 transition-all flex items-center gap-2" 
              onClick={() => navigate('/dashboard')}
            >
              Post Your First Query
            </button>
          </div>
        )}
      </section>
    </main>
  );
};

export default Questions;
