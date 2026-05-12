import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import heroImg from '../assets/hero.webp';
import logoImg from '../assets/logo.png';
import stethImg from '../assets/steth.svg';

function HospitalRegister({ onLogin }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    registrationNumber: '',
    hospitalType: 'Private',
    description: '',
    password: '',
    confirmPassword: '',
    role: 'hospital',
  });

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Hospital Name is required');
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
    if (!formData.registrationNumber.trim()) {
      setError('Registration Number is required');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
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
          role: 'hospital',
          address: formData.address || undefined,
          hospitalDetails: {
            registrationNumber: formData.registrationNumber,
            hospitalType: formData.hospitalType,
            description: formData.description
          }
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep(2); // Show success message
      } else {
        setError(data.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0D47A1] to-[#1976D2] flex items-center justify-center p-4 lg:p-0 font-['Poppins'] relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[5%] w-64 h-64 bg-white/10 rounded-full blur-[20px] border border-white/20 animate-float-bubble-1"></div>
        <div className="absolute bottom-[5%] right-[5%] w-96 h-96 bg-blue-400/20 rounded-full blur-[30px] border border-white/10 animate-float-bubble-2"></div>
        <div className="absolute top-[45%] right-[15%] w-48 h-48 bg-white/10 rounded-full blur-[15px] border border-white/20 animate-float-bubble-3"></div>
      </div>

      <div className="relative z-10 w-full max-w-[1100px] min-h-[85vh] bg-white/95 backdrop-blur-md rounded-[30px] shadow-2xl flex flex-col lg:flex-row overflow-hidden my-5">
        <div className="w-full lg:w-[55%] p-8 lg:p-14 flex flex-col justify-center bg-white">
          <div className="w-full max-w-[440px] mx-auto">
            <div className="flex justify-center lg:justify-start mb-6">
              <div className="py-6 bg-white">
                <img src={logoImg} alt="Hamro Doctor" className="w-[160px] h-auto object-contain" />
              </div>
            </div>

            <div className="mb-10 flex items-center gap-4">
               <div className="w-12 h-12 bg-[#EEF5FF] rounded-2xl flex items-center justify-center shadow-sm border border-blue-100/50">
                  <img src={stethImg} alt="Icon" className="w-7 h-7" style={{ filter: 'invert(37%) sepia(93%) saturate(1471%) hue-rotate(188deg) brightness(95%) contrast(89%)' }} />
               </div>
               <h2 className="text-3xl font-black text-[#0D47A1] tracking-tight">
                 {step === 1 ? 'Hospital Register' : 'Registration Pending'}
               </h2>
            </div>

            {error && (
              <div className="p-3.5 bg-red-50 border-l-4 border-red-500 text-red-600 rounded-lg text-xs font-bold mb-6">
                {error}
              </div>
            )}

            {step === 1 && (
              <form onSubmit={handleRegister} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Hospital Name */}
                  <div className="relative flex items-center group">
                    <div className="absolute left-4 z-10">
                      <svg className="text-blue-500" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M3 21h18M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7M4 21V7m16 14V7m-4 14V11m-8 10V11" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Hospital Name"
                      className="w-full pl-12 pr-4 py-3.5 bg-white border-[1.5px] border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-all text-sm font-medium"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  {/* Hospital Address */}
                  <div className="relative flex items-center group">
                    <div className="absolute left-4 z-10">
                      <svg className="text-blue-500" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Hospital Address (City, District)"
                      className="w-full pl-12 pr-4 py-3.5 bg-white border-[1.5px] border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-all text-sm font-medium"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative flex items-center group">
                    <div className="absolute left-4 z-10">
                      <svg className="text-blue-500" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      placeholder="Hospital Email"
                      className="w-full pl-12 pr-4 py-3.5 bg-white border-[1.5px] border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-all text-sm font-medium"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="relative flex items-center group">
                    <div className="absolute left-4 z-10">
                      <svg className="text-blue-500" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                    </div>
                    <input
                      type="tel"
                      placeholder="Official Contact"
                      className="w-full pl-12 pr-4 py-3.5 bg-white border-[1.5px] border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-all text-sm font-medium"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                      maxLength="10"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative flex items-center group">
                    <input
                      type="text"
                      placeholder="Registration Number (PAN/VAT/MoH)"
                      className="w-full px-4 py-3.5 bg-white border-[1.5px] border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-all text-sm font-medium"
                      value={formData.registrationNumber}
                      onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                      required
                    />
                  </div>
                  <div className="relative flex items-center group">
                    <select
                      className="w-full px-4 py-3.5 bg-white border-[1.5px] border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-all text-sm font-bold appearance-none cursor-pointer"
                      value={formData.hospitalType}
                      onChange={(e) => setFormData({ ...formData, hospitalType: e.target.value })}
                      required
                    >
                      <option value="Private">Private Hospital</option>
                      <option value="Government">Government Hospital</option>
                      <option value="Clinic">Polyclinic/Clinic</option>
                      <option value="Diagnostic">Diagnostic Center</option>
                    </select>
                  </div>
                </div>

                <div className="relative flex items-center group">
                  <textarea
                    placeholder="Short Description of Services"
                    className="w-full px-4 py-3.5 bg-white border-[1.5px] border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-all text-sm font-medium h-24"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative flex items-center group">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      className="w-full pl-4 pr-12 py-3.5 bg-white border-[1.5px] border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-all text-sm font-medium"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="relative flex items-center group">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm Password"
                      className="w-full pl-4 pr-12 py-3.5 bg-white border-[1.5px] border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-all text-sm font-medium"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="w-full py-4 bg-[#1E88E5] text-white rounded-xl font-bold shadow-lg hover:bg-[#0D47A1] transition-all mt-4" disabled={loading}>
                  {loading ? 'Registering...' : 'Register Hospital'}
                </button>
              </form>
            )}

            {step === 2 && (
              <div className="text-center py-10">
                <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">Request Sent Successfully</h3>
                <p className="text-slate-500 font-medium leading-relaxed mb-8">
                  Your hospital registration request has been received. Please contact administration for approval before logging in.
                </p>
                <button 
                  onClick={() => navigate('/login')}
                  className="w-full py-4 bg-[#1E88E5] text-white rounded-xl font-bold shadow-lg hover:bg-[#0D47A1] transition-all"
                >
                  Back to Login
                </button>
              </div>
            )}

            <div className="text-center mt-8 text-sm text-slate-500 font-medium">
              Go back to <button type="button" onClick={() => navigate('/login')} className="text-[#1E88E5] font-bold hover:underline ml-1">Log in</button>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex lg:w-[45%] bg-[#E4F2FD] items-center justify-center p-12">
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

export default HospitalRegister;
