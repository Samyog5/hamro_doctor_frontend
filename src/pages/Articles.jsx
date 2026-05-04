import React, { useState, useEffect } from 'react';

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [newArticle, setNewArticle] = useState({ title: '', content: '', category: 'Health Tips', tags: '' });
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const apiVersion = import.meta.env.VITE_API_VERSION || 'v1';
      const response = await fetch(`${apiUrl}/api/${apiVersion}/articles`);
      const data = await response.json();
      if (data.success) {
        setArticles(data.articles);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateArticle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const apiVersion = import.meta.env.VITE_API_VERSION || 'v1';
      const tagsArray = newArticle.tags.split(',').map(t => t.trim());
      
      const response = await fetch(`${apiUrl}/api/${apiVersion}/articles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ ...newArticle, tags: tagsArray })
      });
      
      if (response.ok) {
        setShowWriteModal(false);
        setNewArticle({ title: '', content: '', category: 'Health Tips', tags: '' });
        alert('Article submitted for moderation!');
        fetchArticles();
      }
    } catch (error) {
      console.error('Error creating article:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 lg:ml-[280px] p-4 lg:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Health Articles</h1>
            <p className="text-slate-500 font-medium mt-1">Professional medical insights and health tips from experts.</p>
          </div>
          {user.role === 'doctor' && (
            <button 
              onClick={() => setShowWriteModal(true)}
              className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center gap-2"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              Write Article
            </button>
          )}
        </div>

        {loading && articles.length === 0 ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {articles.length === 0 ? (
              <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200">
                <div className="text-slate-400 mb-4 flex justify-center">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900">No articles available</h3>
                <p className="text-slate-500 text-sm">Stay tuned for professional medical content.</p>
              </div>
            ) : articles.map((article) => (
              <div key={article._id} className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all group">
                <div className="aspect-[16/9] bg-slate-100 relative">
                  {article.featureImage ? (
                    <img src={article.featureImage} alt={article.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                      </svg>
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur-md text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                      {article.category || 'Health'}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-[10px] font-bold">
                      {article.author?.name?.[0]}
                    </div>
                    <span className="text-xs font-bold text-slate-500">Dr. {article.author?.name}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-[10px] font-medium text-slate-400">{new Date(article.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors leading-tight">{article.title}</h3>
                  <p className="text-slate-500 text-sm line-clamp-3 mb-6 leading-relaxed">
                    {article.content.replace(/<[^>]*>/g, '')}
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      {article.tags?.slice(0, 2).map((tag, idx) => (
                        <span key={idx} className="text-[10px] text-slate-400 font-medium">#{tag}</span>
                      ))}
                    </div>
                    <button className="text-blue-600 text-sm font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                      Read More
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Write Article Modal */}
      {showWriteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-slate-900">Write New Article</h2>
              <button onClick={() => setShowWriteModal(false)} className="text-slate-400 hover:text-slate-600">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateArticle} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Article Title</label>
                <input 
                  type="text" 
                  placeholder="Enter a compelling title..."
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm focus:bg-white focus:border-blue-500 outline-none transition-all font-bold"
                  value={newArticle.title}
                  onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Category</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm focus:bg-white focus:border-blue-500 outline-none transition-all font-bold appearance-none"
                    value={newArticle.category}
                    onChange={(e) => setNewArticle({ ...newArticle, category: e.target.value })}
                  >
                    <option>Health Tips</option>
                    <option>Medical News</option>
                    <option>Wellness</option>
                    <option>Nutrition</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Tags (comma separated)</label>
                  <input 
                    type="text" 
                    placeholder="diet, fitness, heart"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm focus:bg-white focus:border-blue-500 outline-none transition-all font-bold"
                    value={newArticle.tags}
                    onChange={(e) => setNewArticle({ ...newArticle, tags: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Content</label>
                <textarea 
                  placeholder="Share your medical expertise..."
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm focus:bg-white focus:border-blue-500 outline-none transition-all min-h-[250px] leading-relaxed"
                  value={newArticle.content}
                  onChange={(e) => setNewArticle({ ...newArticle, content: e.target.value })}
                  required
                />
              </div>

              <button 
                type="submit" 
                className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Publish Article'}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default Articles;
