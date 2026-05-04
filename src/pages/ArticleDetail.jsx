import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ArticleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [interactionLoading, setInteractionLoading] = useState(false);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
  const apiVersion = import.meta.env.VITE_API_VERSION || 'v1';

  useEffect(() => {
    fetchArticle();
    fetchComments();
    fetchCurrentUser();
  }, [id]);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch(`${apiUrl}/api/${apiVersion}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchArticle = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/${apiVersion}/articles/${id}`);
      const data = await response.json();
      if (data.success) {
        setArticle(data.article);
      }
    } catch (error) {
      console.error('Error fetching article:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/${apiVersion}/articles/${id}/comments`);
      const data = await response.json();
      if (data.success) {
        setComments(data.comments);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleToggleInteraction = async (type) => {
    if (interactionLoading) return;
    setInteractionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/${apiVersion}/articles/${id}/${type}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setArticle(prev => ({
          ...prev,
          likes: data.likes,
          dislikes: data.dislikes
        }));
      }
    } catch (error) {
      console.error(`Error toggling ${type}:`, error);
    } finally {
      setInteractionLoading(false);
    }
  };

  const handleAddComment = async (e, parentId = null) => {
    e.preventDefault();
    const text = parentId ? replyText : newComment;
    if (!text.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/${apiVersion}/articles/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text, parentCommentId: parentId })
      });
      const data = await response.json();
      if (data.success) {
        setComments(prev => [data.comment, ...prev]);
        if (parentId) {
          setReplyingTo(null);
          setReplyText('');
        } else {
          setNewComment('');
        }
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const CommentItem = ({ comment, depth = 0 }) => {
    const replies = comments.filter(c => c.parentComment === comment._id);
    const hasLiked = comment.likes?.includes(user._id);

    return (
      <div className={`space-y-4 ${depth > 0 ? 'ml-8 lg:ml-12 mt-4 pl-4 border-l-2 border-slate-50' : 'mb-8'}`}>
        <div className="flex gap-4">
          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold text-sm overflow-hidden flex-shrink-0">
            {comment.author?.profile?.avatar ? (
              <img src={comment.author.profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              comment.author?.name?.[0]
            )}
          </div>
          <div className="flex-1">
            <div className="bg-slate-50 rounded-[24px] p-4 lg:p-5">
              <div className="flex items-center justify-between mb-1">
                <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-tight">
                  {comment.author?.doctorDetails?.salutation ? `${comment.author.doctorDetails.salutation} ` : ''}
                  {comment.author?.name}
                </h5>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{new Date(comment.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">{comment.text}</p>
            </div>
            <div className="flex items-center gap-6 mt-2 ml-4">
              <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors">Like</button>
              <button 
                onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors"
              >
                Reply
              </button>
            </div>

            {replyingTo === comment._id && (
              <form onSubmit={(e) => handleAddComment(e, comment._id)} className="mt-4 flex gap-3">
                <input 
                  autoFocus
                  type="text"
                  placeholder="Write a reply..."
                  className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-2 text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
                <button type="submit" className="text-blue-600">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                </button>
              </form>
            )}

            {replies.map(reply => (
              <CommentItem key={reply._id} comment={reply} depth={depth + 1} />
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <main className="flex-1 lg:ml-[280px] min-h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
      </main>
    );
  }

  if (!article) {
    return (
      <main className="flex-1 lg:ml-[280px] min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8">
        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-6 text-slate-300 shadow-sm">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Article Not Found</h2>
        <button onClick={() => navigate('/articles')} className="text-blue-600 font-bold hover:underline">Back to Articles</button>
      </main>
    );
  }

  const isLiked = article.likes?.includes(user._id);
  const isDisliked = article.dislikes?.includes(user._id);

  return (
    <main className="flex-1 lg:ml-[280px] min-h-screen bg-white font-['Poppins']">
      {/* Hero Header */}
      <div className="relative h-[300px] lg:h-[450px] overflow-hidden bg-slate-900">
        {article.featureImage ? (
          <img src={article.featureImage} alt={article.title} className="w-full h-full object-cover opacity-60" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-800 opacity-80" />
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-16 max-w-4xl mx-auto">
          <div className="flex gap-2 mb-4 animate-in slide-in-from-bottom-4 duration-500">
            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-blue-200">
              {article.category || 'Health Tip'}
            </span>
          </div>
          <h1 className="text-2xl lg:text-4xl font-black text-slate-900 leading-tight mb-6 animate-in slide-in-from-bottom-6 duration-700">
            {article.title}
          </h1>
        </div>

        <button 
          onClick={() => navigate('/articles')}
          className="absolute top-6 left-6 lg:left-12 p-2.5 bg-white/90 backdrop-blur-md text-slate-900 rounded-xl shadow-xl hover:scale-105 transition-all z-20"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_250px] gap-12">
          {/* Article Content */}
          <div>
            <div className="article-body text-slate-600 text-base lg:text-lg leading-relaxed space-y-6 font-medium whitespace-pre-wrap mb-12">
              {article.content}
            </div>
            
            {/* Interactions Bar */}
            <div className="flex items-center gap-4 py-6 border-y border-slate-50 mb-12">
              <button 
                onClick={() => handleToggleInteraction('like')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-black transition-all ${isLiked ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-slate-50 text-slate-500 hover:bg-blue-50 hover:text-blue-600'}`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                {article.likes?.length || 0}
              </button>
              <button 
                onClick={() => handleToggleInteraction('dislike')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-black transition-all ${isDisliked ? 'bg-red-600 text-white shadow-lg shadow-red-100' : 'bg-slate-50 text-slate-500 hover:bg-red-50 hover:text-red-600'}`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill={isDisliked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"/></svg>
                {article.dislikes?.length || 0}
              </button>
            </div>

            {/* Comments Section */}
            <section className="space-y-10">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Curiosity Corner</h3>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{comments.length} Discussion{comments.length !== 1 ? 's' : ''}</span>
              </div>

              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="flex gap-4 group">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center font-black text-lg flex-shrink-0 overflow-hidden">
                  {user.profile?.avatar ? (
                    <img src={user.profile.avatar} alt="User" className="w-full h-full object-cover" />
                  ) : (
                    user.name?.charAt(0)
                  )}
                </div>
                <div className="flex-1 relative">
                  <textarea 
                    placeholder="Share your curiosity or ask a question..."
                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none h-24"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <button 
                    type="submit"
                    className="absolute bottom-3 right-3 bg-blue-600 text-white px-6 py-2 rounded-xl text-xs font-black shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all opacity-0 group-focus-within:opacity-100 translate-y-2 group-focus-within:translate-y-0"
                  >
                    Post Curiosity
                  </button>
                </div>
              </form>

              {/* Comments List */}
              <div className="pt-8">
                {comments.filter(c => !c.parentComment).length === 0 ? (
                  <div className="text-center py-12 bg-slate-50/50 rounded-[40px] border border-dashed border-slate-200">
                    <p className="text-slate-400 font-bold text-sm">No discussions yet. Be the first to start!</p>
                  </div>
                ) : (
                  comments.filter(c => !c.parentComment).map(comment => (
                    <CommentItem key={comment._id} comment={comment} />
                  ))
                )}
              </div>
            </section>
          </div>

          {/* Author Sidebar */}
          <aside className="space-y-8">
            <div className="bg-slate-50 rounded-[32px] p-6 lg:p-8 text-center sticky top-8">
              <div className="w-20 h-20 bg-white p-1.5 rounded-[28px] shadow-lg mx-auto mb-5">
                <div className="w-full h-full bg-blue-100 text-blue-600 rounded-[20px] flex items-center justify-center text-2xl font-black overflow-hidden uppercase">
                  {article.author?.profile?.avatar ? (
                    <img src={article.author.profile.avatar} alt="Author" className="w-full h-full object-cover" />
                  ) : (
                    article.author?.name?.[0]
                  )}
                </div>
              </div>
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight mb-1">Dr. {article.author?.name}</h4>
              <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-6">Verified Expert</p>
              
              <div className="text-[10px] text-slate-500 font-bold leading-relaxed mb-8 uppercase tracking-wide">
                Speciality: {article.author?.doctorDetails?.speciality || 'General Medicine'}
              </div>
              
              <button className="w-full py-3 bg-white text-slate-900 rounded-xl text-[10px] font-black shadow-sm border border-slate-200 hover:bg-slate-900 hover:text-white transition-all uppercase tracking-widest">
                Consult Expert
              </button>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default ArticleDetail;
