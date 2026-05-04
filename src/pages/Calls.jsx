import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
const Calls = () => {
  const navigate = useNavigate();
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  useEffect(() => {
    const fetchCalls = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/consultations`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        
        if (data.success) {
          // Flatten all sessions from all consultations into a single calls list
          const allCalls = [];
          
          let user = null;
          try {
            user = JSON.parse(localStorage.getItem('user'));
          } catch (e) {
            console.error('Error parsing user data:', e);
          }
          
          const isDoctor = user?.role === 'doctor';
          
          if (Array.isArray(data.consultations)) {
            data.consultations.forEach(con => {
              // Determine who to show based on the current user's role
              const displayInfo = isDoctor ? {
                name: con.patient?.name || 'Unknown Patient',
                avatar: con.patient?.name?.charAt(0) || 'P',
                photo: con.patient?.profile?.avatar,
                subtext: 'Patient',
                role: 'Patient'
              } : {
                name: `Dr. ${con.doctor?.name || 'Unknown Doctor'}`,
                avatar: con.doctor?.name?.charAt(0) || 'D',
                photo: con.doctor?.profile?.avatar,
                subtext: con.doctor?.doctorDetails?.speciality || 'General Physician',
                role: 'Doctor'
              };

              if (con.sessions && con.sessions.length > 0) {
                con.sessions.forEach(session => {
                  if (session.type === 'audio' || session.type === 'video') {
                    let durationStr = '--:--';
                    if (session.durationInSeconds !== undefined && session.durationInSeconds !== null) {
                      const mins = Math.floor(session.durationInSeconds / 60);
                      const secs = session.durationInSeconds % 60;
                      durationStr = `${mins}:${secs.toString().padStart(2, '0')}`;
                    } else if (session.startTime && session.endTime) {
                      const start = new Date(session.startTime);
                      const end = new Date(session.endTime);
                      const diffSecs = Math.floor((end - start) / 1000);
                      const mins = Math.floor(diffSecs / 60);
                      const secs = diffSecs % 60;
                      durationStr = `${mins}:${secs.toString().padStart(2, '0')}`;
                    } else if (session.durationInMinutes) {
                      durationStr = `${session.durationInMinutes}:00`;
                    } else if (session.duration) {
                      durationStr = typeof session.duration === 'number' ? `${session.duration}:00` : session.duration;
                    }

                    allCalls.push({
                      id: session._id,
                      display: displayInfo,
                      type: session.type === 'video' ? 'Video Call' : 'Audio Call',
                      duration: durationStr,
                      date: new Date(session.startTime || con.consultationStart || con.createdAt).toLocaleDateString(),
                      status: 'Completed'
                    });
                  }
                });
              } else {
                const statusMap = {
                  'active': 'In Progress',
                  'completed': 'Completed',
                  'pending': 'Pending',
                  'cancelled': 'Cancelled'
                };

                const rawStatus = con.status || 'unknown';
                allCalls.push({
                  id: con._id,
                  display: displayInfo,
                  type: 'Consultation',
                  duration: con.status === 'active' ? 'Live' : '--:--',
                  date: new Date(con.consultationStart || con.createdAt).toLocaleDateString(),
                  status: statusMap[rawStatus] || (rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1))
                });
              }
            });
          }
          
          // Sort by date descending
          allCalls.sort((a, b) => new Date(b.date) - new Date(a.date));
          setCalls(allCalls);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching calls:', error);
        setLoading(false);
      }
    };

    fetchCalls();
  }, []);

  return (
    <main className="flex-1 lg:ml-[280px] py-12 px-4 lg:px-16 max-h-screen overflow-y-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Call Logs</h1>
        <p className="text-slate-500 text-sm font-medium">History of your audio and video consultations.</p>
      </header>

      <section className="calls-container">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-slate-400 font-bold text-sm animate-pulse">Retrieving call history...</p>
          </div>
        ) : calls.length > 0 ? (
          <div className="bg-white rounded-[32px] lg:rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
            {/* Desktop Headers */}
            <div className="hidden lg:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_40px] p-6 bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
              <div>Consultant</div>
              <div>Type</div>
              <div>Duration</div>
              <div>Date</div>
              <div>Status</div>
              <div></div>
            </div>

            {calls.map((call) => {
              const isExpanded = expandedId === call.id;
              return (
                <div key={call.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/30 transition-all group">
                  {/* Desktop Row */}
                  <div className="hidden lg:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_40px] p-6 items-center">
                    <div>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold text-base group-hover:scale-110 transition-transform uppercase overflow-hidden">
                          {call.display.photo ? (
                            <img src={call.display.photo} alt={call.display.name} className="w-full h-full object-cover" />
                          ) : (
                            call.display.avatar
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 mb-0.5">{call.display.name}</div>
                          <div className="text-[11px] text-slate-400 font-medium">{call.display.subtext}</div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border ${call.type === 'Video Call' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                        {call.type === 'Video Call' ? (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                        ) : (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                        )}
                        {call.type}
                      </div>
                    </div>
                    <div className="text-sm font-bold text-slate-600">{call.duration}</div>
                    <div className="text-sm font-bold text-slate-600">{call.date}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${call.status === 'Completed' ? 'bg-emerald-500' : 'bg-blue-500 animate-pulse'}`}></span>
                        <span className="text-sm font-bold text-slate-700">{call.status}</span>
                      </div>
                    </div>
                    <div>
                      <button className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                      </button>
                    </div>
                  </div>

                  {/* Mobile Row */}
                  <div className="lg:hidden p-5 flex flex-col gap-4">
                    <div className="flex items-center justify-between" onClick={() => toggleExpand(call.id)}>
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg shadow-blue-100 uppercase overflow-hidden">
                          {call.display.photo ? (
                            <img src={call.display.photo} alt={call.display.name} className="w-full h-full object-cover" />
                          ) : (
                            call.display.avatar
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 leading-tight">{call.display.name}</div>
                          <div className="text-[11px] text-slate-400 font-medium tracking-wide">{call.display.subtext}</div>
                        </div>
                      </div>
                      <button className={`w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-blue-50 text-blue-600' : ''}`}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M6 9l6 6 6-6"/></svg>
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="bg-slate-50/50 rounded-2xl p-4 grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type</span>
                          <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                            {call.type === 'Video Call' ? '🎥' : '📞'} {call.type}
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Duration</span>
                          <span className="text-xs font-bold text-slate-700">{call.duration}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</span>
                          <span className="text-xs font-bold text-slate-700">{call.date}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</span>
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <span className="text-xs font-bold text-emerald-700">{call.status}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-[40px] border border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 text-slate-200">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight">No calls recorded</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto mb-8 font-medium">You haven't had any audio or video consultations yet.</p>
            <button 
              className="px-8 py-3.5 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-100 hover:bg-blue-700 hover:-translate-y-0.5 transition-all" 
              onClick={() => navigate('/dashboard')}
            >
              Start Your First Session
            </button>
          </div>
        )}
      </section>
    </main>
  );
};

export default Calls;
