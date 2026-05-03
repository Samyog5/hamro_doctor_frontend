import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';
import '../styles/Questions.css';

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
    <main className="dashboard-content">
      <header className="main-header">
        <div className="header-left">
          <h1 className="greeting">My Questions</h1>
          <p className="sub-headline">Public health queries you've posted on the forum.</p>
        </div>
        <button className="book-button" onClick={() => navigate('/dashboard')}>
          Ask a New Question
        </button>
      </header>

      <section className="questions-container">
        {loading ? (
          <div className="loading-state">Loading your questions...</div>
        ) : questions.length > 0 ? (
          <div className="questions-list">
            {questions.map((q) => (
              <div key={q._id} className="q-card">
                <div className="q-header">
                  <div className="q-status-tag">
                    {q.answers?.length > 0 ? (
                      <span className="status-answered">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                        Answered
                      </span>
                    ) : (
                      <span className="status-pending">Pending</span>
                    )}
                  </div>
                  <div className="q-date">{new Date(q.createdAt).toLocaleDateString()}</div>
                </div>

                <h3 className="q-title">{q.title}</h3>
                <p className="q-content">{q.content}</p>

                {q.answers?.length > 0 && (
                  <div className="q-answer-preview">
                    <div className="answer-header">
                      <div className="doc-mini-avatar">{q.answers[0].doctor?.name.charAt(0)}</div>
                      <span className="doc-name-label">Answered by Dr. {q.answers[0].doctor?.name}</span>
                    </div>
                    <p className="answer-text">{q.answers[0].content}</p>
                  </div>
                )}

                <div className="q-footer">
                  <span className="q-meta-info">
                    {q.isAnonymous ? 'Posted Anonymously' : 'Posted Publicly'}
                  </span>
                  <button className="view-thread-btn">View Full Thread</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state-card">
            <div className="empty-icon-box">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <h3>No questions asked yet</h3>
            <p>You haven't posted any public questions on our health forum.</p>
            <button className="btn-primary" onClick={() => navigate('/dashboard')}>Ask Your First Question</button>
          </div>
        )}
      </section>
    </main>
  );
};

export default Questions;
