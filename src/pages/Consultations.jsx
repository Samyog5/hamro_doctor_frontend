import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';
import '../styles/Consultations.css';

const Consultations = ({ onLogout }) => {
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || {});

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
  const apiVersion = import.meta.env.VITE_API_VERSION || 'v1';

  const fetchConsultations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${apiUrl}/api/${apiVersion}/consultations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setConsultations(data.consultations);
      }
    } catch (error) {
      console.error('Error fetching consultations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultations();
  }, []);

  const handleRespond = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/${apiVersion}/consultations/${id}/respond`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      const data = await response.json();
      if (data.success) {
        alert(`Consultation ${status === 'active' ? 'accepted' : 'rejected'}`);
        fetchConsultations(); // Refresh list
      }
    } catch (err) {
      console.error('Error responding to consultation:', err);
    }
  };

  const isDoctor = user.role === 'doctor';

  return (
    <main className="dashboard-content">
        <header className="main-header">
          <div className="header-left">
            <h1 className="greeting">My Consultations</h1>
            <p className="sub-headline">
              {isDoctor 
                ? 'Manage your patient consultations and incoming requests.' 
                : 'View and manage your medical consultation history.'}
            </p>
          </div>
        </header>

        <section className="consultations-container">
          {loading ? (
            <div className="loading-state">Loading your consultations...</div>
          ) : consultations.length > 0 ? (
            <div className="consultations-list">
              {consultations.map((c) => (
                <div key={c._id} className="consult-card">
                  <div className="consult-card-header">
                    <div className="doctor-info">
                      <div className="doc-avatar">
                        {isDoctor ? c.patient?.name?.charAt(0) : c.doctor?.name?.charAt(0) || 'D'}
                      </div>
                      <div>
                        <h3>{isDoctor ? c.patient?.name : `Dr. ${c.doctor?.name || 'Unknown'}`}</h3>
                        <p>
                          {!isDoctor && (c.doctor?.doctorDetails?.speciality || 'Specialist')}
                        </p>
                      </div>
                    </div>
                    <div className={`status-pill ${c.status}`}>
                      {c.status.toUpperCase()}
                    </div>
                  </div>
                  
                  <div className="consult-details">
                    <div className="detail-item">
                      <span className="detail-label">Started on</span>
                      <span className="detail-value">
                        {c.consultationStart ? new Date(c.consultationStart).toLocaleDateString() : 'Pending'}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Valid until</span>
                      <span className="detail-value">
                        {c.consultationEnd ? new Date(c.consultationEnd).toLocaleDateString() : 'Pending'}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Amount</span>
                      <span className="detail-value">Rs. {c.amount || '0'}</span>
                    </div>
                  </div>

                  <div className="consult-actions">
                    {isDoctor && c.status === 'pending' ? (
                      <>
                        <button className="btn-primary-sm" onClick={() => handleRespond(c._id, 'active')}>Accept Request</button>
                        <button className="btn-secondary-sm" style={{ color: '#EF4444' }} onClick={() => handleRespond(c._id, 'cancelled')}>Reject</button>
                      </>
                    ) : (
                      <>
                        <button 
                          className="btn-primary-sm" 
                          disabled={c.status === 'pending'}
                          onClick={() => navigate(`/chat/${c._id}`)}
                        >
                          Open Chat
                        </button>
                        <button className="btn-secondary-sm" disabled={c.status === 'pending'}>View Prescription</button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-consult-state">
              <div className="empty-illustration">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <h3>No consultations yet</h3>
              <p>Your consultation history will appear here once you {isDoctor ? 'receive requests' : 'start a session'} with a {isDoctor ? 'patient' : 'doctor'}.</p>
              {!isDoctor && <button className="book-button" onClick={() => navigate('/dashboard')}>Book a Consultation</button>}
            </div>
          )}
        </section>
      </main>
  );
};

export default Consultations;
