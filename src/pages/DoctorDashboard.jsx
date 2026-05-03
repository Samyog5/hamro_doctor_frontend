import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/DoctorDashboard.css';

function DoctorDashboard({ onLogout }) {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState({
    noOfConsultations: 0,
    recommendations: 0,
    articlesPublished: 0,
    netEarnings: 0,
    articleViews: 0,
    totalPageViews: 0
  });
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
  const apiVersion = import.meta.env.VITE_API_VERSION || 'v1';

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));
        
        if (!token || !user) {
          navigate('/login');
          return;
        }

        setUserData(user);
        setIsOnline(user.doctorDetails?.isOnline || false);

        // Fetch stats
        const response = await fetch(`${apiUrl}/api/${apiVersion}/doctor/dashboard`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        if (data.success) {
          setStats(data.stats);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const toggleStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const newStatus = !isOnline;
      
      const response = await fetch(`${apiUrl}/api/${apiVersion}/doctor/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isOnline: newStatus })
      });

      const data = await response.json();
      if (data.success) {
        setIsOnline(newStatus);
        // Update user in localStorage
        const user = JSON.parse(localStorage.getItem('user'));
        user.doctorDetails.isOnline = newStatus;
        localStorage.setItem('user', JSON.stringify(user));
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  if (loading) {
    return <div className="loading-state">Loading...</div>;
  }

  return (
    <main className="dashboard-content">
      <header className="main-header">
        <div className="header-left">
          <h1 className="greeting">
            Good morning, {userData?.doctorDetails?.salutation} {userData?.name?.split(' ')[0]}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" style={{ marginLeft: '12px', verticalAlign: 'middle' }}>
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          </h1>
          <p className="sub-headline">Manage your patients and clinical activities</p>
        </div>
        <div className="header-right">
          <div className="status-toggle-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'white', padding: '8px 16px', borderRadius: '30px', border: '1px solid #E5E7EB' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: isOnline ? '#10B981' : '#6B7280' }}>{isOnline ? 'Online' : 'Offline'}</span>
            <label className="toggle-switch">
              <input type="checkbox" checked={isOnline} onChange={toggleStatus} />
              <span className="slider"></span>
            </label>
          </div>
          <button className="notification-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <span className="notif-dot"></span>
          </button>
        </div>
      </header>

      <div className="layout-grid">
        {/* Middle Column */}
        <div className="col-middle">
          {/* Stats Hero Card */}
          <section className="hero-card doctor-hero">
            <div className="hero-header">
              <div className="trend-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M12 19V5M5 12l7-7 7 7"/>
                </svg>
                <span>Rs. {stats.netEarnings} <small>total earnings</small></span>
              </div>
            </div>

            <h2 className="health-title" style={{ color: '#0052CC' }}>Practice Overview</h2>
            <p className="health-subtitle">You've reached {stats.noOfConsultations} consultations this month. Keep it up!</p>

            <div className="doctor-stats-main-row">
                <div className="doc-main-stat">
                    <span className="stat-label-mini">CONSULTATIONS</span>
                    <div className="stat-value-big">{stats.noOfConsultations}</div>
                </div>
                <div className="doc-main-stat">
                    <span className="stat-label-mini">RECOMMENDATIONS</span>
                    <div className="stat-value-big">{stats.recommendations}</div>
                </div>
                <div className="doc-main-stat">
                    <span className="stat-label-mini">ARTICLES</span>
                    <div className="stat-value-big">{stats.articlesPublished}</div>
                </div>
            </div>

            <div className="hero-tip" style={{ backgroundColor: '#EEF2FF' }}>
              <div className="tip-content">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" className="tip-icon">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
                </svg>
                <span style={{ color: '#1E1B4B' }}><strong>Pro Tip:</strong> Answering unanswered questions in the forum can increase your profile visibility.</span>
              </div>
            </div>
          </section>

          {/* Active Consultations */}
          <section className="section">
            <div className="section-header-row">
              <h3 className="section-headline">Active Consultations</h3>
              <button className="view-all-btn">View all</button>
            </div>
            <div className="doctor-consult-list">
                <div className="doc-consult-card">
                    <div className="patient-brief">
                        <div className="patient-avatar">SM</div>
                        <div className="patient-details">
                            <h4>Samyok Majhi</h4>
                            <p>Fever and Headache • 2:30 PM</p>
                        </div>
                    </div>
                    <button className="action-btn-outline">Join Call</button>
                </div>
                <div className="doc-consult-card">
                    <div className="patient-brief">
                        <div className="patient-avatar">AB</div>
                        <div className="patient-details">
                            <h4>Ashok Basnet</h4>
                            <p>Follow-up • 4:00 PM</p>
                        </div>
                    </div>
                    <button className="action-btn-outline">View Records</button>
                </div>
            </div>
          </section>

          {/* Latest from Health Community */}
          <section className="section">
            <div className="section-header-row">
              <h3 className="section-headline">Health Community Stories</h3>
            </div>
            <div className="stories-reel">
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="story-item-wrapper">
                        <div className="story-circle-doc"></div>
                        <span>Doctor {i}</span>
                    </div>
                ))}
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="col-right">
          {/* Monthly Activities */}
          <section className="side-card">
            <h3 className="side-title">Activities this month</h3>
            <div className="doc-activity-list">
                <div className="activity-row">
                    <div className="activity-icon-bg" style={{ backgroundColor: '#F0FDF4' }}>👁️</div>
                    <div className="activity-info">
                        <span className="activity-name">Article Views</span>
                        <span className="activity-val">{stats.articleViews}</span>
                    </div>
                </div>
                <div className="activity-row">
                    <div className="activity-icon-bg" style={{ backgroundColor: '#EFF6FF' }}>📊</div>
                    <div className="activity-info">
                        <span className="activity-name">Profile Views</span>
                        <span className="activity-val">{stats.totalPageViews}</span>
                    </div>
                </div>
            </div>
          </section>

          {/* Quick Actions */}
          <section className="side-card">
            <h3 className="side-title">Quick Tools</h3>
            <div className="actions-list">
              <button className="action-row">
                <div className="action-icon-bg green">🏥</div>
                <span>Hospitals & OPD</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
              </button>
              <button className="action-row">
                <div className="action-icon-bg purple">📝</div>
                <span>Write Article</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
              </button>
              <button className="action-row">
                <div className="action-icon-bg blue">💊</div>
                <span>Prescription Templates</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            </div>
          </section>

          {/* Boost Profile */}
          <section className="side-card promo-card" style={{ backgroundColor: '#EEF2FF', borderColor: '#C7D2FE' }}>
            <div className="promo-header">
              <h3 style={{ color: '#3730A3' }}>Boost Your Profile
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" style={{ marginLeft: '8px', verticalAlign: 'middle' }}>
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </h3>
            </div>
            <p style={{ color: '#4338CA' }}>Complete your clinical background to get more recommendations.</p>
            <button className="promo-link" style={{ color: '#4F46E5' }}>
              Edit Profile 
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </section>
        </div>
      </div>
    </main>
  );
}

export default DoctorDashboard;
