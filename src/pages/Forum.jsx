import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Forum = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [articleComments, setArticleComments] = useState([]);
  const [activeTab, setActiveTab] = useState('public');
  const [loading, setLoading] = useState(true);
  const [showPostModal, setShowPostModal] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', isAnonymous: false });
  const [replyContent, setReplyContent] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));

  useEffect(() => {
    if (activeTab === 'public') {
      fetchPosts();
    } else {
      fetchArticleComments();
    }
  }, [activeTab]);

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

  const fetchArticleComments = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const apiVersion = import.meta.env.VITE_API_VERSION || 'v1';
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/${apiVersion}/doctor/article-comments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setArticleComments(data.comments);
      }
    } catch (error) {
      console.error('Error fetching article comments:', error);
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

  const handleArticleCommentReply = async (articleId, parentCommentId) => {
    if (!replyContent.trim()) return;
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const apiVersion = import.meta.env.VITE_API_VERSION || 'v1';
      const response = await fetch(`${apiUrl}/api/${apiVersion}/articles/${articleId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ text: replyContent, parentCommentId })
      });
      if (response.ok) {
        setReplyContent('');
        setReplyingTo(null);
        fetchArticleComments();
      }
    } catch (error) {
      console.error('Error replying to article comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const getArticleSnippet = (content) => {
    if (!content) return '';
    const plainText = content.replace(/<[^>]*>/g, ' ');
    return plainText.length > 150 ? plainText.slice(0, 150) + '...' : plainText;
  };

  // Build comment tree (threads)
  const buildCommentTree = (comments) => {
    const commentMap = {};
    const rootComments = [];

    comments.forEach(c => {
      commentMap[c._id] = { ...c, replies: [] };
    });

    comments.forEach(c => {
      const mapped = commentMap[c._id];
      if (c.parentComment) {
        const parentId = c.parentComment._id || c.parentComment;
        const parent = commentMap[parentId];
        if (parent) {
          parent.replies.push(mapped);
        } else {
          rootComments.push(mapped);
        }
      } else {
        rootComments.push(mapped);
      }
    });

    return rootComments;
  };

  // Group root comments by article
  const groupCommentsByArticle = (comments) => {
    const tree = buildCommentTree(comments);
    const groups = {};

    tree.forEach(comment => {
      const artId = comment.article?._id;
      if (!artId) return;
      if (!groups[artId]) {
        groups[artId] = {
          article: comment.article,
          comments: []
        };
      }
      groups[artId].comments.push(comment);
    });

    return Object.values(groups);
  };

  const renderComment = (comment, depth = 0) => {
    const isReplying = replyingTo === comment._id;
    return (
      <div key={comment._id} className="relative mt-4">
        <div className="flex items-start gap-3 bg-slate-50/50 hover:bg-slate-50 p-4 rounded-2xl border border-slate-100/50 transition-colors">
          <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs uppercase overflow-hidden">
            {comment.author?.profile?.avatar ? (
              <img 
                src={
                  comment.author.profile.avatar.startsWith('http') || comment.author.profile.avatar.startsWith('data:') 
                    ? comment.author.profile.avatar 
                    : `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}${comment.author.profile.avatar}`
                } 
                alt="Avatar" 
                className="w-full h-full object-cover" 
              />
            ) : (
              comment.author?.name?.charAt(0) || 'U'
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800">{comment.author?.name}</span>
              {comment.author?.role === 'doctor' && (
                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[9px] font-bold uppercase">Expert</span>
              )}
              <span className="text-[10px] text-slate-400 font-medium ml-auto">
                {new Date(comment.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-slate-600 text-sm mt-1 leading-relaxed">{comment.text}</p>
            
            {/* Inline Reply Trigger */}
            <div className="mt-2">
              <button 
                onClick={() => {
                  setReplyingTo(isReplying ? null : comment._id);
                  setReplyContent('');
                }}
                className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                Reply
              </button>
            </div>
          </div>
        </div>

        {/* Inline Reply Form */}
        {isReplying && (
          <div className="mt-3 ml-6 pl-4 border-l-2 border-slate-100 space-y-3">
            <textarea 
              placeholder={`Reply to ${comment.author?.name}...`}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:border-blue-500 focus:bg-white outline-none transition-all min-h-[80px]"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
            />
            <div className="flex gap-2">
              <button 
                onClick={() => handleArticleCommentReply(comment.article?._id, comment._id)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-700"
              >
                Post Reply
              </button>
              <button 
                onClick={() => setReplyingTo(null)}
                className="text-slate-500 px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-100"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Child Replies (Threaded) */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="ml-6 pl-4 border-l-2 border-slate-100/50 space-y-2">
            {comment.replies.map(reply => renderComment(reply, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const groupedArticleComments = groupCommentsByArticle(articleComments);

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

        {/* Doctor Tab Switchers */}
        {user.role === 'doctor' && (
          <div className="flex gap-6 mb-8 border-b border-slate-200">
            <button 
              onClick={() => { setActiveTab('public'); setLoading(true); }}
              className={`pb-4 text-sm font-bold transition-all relative ${
                activeTab === 'public' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Public Forum
            </button>
            <button 
              onClick={() => { setActiveTab('comments'); setLoading(true); }}
              className={`pb-4 text-sm font-bold transition-all relative ${
                activeTab === 'comments' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              My Article Comments
            </button>
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        )}

        {!loading && activeTab === 'public' && (
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

                {/* Public Replies Section */}
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

                {/* Doctor Reply Action (Public Forum) */}
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
                        onClick={() => { setReplyingTo(post._id); setReplyContent(''); }}
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

        {!loading && activeTab === 'comments' && (
          <div className="space-y-8">
            {groupedArticleComments.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200">
                <div className="text-slate-400 mb-4 flex justify-center">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900">No article comments yet</h3>
                <p className="text-slate-500 text-sm">When readers comment on your published articles, they will appear here.</p>
              </div>
            ) : groupedArticleComments.map((group) => (
              <div key={group.article?._id} className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                
                {/* Article Header Details */}
                <div className="bg-blue-50/40 rounded-2xl p-4 border border-blue-50 mb-6">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider">Your Article</span>
                    <span className="text-[10px] text-slate-400 font-bold">Comments feed</span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 tracking-tight leading-snug">{group.article?.title}</h4>
                  <p className="text-slate-500 text-xs mt-1.5 leading-relaxed truncate-2-lines">{getArticleSnippet(group.article?.content)}</p>
                </div>

                {/* Comments Threads (Nested replies render here) */}
                <div className="space-y-4">
                  {group.comments.map(comment => renderComment(comment))}
                </div>

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
