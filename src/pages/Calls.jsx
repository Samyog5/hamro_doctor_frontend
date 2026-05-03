import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';
import '../styles/Calls.css';

const Calls = () => {
  const navigate = useNavigate();
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCalls = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/consultations`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        
        if (data.success) {
          // Flatten all sessions from all consultations into a single calls list
          const allCalls = [];
          
          data.consultations.forEach(con => {
            if (con.sessions && con.sessions.length > 0) {
              con.sessions.forEach(session => {
                // Only include audio and video calls, not chat if any
                if (session.type === 'audio' || session.type === 'video') {
                  allCalls.push({
                    id: session._id,
                    doctor: { 
                      name: con.doctor?.name || 'Unknown Doctor', 
                      specialization: con.doctor?.doctorDetails?.specialization || 'General Physician' 
                    },
                    type: session.type === 'video' ? 'Video Call' : 'Audio Call',
                    duration: session.durationInMinutes ? `${session.durationInMinutes}:00` : '--:--',
                    date: new Date(session.startTime).toLocaleDateString(),
                    status: new Date() > new Date(session.endTime) ? 'Completed' : 'Scheduled'
                  });
                }
              });
            }
          });
          
          // Sort by date descending
          allCalls.sort((a, b) => new Date(b.date) - new Date(a.date));
          setCalls(allCalls);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching calls:', error);
        setLoading(false);
      }
    };

    fetchCalls();
  }, []);

  return (
    <main className="dashboard-content">
      <header className="main-header">
        <div className="header-left">
          <h1 className="greeting">My Calls</h1>
          <p className="sub-headline">History of your audio and video consultations.</p>
        </div>
      </header>

      <section className="calls-container">
        {loading ? (
          <div className="loading-state">Loading call history...</div>
        ) : calls.length > 0 ? (
          <div className="calls-list">
            <div className="calls-table-header">
              <div className="col-doc">Doctor</div>
              <div className="col-type">Type</div>
              <div className="col-duration">Duration</div>
              <div className="col-date">Date</div>
              <div className="col-status">Status</div>
              <div className="col-actions"></div>
            </div>
            {calls.map((call) => (
              <div key={call.id} className="call-row">
                <div className="col-doc">
                  <div className="doc-profile-sm">
                    <div className="doc-avatar-xs">{call.doctor.name.charAt(0)}</div>
                    <div>
                      <div className="doc-name-sm">Dr. {call.doctor.name}</div>
                      <div className="doc-spec-sm">{call.doctor.specialization}</div>
                    </div>
                  </div>
                </div>
                <div className="col-type">
                  <div className={`type-tag ${call.type.toLowerCase().replace(' ', '-')}`}>
                    {call.type === 'Video Call' ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    )}
                    {call.type}
                  </div>
                </div>
                <div className="col-duration">{call.duration}</div>
                <div className="col-date">{call.date}</div>
                <div className="col-status">
                  <span className={`status-dot ${call.status.toLowerCase()}`}></span>
                  {call.status}
                </div>
                <div className="col-actions">
                  <button className="call-action-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state-card">
            <div className="empty-icon-box">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            </div>
            <h3>No calls recorded</h3>
            <p>You haven't had any audio or video consultations yet.</p>
            <button className="btn-primary" onClick={() => navigate('/dashboard')}>Book a Consultation</button>
          </div>
        )}
      </section>
    </main>
  );
};

export default Calls;
