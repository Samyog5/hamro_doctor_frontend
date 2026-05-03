import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';
import '../styles/Prescriptions.css';

const Prescriptions = () => {
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/prescriptions`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        
        if (data.success) {
          setPrescriptions(data.prescriptions);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching prescriptions:', error);
        setLoading(false);
      }
    };

    fetchPrescriptions();
  }, []);

  return (
    <main className="dashboard-content">
      <header className="main-header">
        <div className="header-left">
          <h1 className="greeting">My Prescriptions</h1>
          <p className="sub-headline">View and download your digital prescriptions.</p>
        </div>
      </header>

      <section className="prescriptions-container">
        {loading ? (
          <div className="loading-state">Fetching prescriptions...</div>
        ) : prescriptions.length > 0 ? (
          <div className="prescriptions-grid">
            {prescriptions.map((px) => (
              <div key={px._id} className="px-card">
                <div className="px-card-header">
                  <div className="px-icon-box">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                  </div>
                  <div className="px-meta">
                    <div className="px-id">#{px._id.slice(-6).toUpperCase()}</div>
                    <div className="px-date">{new Date(px.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>

                <div className="px-body">
                  <div className="px-diagnosis-label">Diagnosis</div>
                  <div className="px-diagnosis-value">{px.diagnosis}</div>
                  
                  <div className="px-medicines-summary">
                    {px.medicines.length} Medicine{px.medicines.length > 1 ? 's' : ''} prescribed
                  </div>

                  <div className="px-doctor-info">
                    <div className="px-doc-avatar">{px.doctor?.name.charAt(0)}</div>
                    <div>
                      <div className="px-doc-name">Dr. {px.doctor?.name}</div>
                      <div className="px-doc-spec">{px.doctor?.doctorDetails?.specialization}</div>
                    </div>
                  </div>
                </div>

                <div className="px-footer">
                  <a href={`${import.meta.env.VITE_API_URL}/${px.pdfUrl}`} target="_blank" rel="noopener noreferrer" className="btn-px-download">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Download PDF
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state-card">
            <div className="empty-icon-box">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5"><path d="M10 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <h3>No prescriptions found</h3>
            <p>Your digital prescriptions will appear here once issued by your doctor.</p>
          </div>
        )}
      </section>
    </main>
  );
};

export default Prescriptions;
