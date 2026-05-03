import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
const DoctorOnboarding = ({ onLogout }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  const [formData, setFormData] = useState({
    nmcNumber: '',
    salutation: 'Dr.',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    website: '',
    experience: '',
    speciality: '',
    qualification: '',
    gender: 'Male'
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setFormData(prev => ({
        ...prev,
        firstName: parsedUser.name?.split(' ')[0] || '',
        lastName: parsedUser.name?.split(' ')[1] || '',
        email: parsedUser.email || '',
        phone: parsedUser.phone || ''
      }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/doctor/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`,
          profile: {
            gender: formData.gender
          },
          doctorDetails: {
            salutation: formData.salutation,
            firstName: formData.firstName,
            lastName: formData.lastName,
            speciality: formData.speciality,
            qualification: formData.qualification,
            nmcNumber: formData.nmcNumber,
            experience: Number(formData.experience),
            website: formData.website
          }
        })
      });

      const data = await response.json();

      if (data.success) {
        // Success - clear local storage and go to login
        if (onLogout) {
          onLogout();
        } else {
          localStorage.clear();
        }
        navigate('/login');
      } else {
        setError(data.message || 'Failed to save details');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-20 px-6 font-['Poppins'] flex items-center justify-center">
      <div className="w-full max-w-2xl bg-white rounded-[48px] p-12 shadow-2xl shadow-slate-200/50 border border-slate-100 animate-in zoom-in-95 duration-500">
        <header className="mb-12">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-[20px] flex items-center justify-center mb-6 shadow-inner">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Professional Onboarding</h1>
          <p className="text-sm text-slate-500 leading-relaxed font-medium">Please complete your medical credentials to begin consulting patients on the platform.</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-10">
          <section className="space-y-6">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Medical Identification</h2>
            
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">NMC / NAMC / NHPC Number *</label>
              <input 
                type="text" 
                name="nmcNumber" 
                placeholder="Enter your registration number" 
                className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl px-5 py-4 text-sm transition-all outline-none font-medium shadow-inner"
                value={formData.nmcNumber} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[140px_1fr_1fr] gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Title</label>
                <select name="salutation" className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl px-5 py-4 text-sm transition-all outline-none font-medium appearance-none" value={formData.salutation} onChange={handleChange}>
                  <option value="Dr.">Dr.</option>
                  <option value="Prof. Dr.">Prof. Dr.</option>
                  <option value="Assoc. Prof. Dr.">Assoc. Prof. Dr.</option>
                  <option value="Asst. Prof. Dr.">Asst. Prof. Dr.</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">First Name</label>
                <input type="text" name="firstName" placeholder="First Name" className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl px-5 py-4 text-sm transition-all outline-none font-medium" value={formData.firstName} onChange={handleChange} required />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Last Name</label>
                <input type="text" name="lastName" placeholder="Last Name" className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl px-5 py-4 text-sm transition-all outline-none font-medium" value={formData.lastName} onChange={handleChange} required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
                <input type="email" name="email" placeholder="Email" className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl px-5 py-4 text-sm transition-all outline-none font-medium" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Phone Number</label>
                <input type="tel" name="phone" placeholder="Phone" className="w-full bg-slate-100 border-2 border-transparent rounded-2xl px-5 py-4 text-sm text-slate-500 font-medium cursor-not-allowed" value={formData.phone} readOnly />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Speciality</label>
                <input type="text" name="speciality" placeholder="e.g. Cardiologist" className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl px-5 py-4 text-sm transition-all outline-none font-medium" value={formData.speciality} onChange={handleChange} required />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Highest Qualification</label>
                <input type="text" name="qualification" placeholder="e.g. MBBS, MD" className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl px-5 py-4 text-sm transition-all outline-none font-medium" value={formData.qualification} onChange={handleChange} required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Years Practiced</label>
                <input type="number" name="experience" placeholder="Years" className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl px-5 py-4 text-sm transition-all outline-none font-medium" value={formData.experience} onChange={handleChange} required />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Gender</label>
                <select name="gender" className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl px-5 py-4 text-sm transition-all outline-none font-medium appearance-none" value={formData.gender} onChange={handleChange}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </section>

          {error && (
            <div className="bg-red-50 text-red-500 text-xs font-bold py-4 px-6 rounded-2xl border border-red-100 animate-shake">
              ⚠️ {error}
            </div>
          )}

          <div className="flex items-center gap-4 pt-4">
            <button type="submit" className="flex-1 py-5 bg-blue-600 text-white rounded-[24px] font-bold shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50" disabled={loading}>
              {loading ? 'Processing...' : 'Complete Registration'}
            </button>
            <button type="button" className="px-8 py-5 text-slate-400 font-bold hover:text-red-500 transition-colors" onClick={onLogout}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DoctorOnboarding;
