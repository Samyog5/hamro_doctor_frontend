import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Articles = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [newArticle, setNewArticle] = useState({ title: '', content: '', category: 'Health Tips', tags: '', featureImage: '' });
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [imagePreview, setImagePreview] = useState(null);

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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setNewArticle({ ...newArticle, featureImage: reader.result });
      };
      reader.readAsDataURL(file);
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
        setNewArticle({ title: '', content: '', category: 'Health Tips', tags: '', featureImage: '' });
        setImagePreview(null);
        alert('Article published successfully!');
        fetchArticles();
      }
    } catch (error) {
      console.error('Error creating article:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 lg:ml-[280px] p-4 lg:p-8 bg-slate-50 min-h-screen font-['Poppins']">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Health Articles</h1>
            <p className="text-slate-500 font-medium mt-1">Professional medical insights and health tips from experts.</p>
          </div>
          {user.role === 'doctor' && (
            <button 
              onClick={() => setShowWriteModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.length === 0 ? (
              <div className="col-span-full bg-white rounded-[40px] p-16 text-center border border-dashed border-slate-200 shadow-sm">
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">No articles available</h3>
                <p className="text-slate-500 font-medium">Stay tuned for professional medical content.</p>
              </div>
            ) : articles.map((article) => (
              <div 
                key={article._id} 
                onClick={() => navigate(`/articles/${article._id}`)}
                className="bg-white rounded-[40px] overflow-hidden shadow-sm border border-slate-100 hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-1.5 transition-all group cursor-pointer"
              >
                <div className="aspect-[16/9] bg-slate-100 relative overflow-hidden">
                  {article.featureImage ? (
                    <img src={article.featureImage} alt={article.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                      </svg>
                    </div>
                  )}
                  <div className="absolute top-6 left-6">
                    <span className="bg-white/95 backdrop-blur-md text-blue-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                      {article.category || 'Health'}
                    </span>
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-xs font-black overflow-hidden">
                      {article.author?.profile?.avatar ? (
                        <img src={article.author.profile.avatar} alt="Author" className="w-full h-full object-cover" />
                      ) : (
                        article.author?.name?.[0]
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">Dr. {article.author?.name}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(article.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-3 group-hover:text-blue-600 transition-colors leading-tight">{article.title}</h3>
                  <p className="text-slate-500 text-sm line-clamp-3 mb-8 leading-relaxed font-medium">
                    {article.content.replace(/<[^>]*>/g, '')}
                  </p>
                  <div className="flex justify-between items-center pt-6 border-t border-slate-50">
                    <div className="flex gap-3">
                      {article.tags?.slice(0, 2).map((tag, idx) => (
                        <span key={idx} className="text-[10px] bg-slate-50 text-slate-400 px-2 py-1 rounded-lg font-bold uppercase tracking-wider">#{tag}</span>
                      ))}
                    </div>
                    <button 
                      onClick={() => navigate(`/articles/${article._id}`)}
                      className="bg-slate-50 text-blue-600 px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-blue-600 hover:text-white transition-all"
                    >
                      Read
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
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
          <div className="bg-white w-full max-w-2xl rounded-[40px] p-8 shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto scrollbar-hide">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Create Article</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Share your expertise</p>
              </div>
              <button onClick={() => setShowWriteModal(false)} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:text-red-500 transition-all">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateArticle} className="space-y-6">
              {/* Image Upload Area */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Feature Image</label>
                <div 
                  className={`relative aspect-[16/9] rounded-[32px] border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden cursor-pointer ${imagePreview ? 'border-transparent' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}
                  onClick={() => document.getElementById('article-image').click()}
                >
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                        <span className="bg-white text-slate-900 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest">Change Photo</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-6">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm text-slate-300">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                      </div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Upload 16:9 Thumbnail</p>
                    </div>
                  )}
                </div>
                <input id="article-image" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Article Title</label>
                <input 
                  type="text" 
                  placeholder="Enter a compelling title..."
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  value={newArticle.title}
                  onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                  <select 
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all appearance-none cursor-pointer"
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
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Tags</label>
                  <input 
                    type="text" 
                    placeholder="diet, heart, fitness"
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    value={newArticle.tags}
                    onChange={(e) => setNewArticle({ ...newArticle, tags: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Content</label>
                <textarea 
                  placeholder="Share your medical expertise..."
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 outline-none transition-all min-h-[200px] leading-relaxed resize-none"
                  value={newArticle.content}
                  onChange={(e) => setNewArticle({ ...newArticle, content: e.target.value })}
                  required
                />
              </div>

              <button 
                type="submit" 
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-100 hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Processing Article...' : 'Publish to Feed'}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default Articles;
