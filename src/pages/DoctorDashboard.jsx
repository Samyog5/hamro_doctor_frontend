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
  const [pendingRequests, setPendingRequests] = useState([]);
  const [activeConsultations, setActiveConsultations] = useState([]);
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
  const apiVersion = import.meta.env.VITE_API_VERSION || 'v1';

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
      const statsRes = await fetch(`${apiUrl}/api/${apiVersion}/doctor/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const statsData = await statsRes.json();
      if (statsData.success) setStats(statsData.stats);

      // Fetch pending requests
      const pendingRes = await fetch(`${apiUrl}/api/${apiVersion}/consultations?status=pending`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const pendingData = await pendingRes.json();
      if (pendingData.success) setPendingRequests(pendingData.consultations);

      // Fetch active consultations
      const activeRes = await fetch(`${apiUrl}/api/${apiVersion}/consultations?status=active`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const activeData = await activeRes.json();
      if (activeData.success) setActiveConsultations(activeData.consultations);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
        const user = JSON.parse(localStorage.getItem('user'));
        user.doctorDetails.isOnline = newStatus;
        localStorage.setItem('user', JSON.stringify(user));
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

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
        fetchDashboardData(); // Refresh data
      }
    } catch (err) {
      console.error('Error responding to consultation:', err);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const greeting = getGreeting();

  return (
    <main className="flex-1 lg:ml-[280px] py-12 px-4 lg:px-16 max-h-screen overflow-y-auto">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            {greeting}, {userData?.doctorDetails?.salutation} {userData?.name?.split(' ')[0]}
            {greeting === 'Good evening' ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" className="animate-pulse">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" className="animate-pulse">
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
            )}
          </h1>
          <p className="text-slate-500 text-sm mt-1">Clinical Command Center</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm">
            <span className={`text-[10px] font-bold uppercase tracking-widest ${isOnline ? 'text-emerald-500' : 'text-slate-400'}`}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
            <button 
              onClick={toggleStatus}
              className={`w-10 h-5 rounded-full relative transition-all duration-500 ${isOnline ? 'bg-emerald-500' : 'bg-slate-200'}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-500 ${isOnline ? 'left-5.5' : 'left-0.5'}`}></div>
            </button>
          </div>
          <button className="relative w-11 h-11 bg-white text-slate-500 hover:text-blue-600 rounded-full border border-slate-100 shadow-sm transition-all hover:scale-105 flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            {pendingRequests.length > 0 && (
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full animate-ping"></span>
            )}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
        {/* Middle Column */}
        <div className="flex flex-col gap-8">
          {/* Stats Hero Card */}
          <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-950 p-8 rounded-[32px] shadow-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5"></div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl text-white text-[10px] font-bold uppercase tracking-widest mb-6">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="3">
                  <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
                <span>Earnings: Rs. {stats.netEarnings.toLocaleString()}</span>
              </div>

              <h2 className="text-2xl font-bold text-white mb-1 tracking-tight">Practice Insights</h2>
              <p className="text-blue-200/60 text-sm mb-8 max-w-sm leading-relaxed">You've reached <span className="text-white">{stats.noOfConsultations}</span> consultations this month.</p>

              <div className="grid grid-cols-3 gap-6">
                  <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1 block opacity-80">Sessions</span>
                      <div className="text-3xl font-bold text-white tracking-tight">{stats.noOfConsultations}</div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1 block opacity-80">Growth</span>
                      <div className="text-3xl font-bold text-white tracking-tight">{stats.recommendations}</div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1 block opacity-80">Articles</span>
                      <div className="text-3xl font-bold text-white tracking-tight">{stats.articlesPublished}</div>
                  </div>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-3 bg-blue-500/10 backdrop-blur-md p-5 rounded-2xl border border-blue-500/20">
              <div className="w-9 h-9 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                </svg>
              </div>
              <span className="text-white/80 text-xs font-medium tracking-tight">Publish health tips to grow your reach and impact.</span>
            </div>
          </section>

          {/* New Requests Section */}
          {pendingRequests.length > 0 && (
            <section className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  New Requests
                  <span className="px-2.5 py-0.5 bg-amber-500 text-white rounded-full text-[10px] font-bold shadow-md">{pendingRequests.length}</span>
                </h3>
              </div>
              <div className="flex flex-col gap-4">
                {pendingRequests.map(req => (
                  <div key={req._id} className="bg-white border border-slate-100 rounded-[24px] p-6 flex items-center justify-between hover:shadow-lg hover:shadow-slate-200/50 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center font-bold text-xl group-hover:scale-105 transition-transform overflow-hidden shadow-inner border border-slate-50">
                        {req.patient?.profile?.avatar ? (
                          <img src={req.patient.profile.avatar} alt={req.patient.name} className="w-full h-full object-cover" />
                        ) : (
                          req.patient?.name?.charAt(0) || 'P'
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm mb-1">{req.patient?.name}</h4>
                        <div className="flex items-center gap-1.5">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                          <p className="text-xs text-slate-400 font-medium">Requested at {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button 
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 hover:-translate-y-0.5 transition-all" 
                        onClick={() => handleRespond(req._id, 'active')}
                      >
                        Accept
                      </button>
                      <button 
                        className="px-6 py-2.5 bg-slate-50 text-slate-400 rounded-xl text-xs font-bold hover:bg-red-50 hover:text-red-500 transition-all border border-slate-100" 
                        onClick={() => handleRespond(req._id, 'cancelled')}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Active Consultations */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">Ongoing Sessions</h3>
              <button className="text-blue-600 text-sm font-bold hover:underline">View history</button>
            </div>
            <div className="flex flex-col gap-4">
                {activeConsultations.length > 0 ? activeConsultations.map(consult => (
                  <div key={consult._id} className="bg-white border border-slate-100 rounded-[24px] p-6 flex items-center justify-between hover:shadow-lg hover:shadow-slate-200/50 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-bold text-xl overflow-hidden shadow-inner border border-blue-50">
                        {consult.patient?.profile?.avatar ? (
                          <img src={consult.patient.profile.avatar} alt={consult.patient.name} className="w-full h-full object-cover" />
                        ) : (
                          consult.patient?.name?.charAt(0) || 'P'
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm mb-1">{consult.patient?.name}</h4>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                          <p className="text-xs text-emerald-600 font-bold">Active</p>
                        </div>
                      </div>
                    </div>
                    <button className="px-8 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-lg shadow-slate-200 hover:-translate-y-0.5 transition-all" onClick={() => navigate(`/messages/${consult._id}`)}>Resume Session</button>
                  </div>
                )) : (
                  <div className="flex flex-col items-center justify-center py-16 bg-slate-50/50 rounded-[32px] border border-dashed border-slate-200 text-center">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 text-slate-200 shadow-sm">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    </div>
                    <p className="text-slate-500 font-bold text-sm">No active sessions.</p>
                  </div>
                )}
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          {/* Monthly Activities */}
          <section className="bg-white border border-slate-100 rounded-[24px] p-8 shadow-sm">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8 text-center">Analytics</h3>
            <div className="space-y-8">
                <div className="flex items-center gap-4 group">
                    <div className="w-11 h-11 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm border border-emerald-50">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Article Views</span>
                        <span className="text-2xl font-bold text-slate-900 tracking-tight">{stats.articleViews.toLocaleString()}</span>
                    </div>
                </div>
                <div className="flex items-center gap-4 group">
                    <div className="w-11 h-11 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm border border-blue-50">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Profile Reach</span>
                        <span className="text-2xl font-bold text-slate-900 tracking-tight">{stats.totalPageViews.toLocaleString()}</span>
                    </div>
                </div>
            </div>
          </section>

          {/* Quick Actions */}
          <section className="bg-white border border-slate-100 rounded-[24px] p-8 shadow-sm overflow-hidden">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8 text-center">Clinical Tools</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-blue-50 rounded-2xl transition-all group border border-transparent hover:border-blue-100">
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors shadow-sm">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                  </div>
                  <span className="text-sm font-bold text-slate-600 group-hover:text-blue-700">Hospitals</span>
                </div>
                <svg className="text-slate-300 group-hover:translate-x-1 transition-all" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M9 18l6-6-6-6"/></svg>
              </button>
              <button 
                onClick={() => navigate('/articles')}
                className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-emerald-50 rounded-2xl transition-all group border border-transparent hover:border-emerald-100"
              >
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-emerald-600 transition-colors shadow-sm">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </div>
                  <span className="text-sm font-bold text-slate-600 group-hover:text-emerald-700">Publish Article</span>
                </div>
                <svg className="text-slate-300 group-hover:translate-x-1 transition-all" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M9 18l6-6-6-6"/></svg>
              </button>
              <button className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-amber-50 rounded-2xl transition-all group border border-transparent hover:border-amber-100">
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-amber-600 transition-colors shadow-sm">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                  </div>
                  <span className="text-sm font-bold text-slate-600 group-hover:text-amber-700">Medical Templates</span>
                </div>
                <svg className="text-slate-300 group-hover:translate-x-1 transition-all" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            </div>
          </section>

          {/* Boost Profile */}
          <section className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[24px] shadow-xl relative overflow-hidden group">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2 relative z-10 tracking-tight">
              Boost Rank
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#facc15" strokeWidth="2.5">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </h3>
            <p className="text-blue-100/70 text-xs font-medium mb-6 leading-relaxed relative z-10">Complete your medical profile to reach more patients through search.</p>
            <button 
              onClick={() => navigate('/profile')}
              className="w-full py-3.5 bg-white text-blue-600 rounded-2xl font-bold text-sm shadow-lg hover:-translate-y-1 transition-all relative z-10"
            >
              Optimize Profile
            </button>
          </section>
        </div>
      </div>
    </main>
  );
}

export default DoctorDashboard;
