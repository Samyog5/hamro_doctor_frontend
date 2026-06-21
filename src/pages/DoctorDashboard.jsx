import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/DoctorDashboard.css';

function DoctorDashboard() {
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
    <main className="flex-1 lg:ml-[280px] bg-clinical-surface-main text-clinical-on-surface min-h-screen pb-12">
      {/* Top App Bar */}
      <header className="w-full flex justify-between items-center px-8 pt-8 pb-6 bg-transparent">
        <div>
          <h2 className="text-2xl font-bold text-clinical-primary">
            {greeting}, {userData?.doctorDetails?.salutation || 'Dr.'} {userData?.name?.split(' ')[0]}
          </h2>
          <p className="text-sm font-medium text-clinical-on-surface-variant">Clinical Command Center</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Status Toggle */}
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full border border-clinical-outline-variant shadow-sm">
            <span 
              className={`text-xs font-semibold uppercase tracking-wider ${
                isOnline ? 'text-clinical-status-online' : 'text-clinical-status-offline'
              }`}
            >
              {isOnline ? 'Online' : 'Offline'}
            </span>
            <button 
              onClick={toggleStatus}
              className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${
                isOnline ? 'bg-clinical-status-online' : 'bg-slate-200'
              }`}
            >
              <div 
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 transform ${
                  isOnline ? 'translate-x-6' : 'translate-x-1'
                }`}
              ></div>
            </button>
          </div>

          {/* Notifications */}
          <button className="relative w-12 h-12 flex items-center justify-center rounded-full bg-white border border-clinical-outline-variant hover:bg-clinical-surface-container transition-all">
            <span className="material-symbols-outlined text-clinical-primary">notifications</span>
            {pendingRequests.length > 0 && (
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-clinical-destructive border-2 border-white rounded-full animate-ping"></span>
            )}
          </button>
        </div>
      </header>

      {/* Dashboard Canvas */}
      <div className="px-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-clinical-destructive rounded-2xl text-sm font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-12 gap-6">
          {/* Left Column: Hero, New Requests & Sessions */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            
            {/* Hero Section: Practice Insights */}
            <section className="hero-gradient rounded-[32px] p-12 text-white relative overflow-hidden custom-shadow min-h-[400px] flex flex-col justify-between">
              {/* Background Decorative Element */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
              
              <div>
                <div className="inline-flex items-center px-4 py-2 bg-white/10 rounded-full mb-6 backdrop-blur-md border border-white/20">
                  <span className="material-symbols-outlined text-white mr-2 text-sm">payments</span>
                  <span className="text-sm font-semibold tracking-wider uppercase">
                    Earnings: Rs. {stats.netEarnings.toLocaleString()}
                  </span>
                </div>
                <h3 className="text-3xl font-bold mb-2 text-white">Practice Insights</h3>
                <p className="text-base text-white/70">
                  You've reached <span className="text-white font-bold">{stats.noOfConsultations}</span> consultation{stats.noOfConsultations !== 1 ? 's' : ''} this month.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/20 transition-all cursor-default">
                  <p className="text-xs font-semibold tracking-wider text-white/60 uppercase mb-1">Sessions</p>
                  <p className="text-3xl font-bold">{stats.noOfConsultations}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/20 transition-all cursor-default">
                  <p className="text-xs font-semibold tracking-wider text-white/60 uppercase mb-1">Growth</p>
                  <p className="text-3xl font-bold">{stats.recommendations}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/20 transition-all cursor-default">
                  <p className="text-xs font-semibold tracking-wider text-white/60 uppercase mb-1">Articles</p>
                  <p className="text-3xl font-bold">{stats.articlesPublished}</p>
                </div>
              </div>

              <div className="mt-6 flex items-center p-6 bg-white/5 rounded-2xl border border-white/5">
                <div className="w-10 h-10 rounded-full bg-clinical-secondary-container/30 flex items-center justify-center mr-6">
                  <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                    lightbulb
                  </span>
                </div>
                <p className="text-sm text-white/80">Publish health tips to grow your reach and impact.</p>
              </div>
            </section>

            {/* New Requests Section */}
            {pendingRequests.length > 0 && (
              <section className="animate-in fade-in slide-in-from-bottom duration-500 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xl font-bold text-clinical-primary flex items-center gap-2">
                    New Requests
                    <span className="px-2.5 py-0.5 bg-amber-500 text-white rounded-full text-xs font-bold shadow-md">
                      {pendingRequests.length}
                    </span>
                  </h4>
                </div>
                <div className="flex flex-col gap-4">
                  {pendingRequests.map(req => (
                    <div 
                      key={req._id} 
                      className="bg-white border border-clinical-outline-variant/30 rounded-[24px] p-6 flex items-center justify-between hover:shadow-lg hover:shadow-slate-200/50 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center font-bold text-xl group-hover:scale-105 transition-transform overflow-hidden shadow-inner border border-slate-100">
                          {req.patient?.profile?.avatar ? (
                            <img 
                              src={
                                req.patient.profile.avatar.startsWith('http') || req.patient.profile.avatar.startsWith('data:') 
                                  ? req.patient.profile.avatar 
                                  : `${apiUrl}${req.patient.profile.avatar}`
                              } 
                              alt={req.patient.name} 
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            req.patient?.name?.charAt(0) || 'P'
                          )}
                        </div>
                        <div>
                          <h5 className="font-bold text-clinical-primary text-sm mb-1">{req.patient?.name}</h5>
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-slate-400 text-sm">schedule</span>
                            <p className="text-xs text-slate-400 font-medium">
                              Requested at {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button 
                          className="px-6 py-2.5 bg-clinical-secondary text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 hover:-translate-y-0.5 transition-all" 
                          onClick={() => handleRespond(req._id, 'active')}
                        >
                          Accept
                        </button>
                        <button 
                          className="px-6 py-2.5 bg-slate-50 text-slate-400 rounded-xl text-xs font-bold hover:bg-red-50 hover:text-clinical-destructive transition-all border border-slate-100" 
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

            {/* Ongoing Sessions */}
            <section className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-xl font-bold text-clinical-primary">Ongoing Sessions</h4>
                <button 
                  onClick={() => navigate('/consultations')}
                  className="text-clinical-secondary font-bold hover:underline flex items-center space-x-1"
                >
                  <span className="text-sm">View history</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>

              {activeConsultations.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {activeConsultations.map(consult => (
                    <div 
                      key={consult._id} 
                      className="bg-white border border-clinical-outline-variant/30 rounded-[24px] p-6 flex items-center justify-between hover:shadow-lg hover:shadow-slate-200/50 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-clinical-surface-container-low text-clinical-secondary rounded-2xl flex items-center justify-center font-bold text-xl overflow-hidden shadow-inner border border-clinical-surface-container-low">
                          {consult.patient?.profile?.avatar ? (
                            <img 
                              src={
                                consult.patient.profile.avatar.startsWith('http') || consult.patient.profile.avatar.startsWith('data:') 
                                  ? consult.patient.profile.avatar 
                                  : `${apiUrl}${consult.patient.profile.avatar}`
                              } 
                              alt={consult.patient.name} 
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            consult.patient?.name?.charAt(0) || 'P'
                          )}
                        </div>
                        <div>
                          <h5 className="font-bold text-clinical-primary text-sm mb-1">{consult.patient?.name}</h5>
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 bg-clinical-status-online rounded-full animate-ping"></span>
                            <p className="text-xs text-clinical-status-online font-bold">Active</p>
                          </div>
                        </div>
                      </div>
                      <button 
                        className="px-8 py-3 bg-clinical-primary text-white rounded-xl text-xs font-bold shadow-lg shadow-slate-200 hover:-translate-y-0.5 transition-all" 
                        onClick={() => navigate(`/messages/${consult._id}`)}
                      >
                        Resume Session
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                /* Empty State Session Placeholder */
                <div className="bg-white rounded-3xl p-12 border border-clinical-outline-variant/30 flex flex-col items-center justify-center text-center space-y-6 custom-shadow min-h-[250px]">
                  <div className="w-20 h-20 rounded-full bg-clinical-surface-container-low flex items-center justify-center">
                    <span className="material-symbols-outlined text-clinical-primary text-4xl opacity-20">videocam_off</span>
                  </div>
                  <div>
                    <h5 className="text-xl font-bold text-clinical-primary">No Active Sessions</h5>
                    <p className="text-sm text-clinical-on-surface-variant max-w-xs mx-auto mt-2">
                      You have no ongoing consultations at the moment. Your upcoming appointments will appear here.
                    </p>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Right Column: Analytics, Tools & Boost rank */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            
            {/* Analytics Section */}
            <section className="bg-white rounded-[32px] p-8 border border-clinical-outline-variant/30 custom-shadow">
              <p className="text-xs font-bold tracking-widest text-clinical-on-surface-variant/50 uppercase mb-6">Analytics</p>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-clinical-status-online/10 flex items-center justify-center text-clinical-status-online">
                      <span className="material-symbols-outlined">visibility</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold tracking-wider text-clinical-on-surface-variant uppercase">Article Views</p>
                      <p className="text-2xl font-bold text-clinical-primary mt-0.5">{stats.articleViews.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="w-16 h-10 rounded-lg bg-clinical-surface-container-low flex items-center justify-center">
                    <span className="material-symbols-outlined text-clinical-on-surface-variant/30">trending_flat</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-clinical-secondary/10 flex items-center justify-center text-clinical-secondary">
                      <span className="material-symbols-outlined">analytics</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold tracking-wider text-clinical-on-surface-variant uppercase">Profile Reach</p>
                      <p className="text-2xl font-bold text-clinical-primary mt-0.5">{stats.totalPageViews.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="w-16 h-10 rounded-lg bg-clinical-surface-container-low flex items-center justify-center">
                    <span className="material-symbols-outlined text-clinical-on-surface-variant/30">trending_flat</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Clinical Tools Section */}
            <section className="bg-white rounded-[32px] p-8 border border-clinical-outline-variant/30 custom-shadow">
              <p className="text-xs font-bold tracking-widest text-clinical-on-surface-variant/50 uppercase mb-6">Clinical Tools</p>
              
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-4 bg-clinical-surface-main hover:bg-clinical-surface-container rounded-2xl transition-all group border border-transparent hover:border-clinical-secondary/20">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white border border-clinical-outline-variant/30 flex items-center justify-center text-clinical-primary group-hover:bg-clinical-primary group-hover:text-white transition-all shadow-sm">
                      <span className="material-symbols-outlined text-lg">apartment</span>
                    </div>
                    <span className="text-sm font-bold text-clinical-primary">Hospitals</span>
                  </div>
                  <span className="material-symbols-outlined text-clinical-on-surface-variant/40 group-hover:translate-x-1 transition-transform">
                    chevron_right
                  </span>
                </button>

                <button 
                  onClick={() => navigate('/articles')}
                  className="w-full flex items-center justify-between p-4 bg-clinical-surface-main hover:bg-clinical-surface-container rounded-2xl transition-all group border border-transparent hover:border-clinical-secondary/20"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white border border-clinical-outline-variant/30 flex items-center justify-center text-clinical-primary group-hover:bg-clinical-primary group-hover:text-white transition-all shadow-sm">
                      <span className="material-symbols-outlined text-lg">edit_note</span>
                    </div>
                    <span className="text-sm font-bold text-clinical-primary">Publish Article</span>
                  </div>
                  <span className="material-symbols-outlined text-clinical-on-surface-variant/40 group-hover:translate-x-1 transition-transform">
                    chevron_right
                  </span>
                </button>
              </div>
            </section>

            {/* Profile Growth Banner */}
            <div className="relative overflow-hidden rounded-[32px] bg-clinical-secondary p-8 text-white custom-shadow">
              <div className="relative z-10">
                <h5 className="text-xl font-bold mb-1 text-white">Boost Your Visibility</h5>
                <p className="text-xs text-white/80 mb-6 font-medium leading-relaxed">
                  Complete your profile to appear higher in search results for patients.
                </p>
                <button 
                  onClick={() => navigate('/profile')}
                  className="px-6 py-2.5 bg-white text-clinical-secondary rounded-full font-bold text-xs hover:bg-clinical-surface-container transition-all"
                >
                  Complete Profile
                </button>
              </div>
              <div className="absolute -right-8 -bottom-8 opacity-10">
                <span className="material-symbols-outlined text-[120px]">verified</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}

export default DoctorDashboard;
