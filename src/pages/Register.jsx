import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import heroImg from '../assets/hero.webp';
import logoImg from '../assets/logo.png';
import stethImg from '../assets/steth.svg';

function Register({ onLogin }) {
  const navigate = useNavigate();

  // Step 1: Registration form
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'patient',
  });

  // Step 2: OTP verification
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState('');
  const [token, setToken] = useState(''); 
  const [doctorData, setDoctorData] = useState({
    salutation: 'Dr.',
    firstName: '',
    lastName: '',
    website: '',
    experience: '',
    speciality: '',
    qualification: '',
    nmcNumber: '',
    gender: 'Male'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpExpiry, setOtpExpiry] = useState(null);

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return false;
    }
    if (!/^\d{10}$/.test(formData.phone)) {
      setError('Phone number must be 10 digits');
      return false;
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Invalid email format');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (!formData.role) {
      setError('Please select a role');
      return false;
    }
    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const apiVersion = import.meta.env.VITE_API_VERSION || 'v1';
      const response = await fetch(`${apiUrl}/api/${apiVersion}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          username: formData.phone,
          email: formData.email || undefined,
          phone: formData.phone,
          password: formData.password,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setUserId(data.userId);
        setStep(2);
        const expiryTime = new Date(Date.now() + 10 * 60 * 1000);
        setOtpExpiry(expiryTime);
      } else {
        setError(data.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp.trim()) {
      setError('Please enter the OTP');
      return;
    }

    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const apiVersion = import.meta.env.VITE_API_VERSION || 'v1';
      const response = await fetch(`${apiUrl}/api/${apiVersion}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: formData.phone,
          code: otp,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.user.role === 'doctor') {
          setToken(data.token);
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          
          const nameParts = formData.name.split(' ');
          setDoctorData({
            ...doctorData,
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || ''
          });
          
          setStep(3);
        } else {
          if (onLogin) {
            onLogin(data.token, data.user);
          } else {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = '/dashboard';
          }
        }
      } else {
        setError(data.message || 'OTP verification failed. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError('');
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const apiVersion = import.meta.env.VITE_API_VERSION || 'v1';
      await fetch(`${apiUrl}/api/${apiVersion}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          username: formData.phone,
          email: formData.email || undefined,
          phone: formData.phone,
          password: formData.password,
          role: formData.role,
        }),
      });
      const expiryTime = new Date(Date.now() + 10 * 60 * 1000);
      setOtpExpiry(expiryTime);
    } catch (err) {
      setError('Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const apiVersion = import.meta.env.VITE_API_VERSION || 'v1';
      
      const payload = {
        doctorDetails: {
          salutation: doctorData.salutation,
          firstName: doctorData.firstName,
          lastName: doctorData.lastName,
          speciality: doctorData.speciality,
          qualification: doctorData.qualification,
          nmcNumber: doctorData.nmcNumber,
          experience: Number(doctorData.experience),
          website: doctorData.website
        },
        profile: { gender: doctorData.gender }
      };

      const response = await fetch(`${apiUrl}/api/${apiVersion}/doctor/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        localStorage.clear();
        navigate('/login');
      } else {
        setError('Failed to save doctor details');
      }
    } catch (err) {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToRegister = () => {
    setStep(1);
    setOtp('');
    setError('');
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0D47A1] to-[#1976D2] flex items-center justify-center p-4 lg:p-0 font-['Poppins'] relative overflow-hidden">
      {/* Defined Floating Bubbles - Less Blur, More Shape */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[5%] w-64 h-64 bg-white/10 rounded-full blur-[20px] border border-white/20 animate-float-bubble-1"></div>
        <div className="absolute bottom-[5%] right-[5%] w-96 h-96 bg-blue-400/20 rounded-full blur-[30px] border border-white/10 animate-float-bubble-2"></div>
        <div className="absolute top-[45%] right-[15%] w-48 h-48 bg-white/10 rounded-full blur-[15px] border border-white/20 animate-float-bubble-3"></div>
        <div className="absolute bottom-[25%] left-[15%] w-40 h-40 bg-sky-300/20 rounded-full blur-[10px] border border-white/10 animate-float-bubble-1" style={{ animationDelay: '-12s' }}></div>
        
        {/* Extra small distinct bubbles for 'WOW' effect */}
        <div className="absolute top-[20%] right-[30%] w-12 h-12 bg-white/30 rounded-full blur-[2px] border border-white/40 animate-float-bubble-2"></div>
        <div className="absolute bottom-[40%] left-[5%] w-20 h-20 bg-white/20 rounded-full blur-[4px] border border-white/30 animate-float-bubble-3"></div>
      </div>

      <div className="relative z-10 w-full max-w-[1100px] min-h-[85vh] bg-white/95 backdrop-blur-md rounded-[30px] shadow-2xl flex flex-col lg:flex-row overflow-hidden my-5">
        <div className="w-full lg:w-[55%] p-8 lg:p-14 flex flex-col justify-center bg-white">
          <div className="w-full max-w-[440px] mx-auto">
            {/* Logo */}
            <div className="flex justify-center lg:justify-start mb-6">
              <div className="py-6 bg-white">
                <img src={logoImg} alt="Hamro Doctor" className="w-[160px] h-auto object-contain" />
              </div>
            </div>

            {/* Header */}
            <div className="mb-10 flex items-center gap-4 animate-in slide-in-from-left duration-500">
               <div className="w-12 h-12 bg-[#EEF5FF] rounded-2xl flex items-center justify-center shadow-sm border border-blue-100/50">
                  <img src={stethImg} alt="Icon" className="w-7 h-7" style={{ filter: 'invert(37%) sepia(93%) saturate(1471%) hue-rotate(188deg) brightness(95%) contrast(89%)' }} />
               </div>
               <h2 className="text-4xl font-black text-[#0D47A1] tracking-tight">
                 {step === 1 ? 'Create Account' : step === 2 ? 'Security Check' : 'Clinical Verification'}
               </h2>
            </div>

            {error && (
              <div className="p-3.5 bg-red-50 border-l-4 border-red-500 text-red-600 rounded-lg text-xs font-bold mb-6 animate-shake">
                {error}
              </div>
            )}

            {step === 1 && (
              <form onSubmit={handleRegister} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative flex items-center group">
                    <div className="absolute left-4 z-10 pointer-events-none transition-colors">
                      <svg className="text-blue-500 group-focus-within:text-blue-700" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Full Name"
                      className="w-full pl-12 pr-4 py-3.5 bg-white border-[1.5px] border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 outline-none transition-all text-sm text-slate-700 placeholder:text-slate-400 font-medium"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="relative flex items-center group">
                    <div className="absolute left-4 z-10 pointer-events-none transition-colors">
                      <svg className="text-blue-500 group-focus-within:text-blue-700" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      placeholder="Email Address"
                      className="w-full pl-12 pr-4 py-3.5 bg-white border-[1.5px] border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 outline-none transition-all text-sm text-slate-700 placeholder:text-slate-400 font-medium"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative flex items-center group">
                    <div className="absolute left-4 z-10 pointer-events-none transition-colors">
                      <svg className="text-blue-500 group-focus-within:text-blue-700" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                    </div>
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      className="w-full pl-12 pr-4 py-3.5 bg-white border-[1.5px] border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 outline-none transition-all text-sm text-slate-700 placeholder:text-slate-400 font-medium"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                      maxLength="10"
                      required
                    />
                  </div>
                  <div className="relative flex items-center group">
                    <div className="absolute left-4 z-10 pointer-events-none transition-colors">
                      <svg className="text-blue-500 group-focus-within:text-blue-700" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                      </svg>
                    </div>
                    <select
                      className="w-full pl-12 pr-4 py-3.5 bg-white border-[1.5px] border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 outline-none transition-all text-sm text-slate-700 font-bold appearance-none cursor-pointer"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      required
                    >
                      <option value="patient">Consult as Patient</option>
                      <option value="doctor">Join as Doctor</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative flex items-center group">
                    <div className="absolute left-4 z-10 pointer-events-none transition-colors">
                      <svg className="text-blue-500 group-focus-within:text-blue-700" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      className="w-full pl-12 pr-12 py-3.5 bg-white border-[1.5px] border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 outline-none transition-all text-sm text-slate-700 placeholder:text-slate-400 font-medium"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-4 text-slate-400 hover:text-blue-600 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <div className="relative flex items-center group">
                    <div className="absolute left-4 z-10 pointer-events-none transition-colors">
                      <svg className="text-blue-500 group-focus-within:text-blue-700" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm Password"
                      className="w-full pl-12 pr-12 py-3.5 bg-white border-[1.5px] border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 outline-none transition-all text-sm text-slate-700 placeholder:text-slate-400 font-medium"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-4 text-slate-400 hover:text-blue-600 transition-colors"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full py-3.5 bg-[#1E88E5] text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:bg-[#0D47A1] hover:-translate-y-0.5 transition-all mt-4" 
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Register Now'}
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <input
                  type="text"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-5 text-center text-3xl font-black tracking-[10px] focus:bg-white focus:border-blue-500 outline-none transition-all"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                />
                <button type="submit" className="w-full py-4 bg-[#1E88E5] text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:bg-[#0D47A1] transition-all">Verify OTP</button>
                <div className="text-center flex justify-center gap-4 text-xs font-bold uppercase text-slate-400">
                  <button type="button" onClick={handleResendOtp} className="text-blue-600 hover:underline">Resend Code</button>
                  <button type="button" onClick={handleBackToRegister} className="hover:text-slate-600">Change Phone</button>
                </div>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handleDoctorProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative flex items-center group">
                    <div className="absolute left-4 z-10 pointer-events-none transition-colors">
                      <svg className="text-blue-500 group-focus-within:text-blue-700" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <rect x="3" y="4" width="18" height="16" rx="2" />
                        <line x1="7" y1="8" x2="7" y2="8" />
                        <line x1="11" y1="8" x2="17" y2="8" />
                        <line x1="11" y1="12" x2="17" y2="12" />
                        <line x1="7" y1="16" x2="17" y2="16" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="NMC Number"
                      className="w-full pl-12 pr-4 py-3.5 bg-white border-[1.5px] border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 outline-none transition-all text-sm text-slate-700 placeholder:text-slate-400 font-medium"
                      value={doctorData.nmcNumber}
                      onChange={(e) => setDoctorData({ ...doctorData, nmcNumber: e.target.value })}
                      required
                    />
                  </div>
                  <div className="relative flex items-center group">
                    <div className="absolute left-4 z-10 pointer-events-none transition-colors">
                      <svg className="text-blue-500 group-focus-within:text-blue-700" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Speciality"
                      className="w-full pl-12 pr-4 py-3.5 bg-white border-[1.5px] border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 outline-none transition-all text-sm text-slate-700 placeholder:text-slate-400 font-medium"
                      value={doctorData.speciality}
                      onChange={(e) => setDoctorData({ ...doctorData, speciality: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative flex items-center group">
                    <div className="absolute left-4 z-10 pointer-events-none transition-colors">
                      <svg className="text-blue-500 group-focus-within:text-blue-700" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                      </svg>
                    </div>
                    <select
                      className="w-full pl-12 pr-4 py-3.5 bg-white border-[1.5px] border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 outline-none transition-all text-sm text-slate-700 font-bold appearance-none cursor-pointer"
                      value={doctorData.salutation}
                      onChange={(e) => setDoctorData({ ...doctorData, salutation: e.target.value })}
                      required
                    >
                      <option value="Dr.">Dr.</option>
                      <option value="Prof. Dr.">Prof. Dr.</option>
                      <option value="Assoc. Prof. Dr.">Assoc. Prof. Dr.</option>
                      <option value="Asst. Prof. Dr.">Asst. Prof. Dr.</option>
                    </select>
                  </div>
                  <div className="relative flex items-center group">
                    <div className="absolute left-4 z-10 pointer-events-none transition-colors">
                      <svg className="text-blue-500 group-focus-within:text-blue-700" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                        <path d="M6 12v5c3 3 9 3 12 0v-5" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Qualification (e.g. MBBS, MD)"
                      className="w-full pl-12 pr-4 py-3.5 bg-white border-[1.5px] border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 outline-none transition-all text-sm text-slate-700 placeholder:text-slate-400 font-medium"
                      value={doctorData.qualification}
                      onChange={(e) => setDoctorData({ ...doctorData, qualification: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative flex items-center group">
                    <div className="absolute left-4 z-10 pointer-events-none transition-colors">
                      <svg className="text-blue-500 group-focus-within:text-blue-700" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    </div>
                    <input
                      type="number"
                      placeholder="Years of Experience"
                      className="w-full pl-12 pr-4 py-3.5 bg-white border-[1.5px] border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 outline-none transition-all text-sm text-slate-700 placeholder:text-slate-400 font-medium"
                      value={doctorData.experience}
                      onChange={(e) => setDoctorData({ ...doctorData, experience: e.target.value })}
                      required
                    />
                  </div>
                  <div className="relative flex items-center group">
                    <div className="absolute left-4 z-10 pointer-events-none transition-colors">
                      <svg className="text-blue-500 group-focus-within:text-blue-700" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="8.5" cy="7" r="4" />
                      </svg>
                    </div>
                    <select
                      className="w-full pl-12 pr-4 py-3.5 bg-white border-[1.5px] border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 outline-none transition-all text-sm text-slate-700 font-bold appearance-none cursor-pointer"
                      value={doctorData.gender}
                      onChange={(e) => setDoctorData({ ...doctorData, gender: e.target.value })}
                      required
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:-translate-y-0.5 transition-all mt-2 uppercase tracking-widest text-[10px]">Verify Clinical Credentials</button>
              </form>
            )}

            <div className="text-center mt-8 text-sm text-slate-500 font-medium">
              Already have an account? <button type="button" onClick={() => navigate('/login')} className="text-[#1E88E5] font-bold hover:underline ml-1">Log in here</button>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex lg:w-[45%] bg-[#E4F2FD] items-center justify-center p-12 relative overflow-hidden">
          <div className="relative z-10 w-full flex flex-col items-center">
            <div className="w-full max-w-[340px] animate-bounce-slow">
              <img src={heroImg} alt="Hero" className="w-full h-auto" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
