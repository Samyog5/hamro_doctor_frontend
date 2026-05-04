import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
const Appointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/appointments`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        
        if (data.success) {
          setAppointments(data.appointments);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const getStatusClasses = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'completed': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'cancelled': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-amber-50 text-amber-600 border-amber-100';
    }
  };

  return (
    <main className="flex-1 lg:ml-[280px] py-12 px-4 lg:px-16 max-h-screen overflow-y-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Hospital Visits</h1>
        <p className="text-slate-500 text-sm font-medium">Manage your physical hospital visits and OPD bookings.</p>
      </header>

      <section className="appointments-container">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-slate-400 font-bold text-sm animate-pulse">Checking your schedule...</p>
          </div>
        ) : appointments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {appointments.map((apt) => (
              <div key={apt._id} className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all flex flex-col group">
                <div className="flex justify-between items-start mb-8">
                  <div className="flex flex-col items-center justify-center w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <span className="text-xl font-black leading-none">{new Date(apt.appointmentDate).getDate()}</span>
                    <span className="text-[9px] font-black uppercase tracking-widest mt-0.5">
                      {new Date(apt.appointmentDate).toLocaleString('default', { month: 'short' })}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border mb-1.5 ${getStatusClasses(apt.status)}`}>
                      {apt.status}
                    </div>
                    <div className="text-[11px] font-bold text-slate-400 text-right flex items-center gap-1">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      {apt.timeSlot}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center font-bold text-lg border border-slate-100">
                      {apt.doctor?.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 mb-0.5">Dr. {apt.doctor?.name}</h4>
                      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">{apt.doctor?.doctorDetails?.specialization || 'Specialist'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium bg-slate-50/50 p-3 rounded-xl border border-slate-50">
                    <svg className="text-blue-500" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    <span className="truncate">{apt.hospital?.name || 'Hamro Care Medical Center'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-auto pt-5 border-t border-slate-50">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${apt.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                      {apt.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                    </span>
                    <span className="text-sm font-black text-slate-900 tracking-tight">Rs. {apt.amount}</span>
                  </div>
                  <button className="px-5 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100 transition-all border border-slate-100">
                    Get Slip
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-[40px] border border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 text-slate-200">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight">No appointments found</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto mb-8 font-medium">You don't have any upcoming or past physical appointments booked through the platform.</p>
            <button 
              className="px-8 py-3.5 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-100 hover:bg-blue-700 hover:-translate-y-0.5 transition-all" 
              onClick={() => navigate('/dashboard')}
            >
              Book an Appointment
            </button>
          </div>
        )}
      </section>
    </main>
  );
};

export default Appointments;
