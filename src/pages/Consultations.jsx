import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css'; // Reuse shell styles
import '../styles/Consultations.css';
import logoImg from '../assets/logo.png';
import doctorAvatar from '../assets/doctor_illustration.png';

const Consultations = ({ onLogout }) => {
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userData] = useState(JSON.parse(localStorage.getItem('user')) || { name: 'Ashok Basnet', id: 'HD-10125', avatar: 'AB' });

  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        const token = localStorage.getItem('token');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
        const apiVersion = import.meta.env.VITE_API_VERSION || 'v1';
        
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

    fetchConsultations();
  }, []);

  return (
    <main className="dashboard-content">
        <header className="main-header">
          <div className="header-left">
            <h1 className="greeting">My Consultations</h1>
            <p className="sub-headline">View and manage your medical consultation history.</p>
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
                      <div className="doc-avatar">{c.doctor?.name?.charAt(0) || 'D'}</div>
                      <div>
                        <h3>Dr. {c.doctor?.name || 'Unknown'}</h3>
                        <p>{c.doctor?.doctorDetails?.specialization || 'General Physician'}</p>
                      </div>
                    </div>
                    <div className={`status-pill ${c.status}`}>
                      {c.status}
                    </div>
                  </div>
                  <div className="consult-details">
                    <div className="detail-item">
                      <span className="detail-label">Started on</span>
                      <span className="detail-value">{new Date(c.consultationStart).toLocaleDateString()}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Valid until</span>
                      <span className="detail-value">{new Date(c.consultationEnd).toLocaleDateString()}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Amount</span>
                      <span className="detail-value">Rs. {c.amount}</span>
                    </div>
                  </div>
                  <div className="consult-actions">
                    <button className="btn-primary-sm">Open Chat</button>
                    <button className="btn-secondary-sm">View Prescription</button>
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
              <p>Your consultation history will appear here once you start a session with a doctor.</p>
              <button className="book-button" onClick={() => navigate('/dashboard')}>Book a Consultation</button>
            </div>
          )}
        </section>
      </main>
  );
};

export default Consultations;
