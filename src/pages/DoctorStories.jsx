import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DoctorStories = () => {
  const navigate = useNavigate();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'archived'

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Health Tips');
  const [image, setImage] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [tags, setTags] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
  const apiVersion = import.meta.env.VITE_API_VERSION || 'v1';

  const fetchStories = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/${apiVersion}/stories/my-stories`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        setStories(data.stories || []);
      }
    } catch (err) {
      console.error('Failed to fetch doctor stories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  // Handle Image Selection and Convert to Base64
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setFormError('Image size should be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        setImagePreview(reader.result);
        setFormError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage('');
    setImagePreview('');
  };

  // Submit New Story
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!title.trim()) {
      setFormError('Title is required.');
      return;
    }

    setUploading(true);
    try {
      const response = await fetch(`${apiUrl}/api/${apiVersion}/stories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          title,
          content,
          category,
          image,
          tags: tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : []
        })
      });

      const data = await response.json();
      if (data.success) {
        setFormSuccess('Story published successfully! It will be visible for 24 hours.');
        setTitle('');
        setContent('');
        setCategory('Health Tips');
        setImage('');
        setImagePreview('');
        setTags('');
        fetchStories();
      } else {
        setFormError(data.message || 'Failed to create story.');
      }
    } catch (err) {
      console.error('Story creation error:', err);
      setFormError('An error occurred. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Delete Story
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this story?')) {
      return;
    }

    setActionLoading(id);
    try {
      const response = await fetch(`${apiUrl}/api/${apiVersion}/stories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setStories(prev => prev.filter(story => story._id !== id));
      } else {
        alert(data.message || 'Failed to delete story.');
      }
    } catch (err) {
      console.error('Failed to delete story:', err);
      alert('An error occurred while deleting.');
    } finally {
      setActionLoading(null);
    }
  };

  // Helper to determine if story is active (within 24h)
  const isStoryActive = (createdAt) => {
    const diff = Date.now() - new Date(createdAt).getTime();
    return diff < 24 * 60 * 60 * 1000;
  };

  // Helper to get remaining time
  const getRemainingTime = (createdAt) => {
    const diff = 24 * 60 * 60 * 1000 - (Date.now() - new Date(createdAt).getTime());
    if (diff <= 0) return 'Expired';
    const hours = Math.floor(diff / (60 * 60 * 1000));
    const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
    return `${hours}h ${minutes}m left`;
  };

  const activeStories = stories.filter(story => isStoryActive(story.createdAt));
  const archivedStories = stories.filter(story => !isStoryActive(story.createdAt));

  return (
    <main className="flex-1 lg:ml-[280px] py-12 px-4 lg:px-16 max-h-screen overflow-y-auto space-y-10 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Health Stories</h1>
        <p className="text-slate-500 font-medium">Publish 24-hour visual health updates, tips, or announcements to patient dashboards.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Post a Story Form */}
        <div className="lg:col-span-5 bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600">add_circle</span>
            Publish New Story
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {formError && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl text-xs font-semibold">
                {formError}
              </div>
            )}
            {formSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl text-xs font-semibold">
                {formSuccess}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Story Title</label>
              <input
                type="text"
                placeholder="e.g., Stay Hydrated This Summer!"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-slate-700 focus:bg-white focus:border-blue-500 outline-none transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-slate-700 focus:bg-white focus:border-blue-500 outline-none transition-all"
                >
                  <option value="Health Tips">Health Tips</option>
                  <option value="Medical News">Medical News</option>
                  <option value="Success Story">Success Story</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tags (Optional)</label>
                <input
                  type="text"
                  placeholder="hydration, health"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-slate-700 focus:bg-white focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Short Content Removed */}

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Story Image (Optional)</label>
              
              {!imagePreview ? (
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:bg-slate-50/50 hover:border-blue-400 transition-all cursor-pointer relative group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <span className="material-symbols-outlined text-3xl text-slate-300 group-hover:text-blue-500 transition-colors">image</span>
                  <p className="text-xs font-bold text-slate-400 mt-1">Upload Portrait Image</p>
                  <p className="text-[10px] text-slate-300 font-medium mt-0.5">Supports JPG, PNG (Recommended 9:16 aspect ratio)</p>
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden aspect-[9/16] max-h-60 mx-auto border border-slate-100 shadow-inner group">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={removeImage}
                      className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-transform active:scale-95 shadow-md flex items-center justify-center"
                      title="Remove Image"
                    >
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-100 hover:shadow-blue-200 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">send</span>
                  <span>Publish Story</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Manage posted stories */}
        <div className="lg:col-span-7 space-y-6">
          {/* Navigation Tabs */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl max-w-sm">
            <button
              onClick={() => setActiveTab('active')}
              className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all ${activeTab === 'active' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Active Stories ({activeStories.length})
            </button>
            <button
              onClick={() => setActiveTab('archived')}
              className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all ${activeTab === 'archived' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Story Archive ({archivedStories.length})
            </button>
          </div>

          {/* Stories List */}
          {loading ? (
            <div className="bg-white rounded-[32px] border border-slate-100 p-12 text-center shadow-sm">
              <div className="w-8 h-8 border-3 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-4">Retrieving Stories...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeTab === 'active' ? (
                activeStories.length === 0 ? (
                  <div className="bg-white rounded-[32px] border border-slate-100 p-12 text-center text-slate-400 font-medium shadow-sm">
                    No active stories right now. Use the form to publish a new one!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeStories.map(story => (
                      <div key={story._id} className="bg-white border border-slate-100 rounded-3xl p-5 flex flex-col justify-between shadow-sm relative group hover:shadow-md transition-all">
                        <div>
                          {story.image && (
                            <div className="w-full h-40 rounded-2xl overflow-hidden mb-4 border border-slate-50">
                              <img src={story.image} alt={story.title} className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="px-2.5 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                              {story.category}
                            </span>
                            <span className="text-[10px] font-bold text-amber-500 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping"></span>
                              {getRemainingTime(story.createdAt)}
                            </span>
                          </div>
                          <h4 className="font-bold text-slate-800 text-sm mb-1">{story.title}</h4>
                        </div>

                        <div className="mt-5 pt-4 border-t border-slate-50 flex justify-between items-center">
                          <span className="text-[10px] text-slate-400 font-medium">
                            Uploaded {new Date(story.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <button
                            onClick={() => handleDelete(story._id)}
                            disabled={actionLoading === story._id}
                            className="text-red-500 hover:text-red-700 disabled:opacity-50 text-xs font-bold flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                archivedStories.length === 0 ? (
                  <div className="bg-white rounded-[32px] border border-slate-100 p-12 text-center text-slate-400 font-medium shadow-sm">
                    Your story archive is empty. Stories automatically move here after 24 hours of upload.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {archivedStories.map(story => (
                      <div key={story._id} className="bg-white border border-slate-100 rounded-3xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all opacity-85 hover:opacity-100">
                        <div>
                          {story.image && (
                            <div className="w-full h-40 rounded-2xl overflow-hidden mb-4 border border-slate-50 grayscale group-hover:grayscale-0 transition-all">
                              <img src={story.image} alt={story.title} className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="px-2.5 py-0.5 bg-slate-100 text-slate-500 rounded-full text-[10px] font-bold uppercase tracking-wider">
                              {story.category}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              Archived
                            </span>
                          </div>
                          <h4 className="font-bold text-slate-800 text-sm mb-1">{story.title}</h4>
                        </div>

                        <div className="mt-5 pt-4 border-t border-slate-50 flex justify-between items-center">
                          <span className="text-[10px] text-slate-400 font-medium">
                            Uploaded {new Date(story.createdAt).toLocaleDateString()}
                          </span>
                          <button
                            onClick={() => handleDelete(story._id)}
                            disabled={actionLoading === story._id}
                            className="text-red-500 hover:text-red-700 disabled:opacity-50 text-xs font-bold flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default DoctorStories;
