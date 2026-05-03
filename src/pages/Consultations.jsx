import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
const Consultations = ({ onLogout }) => {
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || {});

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
  const apiVersion = import.meta.env.VITE_API_VERSION || 'v1';

  const fetchConsultations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${apiUrl}/api/${apiVersion}/consultations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setConsultations(data.consultations);
      }
    } catch (error) {
      console.error('Error fetching consultations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultations();
  }, []);

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
        fetchConsultations(); // Refresh list
      }
    } catch (err) {
      console.error('Error responding to consultation:', err);
    }
  };

  const isDoctor = user.role === 'doctor';

  const getStatusClasses = (status) => {
    switch (status) {
      case 'active': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'completed': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'cancelled': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <main className="flex-1 ml-[280px] py-12 px-16 max-h-screen overflow-y-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">My Consultations</h1>
        <p className="text-slate-500 text-sm font-medium">
          {isDoctor 
            ? 'Manage your patient consultations and incoming requests.' 
            : 'View and manage your medical consultation history.'}
        </p>
      </header>

      <section className="consultations-container">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-slate-400 font-bold text-sm animate-pulse">Fetching your records...</p>
          </div>
        ) : consultations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {consultations.map((c) => (
              <div key={c._id} className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-bold text-lg group-hover:bg-blue-600 group-hover:text-white transition-colors uppercase">
                      {isDoctor ? c.patient?.name?.charAt(0) : c.doctor?.name?.charAt(0) || 'D'}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-tight mb-0.5">{isDoctor ? c.patient?.name : `Dr. ${c.doctor?.name || 'Unknown'}`}</h3>
                      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                        {!isDoctor ? (c.doctor?.doctorDetails?.speciality || 'Specialist') : 'Patient'}
                      </p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusClasses(c.status)}`}>
                    {c.status}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 py-5 border-y border-slate-50 mb-6 bg-slate-50/30 -mx-6 px-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Started</span>
                    <span className="text-[11px] font-bold text-slate-700">
                      {c.consultationStart ? new Date(c.consultationStart).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Expires</span>
                    <span className="text-[11px] font-bold text-slate-700">
                      {c.consultationEnd ? new Date(c.consultationEnd).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Fee</span>
                    <span className="text-[11px] font-bold text-slate-900">Rs. {c.amount || '0'}</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-auto">
                  {isDoctor && c.status === 'pending' ? (
                    <>
                      <button className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all" onClick={() => handleRespond(c._id, 'active')}>Accept</button>
                      <button className="flex-1 py-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-all" onClick={() => handleRespond(c._id, 'cancelled')}>Reject</button>
                    </>
                  ) : (
                    <>
                      <button 
                        className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${c.status === 'pending' ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white shadow-lg shadow-blue-100 hover:bg-blue-700'}`}
                        disabled={c.status === 'pending'}
                        onClick={() => navigate(`/chat/${c._id}`)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                        Open Chat
                      </button>
                      <button 
                        className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all border ${c.status === 'pending' ? 'bg-slate-50 text-slate-200 border-slate-100' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                        disabled={c.status === 'pending'}
                      >
                        View RX
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-[40px] border border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 text-slate-200">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight">No consultations yet</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto mb-8 font-medium">Your history will appear here once you {isDoctor ? 'receive requests' : 'start a session'} with a {isDoctor ? 'patient' : 'specialist'}.</p>
            {!isDoctor && (
              <button 
                className="px-8 py-3.5 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-100 hover:bg-blue-700 hover:-translate-y-0.5 transition-all flex items-center gap-2" 
                onClick={() => navigate('/dashboard')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                Book Your First Session
              </button>
            )}
          </div>
        )}
      </section>
    </main>
  );
};

export default Consultations;
