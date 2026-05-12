import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminOnboard = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'doctor'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
  const apiVersion = import.meta.env.VITE_API_VERSION || 'v1';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch(`${apiUrl}/api/${apiVersion}/admin/onboard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        setSuccess(true);
        setFormData({ name: '', email: '', phone: '', password: '', role: 'doctor' });
      } else {
        setError(data.message || 'Onboarding failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-2xl mx-auto space-y-8 animate-in slide-in-from-bottom-8 duration-500">
      <div>
        <button 
          onClick={() => navigate('/admin-dashboard')}
          className="text-slate-400 hover:text-blue-600 font-bold text-sm flex items-center gap-2 mb-4 group"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="group-hover:-translate-x-1 transition-transform"><polyline points="15 18 9 12 15 6"></polyline></svg>
          Back to Dashboard
        </button>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Onboard New Account</h1>
        <p className="text-slate-500 font-medium">Directly register medical staff or institutional users.</p>
      </div>

      <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold mb-6 flex items-center gap-3">
             <span className="w-6 h-6 bg-red-100 flex items-center justify-center rounded-full">!</span>
             {error}
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl text-xs font-bold mb-6 flex items-center gap-3 animate-bounce">
             <span className="w-6 h-6 bg-emerald-100 flex items-center justify-center rounded-full">✓</span>
             User onboarded successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Account Role</label>
            <select 
              className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-100 transition-all appearance-none cursor-pointer"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="doctor">Medical Doctor</option>
              <option value="hospital">Hospital / Institution</option>
              <option value="nurse">Nursing Staff</option>
              <option value="patient">Standard Patient</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Full Identity</label>
            <input 
              type="text"
              placeholder="Name of Person or Institution"
              className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-medium text-slate-700 outline-none focus:ring-4 focus:ring-blue-100 transition-all"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <input 
                type="email"
                placeholder="example@doctor.com"
                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-medium text-slate-700 outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
              <input 
                type="tel"
                placeholder="98XXXXXXXX"
                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-medium text-slate-700 outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">System Password</label>
            <input 
              type="password"
              placeholder="Min. 6 characters"
              className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-medium text-slate-700 outline-none focus:ring-4 focus:ring-blue-100 transition-all"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 hover:-translate-y-0.5 transition-all mt-4 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Confirm Registration'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminOnboard;
