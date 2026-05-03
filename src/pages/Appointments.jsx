import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';
import '../styles/Appointments.css';

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'status-confirmed';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  };

  return (
    <main className="dashboard-content">
      <header className="main-header">
        <div className="header-left">
          <h1 className="greeting">My Appointments</h1>
          <p className="sub-headline">Manage your physical hospital visits and OPD bookings.</p>
        </div>
      </header>

      <section className="appointments-container">
        {loading ? (
          <div className="loading-state">Loading your schedule...</div>
        ) : appointments.length > 0 ? (
          <div className="appointments-grid">
            {appointments.map((apt) => (
              <div key={apt._id} className="apt-card">
                <div className="apt-header">
                  <div className="apt-date-badge">
                    <span className="apt-day">{new Date(apt.appointmentDate).getDate()}</span>
                    <span className="apt-month">
                      {new Date(apt.appointmentDate).toLocaleString('default', { month: 'short' })}
                    </span>
                  </div>
                  <div className="apt-meta">
                    <div className={`apt-status-pill ${getStatusColor(apt.status)}`}>
                      {apt.status}
                    </div>
                    <div className="apt-time">{apt.timeSlot}</div>
                  </div>
                </div>

                <div className="apt-body">
                  <div className="apt-doc-info">
                    <div className="apt-avatar">{apt.doctor?.name.charAt(0)}</div>
                    <div>
                      <h4 className="apt-doc-name">Dr. {apt.doctor?.name}</h4>
                      <p className="apt-doc-spec">{apt.doctor?.doctorDetails?.specialization || 'Specialist'}</p>
                    </div>
                  </div>

                  <div className="apt-location">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    <span>{apt.hospital?.name || 'Hospital'}</span>
                  </div>
                </div>

                <div className="apt-footer">
                  <div className="apt-payment-info">
                    <span className={`payment-tag ${apt.paymentStatus}`}>
                      {apt.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                    </span>
                    <span className="apt-amount">Rs. {apt.amount}</span>
                  </div>
                  <button className="apt-details-btn">
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state-card">
            <div className="empty-icon-box">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <h3>No appointments booked</h3>
            <p>You don't have any upcoming or past physical appointments.</p>
            <button className="btn-primary" onClick={() => navigate('/dashboard')}>Find a Hospital</button>
          </div>
        )}
      </section>
    </main>
  );
};

export default Appointments;
