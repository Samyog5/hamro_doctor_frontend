import React, { useState, useEffect } from 'react';

const AdminStories = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
  const apiVersion = import.meta.env.VITE_API_VERSION || 'v1';

  const fetchStories = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/${apiVersion}/admin/stories`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        setStories(data.stories || []);
      }
    } catch (err) {
      console.error('Failed to fetch admin stories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const handleDeleteStory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this story? This will permanently remove it from the platform.')) {
      return;
    }

    setActionLoading(id);
    try {
      const response = await fetch(`${apiUrl}/api/${apiVersion}/admin/stories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        setStories(prev => prev.filter(story => story._id !== id));
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to delete story.');
      }
    } catch (err) {
      console.error('Failed to delete story:', err);
      alert('An error occurred while deleting the story.');
    } finally {
      setActionLoading(null);
    }
  };

  // Helper to determine if story is active (within 24h)
  const isStoryActive = (createdAt) => {
    const diff = Date.now() - new Date(createdAt).getTime();
    return diff < 24 * 60 * 60 * 1000;
  };

  // Filtered stories by search term (searches title, category, or doctor name)
  const filteredStories = stories.filter(story => {
    const query = searchQuery.toLowerCase();
    const titleMatch = story.title?.toLowerCase().includes(query);
    const categoryMatch = story.category?.toLowerCase().includes(query);
    const authorMatch = story.author?.name?.toLowerCase().includes(query);
    return titleMatch || categoryMatch || authorMatch;
  });

  return (
    <main className="flex-1 lg:ml-[280px] py-12 px-4 lg:px-16 max-h-screen overflow-y-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Manage Stories</h1>
          <p className="text-slate-500 font-medium">Moderate health stories uploaded by doctors. View upload timeline, active status, and perform deletions.</p>
        </div>
      </div>

      {/* Main Content / Table */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        {/* Table Header / Filters */}
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <h2 className="text-xl font-bold text-slate-800">All Uploaded Stories</h2>
          <div className="flex items-center gap-2 w-full md:w-96">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search by title, category, or doctor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all"
              />
              <div className="absolute left-3 top-3 text-slate-400">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-[2px]">Story Info</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-[2px]">Author (Doctor)</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-[2px]">Status & Timeline</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-[2px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-20 text-center">
                    <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-slate-400 font-bold text-sm uppercase tracking-widest">Retrieving Stories...</p>
                  </td>
                </tr>
              ) : filteredStories.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-20 text-center text-slate-400 font-medium">No stories found.</td>
                </tr>
              ) : (
                filteredStories.map(story => {
                  const active = isStoryActive(story.createdAt);
                  return (
                    <tr key={story._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-5 max-w-md">
                        <div className="flex items-center gap-4">
                          {story.image ? (
                            <img
                              src={story.image}
                              alt={story.title}
                              className="w-10 h-14 object-cover rounded-xl shadow-sm border border-slate-100 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-14 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center flex-shrink-0 border border-slate-100">
                              <span className="material-symbols-outlined text-lg">auto_stories</span>
                            </div>
                          )}
                          <div className="overflow-hidden">
                            <div className="font-bold text-slate-900 leading-snug truncate max-w-[280px]" title={story.title}>{story.title}</div>
                            <div className="inline-flex mt-1.5 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[9px] font-bold uppercase tracking-wider">
                              {story.category || 'General'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center font-bold text-sm overflow-hidden">
                            {story.author?.profile?.avatar ? (
                              <img src={story.author.profile.avatar.startsWith('http') || story.author.profile.avatar.startsWith('data:') ? story.author.profile.avatar : `${apiUrl}${story.author.profile.avatar}`} alt="" className="w-full h-full object-cover" />
                            ) : (
                              story.author?.name ? story.author.name.charAt(0) : 'D'
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-700 text-sm leading-tight">{story.author?.name || 'Unknown Doctor'}</div>
                            <div className="text-xs text-slate-400 font-medium mt-0.5">{story.author?.doctorDetails?.speciality || 'Medical Specialist'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-xs space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
                            <span className={`font-bold uppercase tracking-wider text-[10px] ${active ? 'text-emerald-600' : 'text-slate-400'}`}>
                              {active ? 'Active (Live)' : 'Archived'}
                            </span>
                          </div>
                          <div className="text-slate-400 font-medium">
                            Uploaded {new Date(story.createdAt).toLocaleDateString()} at {new Date(story.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <button
                          onClick={() => handleDeleteStory(story._id)}
                          disabled={actionLoading === story._id}
                          className="px-3.5 py-2 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-500 hover:text-white transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                          {actionLoading === story._id ? 'Deleting...' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
};

export default AdminStories;
