import React, { useState, useEffect } from 'react';
import '../styles/Dashboard.css';
import '../styles/Prescriptions.css';

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/prescriptions`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) setPrescriptions(data.prescriptions);
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
          <div className="prescriptions-list">
            {prescriptions.map((px) => (
              <div key={px._id} className={`px-card-v2 ${expanded === px._id ? 'expanded' : ''}`}>
                {/* Card Header */}
                <div className="px-card-top" onClick={() => setExpanded(expanded === px._id ? null : px._id)}>
                  <div className="px-icon-wrap">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
                    </svg>
                  </div>
                  <div className="px-summary">
                    <div className="px-diagnosis-badge">{px.diagnosis || 'General Consultation'}</div>
                    <div className="px-meta-row">
                      <span>Dr. {px.doctor?.name}</span>
                      <span className="px-dot">·</span>
                      <span>{px.medicines?.length} medicine{px.medicines?.length !== 1 ? 's' : ''}</span>
                      <span className="px-dot">·</span>
                      <span>{new Date(px.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                  <button className={`px-expand-btn ${expanded === px._id ? 'open' : ''}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </button>
                </div>

                {/* Expanded Detail */}
                {expanded === px._id && (
                  <div className="px-detail">
                    <div className="px-detail-section">
                      <div className="px-detail-label">Doctor</div>
                      <div className="px-doc-row">
                        <div className="px-doc-avatar-lg">{px.doctor?.name?.charAt(0)}</div>
                        <div>
                          <div className="px-doc-name-lg">Dr. {px.doctor?.name}</div>
                          <div className="px-doc-spec-lg">{px.doctor?.doctorDetails?.specialization || 'General Physician'}</div>
                        </div>
                      </div>
                    </div>

                    {px.medicines?.length > 0 && (
                      <div className="px-detail-section">
                        <div className="px-detail-label">Prescribed Medicines</div>
                        <div className="px-medicines-table">
                          <div className="px-medicines-head">
                            <span>Medicine</span><span>Dosage</span><span>Frequency</span><span>Duration</span>
                          </div>
                          {px.medicines.map((med, i) => (
                            <div key={i} className="px-medicine-item">
                              <div className="px-med-name">
                                <span className="px-med-num">{i + 1}</span>
                                <div>
                                  <strong>{med.name}</strong>
                                  {med.strength && <span className="px-med-strength"> {med.strength}</span>}
                                </div>
                              </div>
                              <span className="px-med-field">{med.dosage || '—'}</span>
                              <span className="px-med-field">{med.frequency || '—'}</span>
                              <span className="px-med-field">{med.duration || '—'}</span>
                              {med.instruction && (
                                <div className="px-med-instruction">📝 {med.instruction}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {px.advice && (
                      <div className="px-detail-section">
                        <div className="px-detail-label">Doctor's Advice</div>
                        <div className="px-advice-box">{px.advice}</div>
                      </div>
                    )}

                    {px.pdfUrl && (
                      <a
                        href={`${import.meta.env.VITE_API_URL}/${px.pdfUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-px-download"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="7 10 12 15 17 10"/>
                          <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                        Download PDF
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state-card">
            <div className="empty-icon-box">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5">
                <path d="M10 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
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
