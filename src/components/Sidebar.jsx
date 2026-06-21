import React from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import logoImg from '../assets/logo.png';

const Sidebar = ({ userData, onLogout, isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = userData.role === 'admin';
  const isDoctor = userData.role === 'doctor';

  let menuItems = [];

  if (isAdmin) {
    menuItems = [
      { 
        id: 'admin-dashboard', 
        label: 'System Oversight', 
        path: '/admin-dashboard',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
        )
      },
      { 
        id: 'onboard', 
        label: 'Onboard Accounts', 
        path: '/admin/onboard',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="8.5" cy="7" r="4"></circle>
            <line x1="20" y1="8" x2="20" y2="14"></line>
            <line x1="17" y1="11" x2="23" y2="11"></line>
          </svg>
        )
      },
      { 
        id: 'admin-articles', 
        label: 'Manage Articles', 
        path: '/admin/articles',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
        )
      },
      { 
        id: 'prescriptions', 
        label: 'Prescriptions', 
        path: '/admin/prescriptions',
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
        id: 'profile', 
        label: 'Admin Profile', 
        path: '/profile',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        ) 
      }
    ];
  } else if (userData.role === 'hospital') {
    menuItems = [
      { 
        id: 'hospital-dashboard', 
        label: 'Hospital Administration', 
        path: '/hospital-dashboard',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
            <path d="M12 14v4"></path>
            <path d="M10 16h4"></path>
          </svg>
        )
      },
      { 
        id: 'hospital-onboard', 
        label: 'Onboard Staff', 
        path: '/hospital/onboard',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="8.5" cy="7" r="4"></circle>
            <line x1="20" y1="8" x2="20" y2="14"></line>
            <line x1="17" y1="11" x2="23" y2="11"></line>
          </svg>
        )
      },
      { 
        id: 'prescriptions', 
        label: 'Prescriptions', 
        path: '/hospital/prescriptions',
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
        id: 'profile', 
        label: 'Hospital Profile', 
        path: '/profile',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        ) 
      }
    ];
  } else if (isDoctor) {
    menuItems = [
    { 
      id: 'doctor-dashboard', 
      label: 'Doctor Dashboard', 
      path: '/doctor-dashboard',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
      )
    },
    { 
      id: 'consultations', 
      label: 'Consultations', 
      path: '/consultations',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      ) 
    },
    { 
      id: 'messages', 
      label: 'My Messages', 
      path: '/messages',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
        </svg>
      ) 
    },
    { 
      id: 'calls', 
      label: 'My Calls', 
      path: '/calls',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
        </svg>
      ) 
    },
    { 
      id: 'appointments', 
      label: 'Appointments', 
      path: '/appointments',
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
      id: 'articles', 
      label: 'Articles', 
      path: '/articles',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
        </svg>
      ) 
    },
    { 
      id: 'forum', 
      label: 'Discussion Forum', 
      path: '/forum',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      ) 
    },
    { 
      id: 'profile', 
      label: 'My Profile', 
      path: '/profile',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      ) 
    }
    ];
  } else {
    menuItems = [
      { 
        id: 'dashboard', 
        label: 'Dashboard', 
        path: '/dashboard',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        )
      },
      { 
        id: 'consultations', 
        label: 'My Consultations', 
        path: '/consultations',
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
        id: 'messages', 
        label: 'My Messages', 
        path: '/messages',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
          </svg>
        ) 
      },
      { 
        id: 'calls', 
        label: 'My Calls', 
        path: '/calls',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
          </svg>
        ) 
      },
      { 
        id: 'prescription', 
        label: 'My Prescription', 
        path: '/prescriptions',
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
        path: '/appointments',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        ) 
      },
      { 
        id: 'articles', 
        label: 'Health Articles', 
        path: '/articles',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
        ) 
      },
      { 
        id: 'forum', 
        label: 'Discussion Forum', 
        path: '/forum',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        ) 
      },
      { 
        id: 'profile', 
        label: 'My Profile', 
        path: '/profile',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        ) 
      }
    ];
  }

  return (
    <aside className={`w-[280px] bg-white border-r border-slate-100 flex flex-col justify-between fixed top-0 left-0 h-full z-50 transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex flex-col overflow-y-auto">
        <div className="p-8 pb-4 flex items-center justify-between">
          <div className="cursor-pointer" onClick={() => { navigate('/dashboard'); onClose(); }}>
            <img src={logoImg} alt="Third Pole" className="h-8 w-auto" />
          </div>
          <button 
            onClick={onClose}
            className="lg:hidden p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-all"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <nav className="px-4 flex flex-col gap-1 mt-4">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button 
                key={item.id} 
                onClick={() => { 
                  if (!item.path.startsWith('#')) {
                    navigate(item.path);
                    onClose(); 
                  }
                }} 
                className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${isActive ? 'bg-blue-50 text-blue-700 shadow-sm shadow-blue-100/50' : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600'}`}
              >
                <span className={`transition-opacity ${isActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}>{item.icon}</span>
                <span className={isActive ? 'font-bold' : ''}>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="px-4 flex flex-col gap-4">
        <div className="pt-6 border-t border-slate-100">
          <div 
            className="flex items-center gap-3 mb-6 px-2 cursor-pointer group/profile hover:bg-slate-50 p-2 rounded-2xl transition-all"
            onClick={() => { navigate('/profile'); onClose(); }}
          >
            <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-lg shadow-blue-200 transition-transform group-hover/profile:scale-110 overflow-hidden">
              {userData.profile?.avatar ? (
                <img 
                  src={userData.profile.avatar.startsWith('http') || userData.profile.avatar.startsWith('data:') ? userData.profile.avatar : `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}${userData.profile.avatar}`} 
                  alt="Avatar" 
                  className="w-full h-full object-cover" 
                />
              ) : (
                userData.avatar || userData.name?.charAt(0)
              )}
            </div>
            <div className="flex flex-col">
              <div className="text-sm font-bold text-slate-900 leading-tight group-hover/profile:text-blue-600 transition-colors">{userData.name}</div>
              <div className="text-[11px] text-slate-400 font-medium tracking-wide flex items-center gap-1">
                View Profile
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </div>
            </div>
          </div>
          <button className="flex items-center gap-4 px-4 py-3 w-full rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all group" onClick={onLogout}>
            <span className="opacity-70 group-hover:opacity-100 transition-opacity">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </span>
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
