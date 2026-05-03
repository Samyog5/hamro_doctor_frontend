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

  if (loading) {
    return <div className="loading-state">Loading...</div>;
  }

  return (
    <main className="flex-1 ml-[280px] py-12 px-16 max-h-screen overflow-y-auto">
      <header className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            Good morning, {userData?.doctorDetails?.salutation} {userData?.name?.split(' ')[0]}
            <span className="text-2xl animate-bounce-slow">☀️</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Manage your patients and clinical activities</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-2xl border border-slate-100 shadow-sm">
            <span className={`text-xs font-bold uppercase tracking-wider ${isOnline ? 'text-emerald-500' : 'text-slate-400'}`}>
              {isOnline ? 'Available' : 'Unavailable'}
            </span>
            <button 
              onClick={toggleStatus}
              className={`w-12 h-6 rounded-full relative transition-all duration-300 ${isOnline ? 'bg-emerald-500' : 'bg-slate-200'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${isOnline ? 'left-7' : 'left-1'}`}></div>
            </button>
          </div>
          <button className="relative p-3 bg-white text-slate-400 hover:text-blue-600 rounded-2xl border border-slate-100 shadow-sm transition-all hover:scale-105">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            {pendingRequests.length > 0 && (
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
            )}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10">
        {/* Middle Column */}
        <div className="space-y-10">
          {/* Stats Hero Card */}
          <section className="bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-700 p-10 rounded-[48px] shadow-2xl shadow-blue-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 transition-transform duration-1000 group-hover:scale-150"></div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-xs font-bold mb-8">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M12 19V5M5 12l7-7 7 7"/>
                </svg>
                <span>Rs. {stats.netEarnings} <small className="opacity-70 ml-1">NET REVENUE</small></span>
              </div>

              <h2 className="text-4xl font-black text-white mb-3 tracking-tight">Practice Performance</h2>
              <p className="text-blue-100 font-medium mb-10 max-w-md">You've reached {stats.noOfConsultations} consultations this month. Great progress!</p>

              <div className="grid grid-cols-3 gap-8 bg-black/10 backdrop-blur-sm p-8 rounded-[32px] border border-white/10">
                  <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">Sessions</span>
                      <div className="text-3xl font-black text-white">{stats.noOfConsultations}</div>
                  </div>
                  <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">Growth</span>
                      <div className="text-3xl font-black text-white">{stats.recommendations}</div>
                  </div>
                  <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">Articles</span>
                      <div className="text-3xl font-black text-white">{stats.articlesPublished}</div>
                  </div>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-3 bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
              <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center text-slate-900 text-lg">💡</div>
              <span className="text-white text-xs font-medium"><strong>Strategy:</strong> Publish more health tips to increase your consultation requests.</span>
            </div>
          </section>

          {/* New Requests Section */}
          {pendingRequests.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  Incoming Requests
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-600 rounded-lg text-[10px] font-black uppercase">{pendingRequests.length} New</span>
                </h3>
              </div>
              <div className="space-y-4">
                {pendingRequests.map(req => (
                  <div key={req._id} className="bg-white border-2 border-slate-50 rounded-[32px] p-6 flex items-center justify-between hover:shadow-xl hover:shadow-slate-200/50 transition-all group animate-in slide-in-from-left duration-500">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center font-bold text-xl group-hover:scale-105 transition-transform">
                        {req.patient?.name?.charAt(0) || 'P'}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-base">{req.patient?.name}</h4>
                        <p className="text-xs text-slate-400 font-medium">Requested {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button 
                        className="px-6 py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-600 hover:-translate-y-0.5 transition-all" 
                        onClick={() => handleRespond(req._id, 'active')}
                      >
                        Accept
                      </button>
                      <button 
                        className="px-6 py-2.5 bg-slate-50 text-slate-400 rounded-xl text-xs font-bold hover:bg-red-50 hover:text-red-500 transition-all" 
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
              <h3 className="text-xl font-bold text-slate-900">Ongoing Sessions</h3>
              <button className="text-blue-600 text-xs font-bold hover:underline">View All Activities</button>
            </div>
            <div className="space-y-4">
                {activeConsultations.length > 0 ? activeConsultations.map(consult => (
                  <div key={consult._id} className="bg-white border border-slate-100 rounded-[32px] p-6 flex items-center justify-between hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-bold text-xl uppercase">
                        {consult.patient?.name?.charAt(0) || 'P'}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-base">{consult.patient?.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                          <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Live Session</p>
                        </div>
                      </div>
                    </div>
                    <button className="px-8 py-3 bg-blue-600 text-white rounded-2xl text-xs font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 hover:-translate-y-0.5 transition-all" onClick={() => navigate(`/chat/${consult._id}`)}>Resume Session</button>
                  </div>
                )) : (
                  <div className="flex flex-col items-center justify-center py-16 bg-slate-50/50 rounded-[40px] border border-dashed border-slate-200 text-center">
                    <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mb-4 text-slate-300 shadow-sm">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    </div>
                    <p className="text-slate-400 font-bold text-sm">No active sessions right now.</p>
                  </div>
                )}
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="space-y-10">
          {/* Monthly Activities */}
          <section className="bg-white border border-slate-100 rounded-[40px] p-8 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-8 text-center">Analytics</h3>
            <div className="space-y-6">
                <div className="flex items-center gap-4 group">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-xl transition-transform group-hover:scale-110">👁️</div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Article Views</span>
                        <span className="text-xl font-black text-slate-900">{stats.articleViews}</span>
                    </div>
                </div>
                <div className="flex items-center gap-4 group">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-xl transition-transform group-hover:scale-110">📈</div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Profile Rank</span>
                        <span className="text-xl font-black text-slate-900">{stats.totalPageViews}</span>
                    </div>
                </div>
            </div>
          </section>

          {/* Quick Actions */}
          <section className="bg-white border border-slate-100 rounded-[40px] p-8 shadow-sm overflow-hidden">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-8 text-center">Tools</h3>
            <div className="space-y-2">
              <button className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-blue-50 rounded-2xl transition-all group">
                <div className="flex items-center gap-4">
                  <span className="text-xl grayscale group-hover:grayscale-0 transition-all">🏥</span>
                  <span className="text-xs font-bold text-slate-600 group-hover:text-blue-700">Hospitals & OPD</span>
                </div>
                <svg className="text-slate-300 group-hover:translate-x-1 transition-all" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M9 18l6-6-6-6"/></svg>
              </button>
              <button className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-emerald-50 rounded-2xl transition-all group">
                <div className="flex items-center gap-4">
                  <span className="text-xl grayscale group-hover:grayscale-0 transition-all">✍️</span>
                  <span className="text-xs font-bold text-slate-600 group-hover:text-emerald-700">Publish Article</span>
                </div>
                <svg className="text-slate-300 group-hover:translate-x-1 transition-all" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M9 18l6-6-6-6"/></svg>
              </button>
              <button className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-amber-50 rounded-2xl transition-all group">
                <div className="flex items-center gap-4">
                  <span className="text-xl grayscale group-hover:grayscale-0 transition-all">📂</span>
                  <span className="text-xs font-bold text-slate-600 group-hover:text-amber-700">RX Templates</span>
                </div>
                <svg className="text-slate-300 group-hover:translate-x-1 transition-all" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            </div>
          </section>

          {/* Boost Profile */}
          <section className="bg-indigo-900 p-8 rounded-[40px] shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16"></div>
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2 relative z-10">
              Boost Rank
              <span className="text-yellow-400">✨</span>
            </h3>
            <p className="text-indigo-200 text-xs font-medium mb-8 leading-relaxed relative z-10">Complete your medical background to appear higher in patient searches.</p>
            <button className="w-full py-4 bg-white text-indigo-900 rounded-2xl font-bold text-xs shadow-lg hover:-translate-y-0.5 transition-all relative z-10">Update Profile</button>
          </section>
        </div>
      </div>
    </main>
  );
}

export default DoctorDashboard;
