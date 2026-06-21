import React, { useState, useEffect } from 'react';

const AdminArticles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
  const apiVersion = import.meta.env.VITE_API_VERSION || 'v1';

  const fetchArticles = async (searchVal = searchQuery) => {
    setLoading(true);
    try {
      let url = `${apiUrl}/api/${apiVersion}/admin/articles`;
      if (searchVal.trim()) {
        url += `?search=${encodeURIComponent(searchVal.trim())}`;
      }
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        setArticles(data.articles);
      }
    } catch (err) {
      console.error('Failed to fetch articles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleDeleteArticle = async (id) => {
    if (!window.confirm('Are you sure you want to delete this article? This will permanently delete the article and all associated comments.')) {
      return;
    }

    setActionLoading(id);
    try {
      const response = await fetch(`${apiUrl}/api/${apiVersion}/admin/articles/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        fetchArticles();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to delete article.');
      }
    } catch (err) {
      console.error('Failed to delete article:', err);
      alert('An error occurred while deleting the article.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Manage Articles</h1>
          <p className="text-slate-500 font-medium">Search, moderate, and delete published articles from the portal.</p>
        </div>
      </div>

      {/* Main Content / Table */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        {/* Table Header / Filters */}
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <h2 className="text-xl font-bold text-slate-800">Published Articles</h2>
          <div className="flex items-center gap-2 w-full md:w-96">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search by title or doctor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    fetchArticles(searchQuery);
                  }
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all"
              />
              <div className="absolute left-3 top-3 text-slate-400">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </div>
            </div>
            <button
              onClick={() => fetchArticles(searchQuery)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-100 transition-all active:scale-95 flex-shrink-0"
            >
              Search
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-[2px]">Article Info</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-[2px]">Author (Doctor)</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-[2px]">Stats & Date</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-[2px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-20 text-center">
                    <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-slate-400 font-bold text-sm uppercase tracking-widest">Compiling Database...</p>
                  </td>
                </tr>
              ) : articles.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-20 text-center text-slate-400 font-medium">No articles found.</td>
                </tr>
              ) : (
                articles.map(article => (
                  <tr key={article._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5 max-w-md">
                      <div className="flex items-center gap-4">
                        {article.featureImage ? (
                          <img
                            src={article.featureImage}
                            alt={article.title}
                            className="w-14 h-10 object-cover rounded-xl shadow-sm border border-slate-100 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center flex-shrink-0 border border-slate-100">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                          </div>
                        )}
                        <div className="overflow-hidden">
                          <div className="font-bold text-slate-900 leading-snug truncate max-w-[280px]" title={article.title}>{article.title}</div>
                          <div className="inline-flex mt-1 px-2.5 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                            {article.category || 'General'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center font-bold text-sm">
                          {article.author?.name ? article.author.name.charAt(0) : 'D'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-700 text-sm leading-tight">{article.author?.name || 'Unknown Doctor'}</div>
                          <div className="text-xs text-slate-400 font-medium mt-0.5">{article.author?.doctorDetails?.speciality || 'Medical Specialist'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-xs space-y-1">
                        <div className="flex items-center gap-3 text-slate-600 font-medium">
                          <span className="flex items-center gap-1">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            {article.views} views
                          </span>
                          <span className="flex items-center gap-1 text-rose-500">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                            {article.likes?.length || 0}
                          </span>
                        </div>
                        <div className="text-slate-400 font-medium">
                          {new Date(article.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <button
                        onClick={() => handleDeleteArticle(article._id)}
                        disabled={actionLoading === article._id}
                        className="px-3.5 py-2 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-500 hover:text-white transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        {actionLoading === article._id ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminArticles;
