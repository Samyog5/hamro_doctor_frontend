import React, { useState, useEffect } from 'react';
import '../styles/Dashboard.css';
import storyImage from '../assets/story_image.png';
import logoImg from '../assets/logo.png';

const Dashboard = ({ onLogout }) => {
  const [userData, setUserData] = useState({
    name: 'Ashok Basnet',
    id: 'HD-10125',
    avatar: 'AB'
  });

  const stats = [
    {
      label: 'BMI Metrics',
      value: '25.14',
      subtext: 'Overweight | 75KG / 5\'8"',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
          <line x1="7" y1="7" x2="7.01" y2="7"></line>
        </svg>
      ),
      type: 'bmi'
    },
    {
      label: 'Total Consultation',
      value: '2',
      subtext: '2 consultations given till date',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      ),
      type: 'consult'
    },
    {
      label: 'Total Recommendations',
      value: '7',
      subtext: '7 recommendations given till date',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      ),
      type: 'recomm'
    },
    {
      label: 'Total Queries',
      value: '4',
      subtext: '4 questions you asked till date',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      ),
      type: 'queries'
    },
    {
      label: 'Medical Reports',
      value: '2',
      subtext: '2 medical reports uploaded till date',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
      ),
      type: 'reports'
    }
  ];

  const menuItems = [
    { 
      id: 'profile', 
      label: 'My Profile', 
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      ), 
      active: true 
    },
    { 
      id: 'consultations', 
      label: 'My Consultations', 
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      ) 
    },
    { 
      id: 'calls', 
      label: 'My Calls', 
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
        </svg>
      ) 
    },
    { 
      id: 'prescription', 
      label: 'My Prescription', 
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="12" y1="18" x2="12" y2="12"></line>
          <line x1="9" y1="15" x2="15" y2="15"></line>
        </svg>
      ) 
    },
    { 
      id: 'appointments', 
      label: 'My Appointments', 
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      ) 
    },
    { 
      id: 'questions', 
      label: 'My Questions', 
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          <line x1="12" y1="11" x2="12" y2="11.01"></line>
          <path d="M12 7a2 2 0 0 1 0 4"></path>
        </svg>
      ) 
    }
  ];

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src={logoImg} alt="Hamro Doctor" style={{ height: '45px', width: 'auto' }} />
        </div>

        <div className="user-profile-brief">
          <div className="user-avatar-container">
            <div className="user-avatar">{userData.avatar}</div>
            <div className="verified-badge">✓</div>
          </div>
          <h3 className="user-name">{userData.name}</h3>
          <p className="user-id">{userData.id}</p>
          <button className="edit-profile-btn">Edit Profile</button>
        </div>

        <nav className="sidebar-menu">
          {menuItems.map((item) => (
            <a 
              key={item.id} 
              href={`#${item.id}`} 
              className={`menu-item ${item.active ? 'active' : ''}`}
            >
              <span className="menu-icon">{item.icon}</span>
              <span>{item.label}</span>
            </a>
          ))}
        </nav>

        <button className="logout-btn" onClick={onLogout}>
          <span className="menu-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </span>
          <span>Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="dashboard-header">
          <h1>Customer Profile</h1>
          <p>Welcome back, {userData.name}. Here's your health summary.</p>
        </header>

        {/* Stats Grid */}
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className={`stat-icon-wrapper stat-icon-${stat.type}`}>
                {stat.icon}
              </div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
              <div className="stat-subtext">{stat.subtext}</div>
            </div>
          ))}
        </div>

        {/* Latest Stories */}
        <section className="content-section">
          <div className="section-header">
            <h2>Latest Stories</h2>
            <a href="#stories" className="view-all-link">View All</a>
          </div>

          <div className="story-card">
            <img src={storyImage} alt="Medical Story" className="story-image" />
            <div className="story-content">
              <div className="doctor-info">
                <div className="doctor-avatar"></div>
                <div className="doctor-details">
                  <h4>Dr. Amrit Raj Subedi</h4>
                  <p className="story-date">Tue, Dec 05 2023 06:18 PM</p>
                </div>
              </div>
              <h3 className="story-title">Patient care comes first! 👋</h3>
              <p className="story-excerpt">
                At Hamro Doctor, we believe that healthcare should be accessible, personal, and reliable. 
                Our latest initiative focuses on bridging the gap between doctors and patients through 
                digital innovation while maintaining the human touch that is essential for healing.
              </p>
              <button className="read-more-btn">Read More</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
