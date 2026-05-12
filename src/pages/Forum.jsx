import React, { useState, useEffect } from 'react';

const Forum = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPostModal, setShowPostModal] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', isAnonymous: false });
  const [replyContent, setReplyContent] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const apiVersion = import.meta.env.VITE_API_VERSION || 'v1';
      const response = await fetch(`${apiUrl}/api/${apiVersion}/forum/questions`);
      const data = await response.json();
      if (data.success) {
        setPosts(data.questions);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const apiVersion = import.meta.env.VITE_API_VERSION || 'v1';
      const response = await fetch(`${apiUrl}/api/${apiVersion}/forum/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newPost)
      });
      if (response.ok) {
        setShowPostModal(false);
        setNewPost({ title: '', content: '', isAnonymous: false });
        fetchPosts();
      }
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (postId) => {
    if (!replyContent.trim()) return;
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const apiVersion = import.meta.env.VITE_API_VERSION || 'v1';
      const response = await fetch(`${apiUrl}/api/${apiVersion}/forum/questions/${postId}/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content: replyContent })
      });
      if (response.ok) {
        setReplyContent('');
        setReplyingTo(null);
        fetchPosts();
      }
    } catch (error) {
      console.error('Error replying:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 lg:ml-[280px] p-4 lg:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Discussion Forum</h1>
            <p className="text-slate-500 font-medium mt-1">Join the conversation, ask questions, and share health experiences.</p>
          </div>
          {user.role === 'patient' && (
            <button 
              onClick={() => setShowPostModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Start Discussion
            </button>
          )}
        </div>

        {loading && posts.length === 0 ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200">
                <div className="text-slate-400 mb-4 flex justify-center">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900">No discussions yet</h3>
                <p className="text-slate-500 text-sm">Be the first to start a conversation in our community.</p>
              </div>
            ) : posts.map((post) => (
              <div key={post._id} className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500 text-sm">
                      {post.isAnonymous ? 'A' : (post.user?.name?.[0] || 'U')}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">{post.isAnonymous ? 'Anonymous Patient' : post.user?.name}</div>
                      <div className="text-[11px] text-slate-400 font-medium">{new Date(post.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
                    {post.answers?.length || 0} {(post.answers?.length === 1) ? 'Reply' : 'Replies'}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2 leading-snug">{post.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">{post.content}</p>

                {/* Replies Section */}
                {post.answers && post.answers.length > 0 && (
                  <div className="space-y-4 mb-6 pl-4 border-l-2 border-slate-100">
                    {post.answers.map((answer, idx) => (
                      <div key={idx} className="bg-slate-50 rounded-2xl p-4 relative">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[11px] font-black text-blue-600 uppercase">Expert Advice</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-[11px] font-bold text-slate-500">{answer.doctor?.name}</span>
                        </div>
                        <p className="text-slate-700 text-sm leading-relaxed">{answer.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Doctor Reply Action */}
                {user.role === 'doctor' && (
                  <div className="mt-4">
                    {replyingTo === post._id ? (
                      <div className="space-y-3">
                        <textarea 
                          placeholder="Provide your professional insight..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm focus:border-blue-500 focus:bg-white outline-none transition-all min-h-[100px]"
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleReply(post._id)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700"
                          >
                            Post Reply
                          </button>
                          <button 
                            onClick={() => setReplyingTo(null)}
                            className="text-slate-500 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-100"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setReplyingTo(post._id)}
                        className="flex items-center gap-2 text-blue-600 text-sm font-bold hover:underline"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                        Reply to discussion
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Post Modal */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-slate-900">Start a Discussion</h2>
              <button onClick={() => setShowPostModal(false)} className="text-slate-400 hover:text-slate-600">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Topic Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. How to maintain a healthy sleep cycle?"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm focus:bg-white focus:border-blue-500 outline-none transition-all font-bold"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Details</label>
                <textarea 
                  placeholder="Share details about the topic..."
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm focus:bg-white focus:border-blue-500 outline-none transition-all min-h-[150px] leading-relaxed"
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  required
                />
              </div>

              <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl">
                <input 
                  type="checkbox" 
                  id="anonymous-forum"
                  className="w-5 h-5 rounded border-slate-300 text-blue-600"
                  checked={newPost.isAnonymous}
                  onChange={(e) => setNewPost({ ...newPost, isAnonymous: e.target.checked })}
                />
                <label htmlFor="anonymous-forum" className="text-sm font-bold text-slate-600 cursor-pointer">Post anonymously</label>
              </div>

              <button 
                type="submit" 
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Posting...' : 'Start Discussion'}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default Forum;
