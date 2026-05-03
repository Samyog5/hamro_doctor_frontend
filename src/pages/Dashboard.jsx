import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';
import storyImage from '../assets/story_image.png';
import logoImg from '../assets/logo.png';
import doctorAvatar from '../assets/doctor_illustration.png';
import exerciseImg from '../assets/exercise_illustration.png';

const Dashboard = ({ onLogout }) => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    name: 'Ashok Basnet',
    id: 'HD-10125',
    avatar: 'AB'
  });



  return (
    <main className="dashboard-content">
        <header className="main-header">
          <div className="header-left">
            <h1 className="greeting">
              Good morning, {userData.name.split(' ')[0]}
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
            <p className="sub-headline">Here's your health summary for today</p>
          </div>
          <div className="header-right">
            <button className="notification-btn">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              <span className="notif-dot"></span>
            </button>
            <button className="book-button">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              Book Consultation
            </button>
          </div>
        </header>

        <div className="layout-grid">
          {/* Middle Column */}
          <div className="col-middle">
            {/* HERO Health Summary */}
            <section className="hero-card">
              <div className="hero-header">
                <div className="trend-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M12 19V5M5 12l7-7 7 7"/>
                  </svg>
                  <span>1.2 kg <small>vs last month</small></span>
                </div>
              </div>

              <h2 className="health-title">Slightly above healthy range</h2>
              <p className="health-subtitle">Don't worry, small changes can make a big difference.</p>

              <div className="bmi-visual">
                <div className="bmi-labels">
                  <span className="bmi-label-text">BMI (kg/m²)</span>
                </div>
                <div className="bmi-value-large">25.14</div>
                
                <div className="bmi-scale">
                  <div className="scale-bar">
                    <div className="scale-segment green"></div>
                    <div className="scale-segment orange"></div>
                    <div className="scale-segment red"></div>
                    <div className="scale-pointer" style={{ left: '60%' }}></div>
                  </div>
                  <div className="scale-markers">
                    <span>18.5</span>
                    <span>24.9</span>
                    <span>29.9</span>
                  </div>
                </div>
              </div>

              <div className="vitals-row">
                <div className="vital-item">
                  <div className="vital-icon-box">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
                      <path d="M3 6h18"></path>
                      <path d="M16 10a4 4 0 0 1-8 0"></path>
                    </svg>
                  </div>
                  <div className="vital-data">
                    <span className="v-label">WEIGHT</span>
                    <div className="v-val-group">
                      <span className="v-val">75 <small>kg</small></span>
                      <span className="v-trend up">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <path d="M12 19V5M5 12l7-7 7 7"/>
                        </svg>
                        0.6 kg
                      </span>
                    </div>
                  </div>
                </div>
                <div className="vital-item">
                  <div className="vital-icon-box">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                  <div className="vital-data">
                    <span className="v-label">HEIGHT</span>
                    <div className="v-val-group">
                      <span className="v-val">5'8"</span>
                      <span className="v-trend neutral">No change</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="hero-tip">
                <div className="tip-content">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="tip-icon">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                  </svg>
                  <span><strong>Today's tip:</strong> A 20-minute walk can improve your mood and heart health.</span>
                </div>
                <button className="tip-link">
                  View health plan 
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
            </section>



            {/* Health Insights */}
            <section className="section">
              <div className="section-header-row">
                <h3 className="section-headline">Health Insights</h3>
                <button className="view-all-btn">View all</button>
              </div>
              <div className="insight-card">
                <img src={storyImage} alt="Article" className="insight-img" />
                <div className="insight-body">
                  <div className="insight-meta">Dr. Amrit Raj Subedi | 5 min read</div>
                  <h4 className="insight-title">Improving patient care through digital empathy</h4>
                  <p className="insight-preview">How we balance innovation with the human touch essential for recovery...</p>
                  <button className="read-more-btn">
                    Read article 
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </button>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="col-right">
            <section className="side-card">
              <h3 className="side-title">Today's Schedule</h3>
              <div className="schedule-box">
                <div className="calendar-illustration">
                  {/* Simple SVG Calendar Illustration */}
                  <svg width="80" height="80" viewBox="0 0 100 100">
                    <rect x="10" y="20" width="80" height="70" rx="8" fill="#F3F4F6" stroke="#E5E7EB" strokeWidth="2"/>
                    <rect x="10" y="20" width="80" height="20" rx="8" fill="#0052CC"/>
                    <circle cx="80" cy="70" r="12" fill="#10B981"/>
                    <path d="M74 70l4 4 8-8" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h4>No appointments today</h4>
                <p>You're all set for today! Check-ups and regular tracking help you stay healthy.</p>
                <button className="schedule-btn">Book a check-up</button>
                <button className="calendar-link">
                  View calendar 
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
            </section>

            <section className="side-card">
              <h3 className="side-title">Quick Actions</h3>
              <div className="actions-list">
                <button className="action-row">
                  <div className="action-icon-bg green">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  </div>
                  <span>Upload Medical Report</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                </button>
                <button className="action-row">
                  <div className="action-icon-bg purple">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                  </div>
                  <span>Request Prescription</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                </button>
                <button className="action-row">
                  <div className="action-icon-bg blue">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  </div>
                  <span>Ask a Health Question</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                </button>
                <button className="action-row">
                  <div className="action-icon-bg orange">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  </div>
                  <span>View Health Plan</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                </button>
              </div>
            </section>

            <section className="side-card promo-card">
              <div className="promo-header">
                <h3>You're doing great!
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" style={{ marginLeft: '8px', verticalAlign: 'middle' }}>
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </h3>
              </div>
              <p>Consistency is the key to a healthier you.</p>
              
              <div className="promo-progress-area">
                <div className="progress-circle-box">
                  <svg width="80" height="80" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#F3F4F6" strokeWidth="8"/>
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#10B981" strokeWidth="8" strokeDasharray="150 251" strokeLinecap="round"/>
                    <text x="50" y="55" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#111827">4/7</text>
                  </svg>
                  <span className="progress-label">Health goals completed</span>
                </div>
                <img src={exerciseImg} alt="Exercise" className="promo-img" />
              </div>

              <button className="promo-link">
                View all goals 
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </section>

            {/* Support Section */}
            <section className="side-card help-section-main">
              <div className="help-flex">
                <div className="help-avatar-group">
                  <img src={doctorAvatar} alt="Doctor" className="help-avatar-img" />
                  <div className="online-indicator"></div>
                </div>
                <div className="help-text-content">
                  <h4>Need help?</h4>
                  <p>Our care team is available to help you with anything.</p>
                  <button className="help-action-btn">
                    Contact Support
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
  );
};

export default Dashboard;
