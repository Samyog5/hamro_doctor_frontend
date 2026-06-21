import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import heroImg from '../assets/hero.webp';
import logoImg from '../assets/logo.png';
import stethImg from '../assets/steth.svg';

function Login({ onLogin }) {
  const navigate = useNavigate();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Forgot Password Flow States
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotLoginId, setForgotLoginId] = useState('');
  const [availableMethods, setAvailableMethods] = useState([]);
  const [maskedEmail, setMaskedEmail] = useState('');
  const [maskedPhone, setMaskedPhone] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  const handleDetect = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');
    setForgotLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const apiVersion = import.meta.env.VITE_API_VERSION || 'v1';
      const response = await fetch(`${apiUrl}/api/${apiVersion}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          loginId: forgotLoginId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setAvailableMethods(data.methods || []);
        setMaskedEmail(data.maskedEmail || '');
        setMaskedPhone(data.maskedPhone || '');
        if (data.methods && data.methods.length > 0) {
          setSelectedMethod(data.methods[0]);
        }
        setForgotStep(2);
      } else {
        setForgotError(data.message || 'Account not found. Please try again.');
      }
    } catch (err) {
      setForgotError('Network error. Please try again.');
      console.error('Detect account error:', err);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');
    setForgotLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const apiVersion = import.meta.env.VITE_API_VERSION || 'v1';
      const response = await fetch(`${apiUrl}/api/${apiVersion}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          loginId: forgotLoginId,
          method: selectedMethod,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setForgotSuccess(data.message || 'Verification code sent.');
        setForgotStep(3);
      } else {
        setForgotError(data.message || 'Failed to send OTP.');
      }
    } catch (err) {
      setForgotError('Network error. Please try again.');
      console.error('Send OTP error:', err);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    if (newPassword !== confirmPassword) {
      setForgotError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setForgotError('Password must be at least 6 characters');
      return;
    }

    setForgotLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const apiVersion = import.meta.env.VITE_API_VERSION || 'v1';
      const response = await fetch(`${apiUrl}/api/${apiVersion}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          loginId: forgotLoginId,
          code: otpCode,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setForgotSuccess(data.message || 'Password reset successful!');
        setTimeout(() => {
          setForgotMode(false);
          setForgotStep(1);
          setForgotLoginId('');
          setOtpCode('');
          setNewPassword('');
          setConfirmPassword('');
          setForgotSuccess('');
        }, 2000);
      } else {
        setForgotError(data.message || 'Reset failed. Please check your verification code.');
      }
    } catch (err) {
      setForgotError('Network error. Please try again.');
      console.error('Reset password error:', err);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const apiVersion = import.meta.env.VITE_API_VERSION || 'v1';
      const response = await fetch(`${apiUrl}/api/${apiVersion}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          loginId,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (onLogin) {
          onLogin(data.token, data.user);
        } else {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          window.location.href = '/dashboard';
        }
      } else {
        setError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
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
        {/* Left Section - Login Form */}
        <div className="w-full lg:w-[55%] p-8 lg:p-14 flex flex-col justify-center bg-white">
          <div className="w-full max-w-[380px] mx-auto">
            {/* Logo Section */}
            <div className="flex justify-center lg:justify-start mb-6">
              <div className="py-6 bg-white">
                <img src={logoImg} alt="Third Pole" className="w-[160px] h-auto object-contain" />
              </div>
            </div>

            {!forgotMode ? (
              <>
                {/* Login Header */}
                <div className="mb-10 flex items-center gap-4 animate-in slide-in-from-left duration-500">
                   <div className="w-12 h-12 bg-[#EEF5FF] rounded-2xl flex items-center justify-center shadow-sm border border-blue-100/50">
                      <img src={stethImg} alt="Icon" className="w-7 h-7" style={{ filter: 'invert(37%) sepia(93%) saturate(1471%) hue-rotate(188deg) brightness(95%) contrast(89%)' }} />
                   </div>
                   <h2 className="text-4xl font-black text-[#0D47A1] tracking-tight">Login</h2>
                </div>

                {error && (
                  <div className="p-3.5 bg-red-50 border-l-4 border-red-500 text-red-600 rounded-lg text-xs font-bold mb-6 animate-shake">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <div className="space-y-1.5">
                    <div className="relative flex items-center group">
                      <div className="absolute left-4 z-10 pointer-events-none transition-colors">
                        <svg className="text-blue-500 group-focus-within:text-blue-700" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        placeholder="Email or Phone Number"
                        className="w-full pl-12 pr-4 py-3.5 bg-white border-[1.5px] border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 outline-none transition-all text-sm text-slate-700 placeholder:text-slate-400 font-medium"
                        value={loginId}
                        onChange={(e) => setLoginId(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
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
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
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
                  </div>

                  <div className="flex justify-between items-center text-[13px] font-semibold mt-1">
                    <label className="flex items-center gap-2 text-slate-500 cursor-pointer hover:text-slate-700 transition-colors">
                      <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                      <span>Remember me</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotMode(true);
                        setForgotStep(1);
                        setForgotError('');
                        setForgotSuccess('');
                      }}
                      className="text-blue-600 hover:underline font-semibold"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full py-3.5 bg-[#1E88E5] text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:bg-[#0D47A1] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2" 
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
                    ) : (
                      'Login Now'
                    )}
                  </button>
                </form>

                <div className="text-center mt-8 text-sm text-slate-500 font-medium">
                  Don't have an account? <button type="button" onClick={() => navigate('/register')} className="text-[#1E88E5] font-bold hover:underline ml-1">Create account</button>
                </div>

                <div className="text-center mt-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                  Are you a medical institution? <button type="button" onClick={() => navigate('/register-hospital')} className="text-blue-600 hover:underline ml-1">Register as Hospital</button>
                </div>
              </>
            ) : (
              <>
                {/* Forgot Password Header */}
                <div className="mb-10 flex items-center gap-4 animate-in slide-in-from-left duration-500">
                   <div className="w-12 h-12 bg-[#EEF5FF] rounded-2xl flex items-center justify-center shadow-sm border border-blue-100/50">
                      <img src={stethImg} alt="Icon" className="w-7 h-7" style={{ filter: 'invert(37%) sepia(93%) saturate(1471%) hue-rotate(188deg) brightness(95%) contrast(89%)' }} />
                   </div>
                   <h2 className="text-3xl font-black text-[#0D47A1] tracking-tight">Reset Password</h2>
                </div>

                {forgotError && (
                  <div className="p-3.5 bg-red-50 border-l-4 border-red-500 text-red-600 rounded-lg text-xs font-bold mb-6 animate-shake">
                    {forgotError}
                  </div>
                )}

                {forgotSuccess && (
                  <div className="p-3.5 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-600 rounded-lg text-xs font-bold mb-6 animate-fade-in">
                    {forgotSuccess}
                  </div>
                )}

                {forgotStep === 1 && (
                  <form onSubmit={handleDetect} className="flex flex-col gap-5">
                    <p className="text-slate-500 text-sm leading-relaxed">
                      Enter your registered Email or Phone number to reset your password. We'll search for your account.
                    </p>
                    <div className="space-y-1.5">
                      <div className="relative flex items-center group">
                        <div className="absolute left-4 z-10 pointer-events-none transition-colors">
                          <svg className="text-blue-500 group-focus-within:text-blue-700" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          placeholder="Email or Phone Number"
                          className="w-full pl-12 pr-4 py-3.5 bg-white border-[1.5px] border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 outline-none transition-all text-sm text-slate-700 placeholder:text-slate-400 font-medium"
                          value={forgotLoginId}
                          onChange={(e) => setForgotLoginId(e.target.value)}
                          required
                          disabled={forgotLoading}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 bg-[#1E88E5] text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:bg-[#0D47A1] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                      disabled={forgotLoading}
                    >
                      {forgotLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
                      ) : (
                        'Find Account'
                      )}
                    </button>

                    <div className="text-center mt-4">
                      <button
                        type="button"
                        onClick={() => { setForgotMode(false); setForgotStep(1); }}
                        className="text-slate-500 hover:text-blue-600 hover:underline text-sm font-semibold transition-colors"
                      >
                        Back to Login
                      </button>
                    </div>
                  </form>
                )}

                {forgotStep === 2 && (
                  <form onSubmit={handleSendOtp} className="flex flex-col gap-5">
                    <p className="text-slate-500 text-sm leading-relaxed">
                      Account detected! Select where you would like to receive the verification OTP code:
                    </p>

                    <div className="flex flex-col gap-3">
                      {availableMethods.includes('email') && (
                        <label className={`flex items-center gap-4 p-4 border-[1.5px] rounded-xl cursor-pointer transition-all ${selectedMethod === 'email' ? 'border-blue-500 bg-blue-50/30' : 'border-slate-200 bg-white hover:border-blue-300'}`}>
                          <input
                            type="radio"
                            name="resetMethod"
                            value="email"
                            checked={selectedMethod === 'email'}
                            onChange={() => setSelectedMethod('email')}
                            className="w-4 h-4 accent-blue-600"
                          />
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-700">Mail Verification</span>
                            <span className="text-xs text-slate-500 font-medium">{maskedEmail}</span>
                          </div>
                        </label>
                      )}

                      {availableMethods.includes('phone') && (
                        <label className={`flex items-center gap-4 p-4 border-[1.5px] rounded-xl cursor-pointer transition-all ${selectedMethod === 'phone' ? 'border-blue-500 bg-blue-50/30' : 'border-slate-200 bg-white hover:border-blue-300'}`}>
                          <input
                            type="radio"
                            name="resetMethod"
                            value="phone"
                            checked={selectedMethod === 'phone'}
                            onChange={() => setSelectedMethod('phone')}
                            className="w-4 h-4 accent-blue-600"
                          />
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-700">Phone Verification (SMS)</span>
                            <span className="text-xs text-slate-500 font-medium">{maskedPhone}</span>
                          </div>
                        </label>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 bg-[#1E88E5] text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:bg-[#0D47A1] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                      disabled={forgotLoading}
                    >
                      {forgotLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
                      ) : (
                        'Send Verification Code'
                      )}
                    </button>

                    <div className="flex justify-between items-center mt-4">
                      <button
                        type="button"
                        onClick={() => setForgotStep(1)}
                        className="text-slate-500 hover:text-blue-600 text-sm font-semibold transition-colors"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={() => { setForgotMode(false); setForgotStep(1); }}
                        className="text-slate-500 hover:text-blue-600 hover:underline text-sm font-semibold transition-colors"
                      >
                        Back to Login
                      </button>
                    </div>
                  </form>
                )}

                {forgotStep === 3 && (
                  <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
                    <p className="text-slate-500 text-sm leading-relaxed mb-1">
                      Enter the 6-digit verification code sent to your selected method and choose your new password.
                    </p>

                    <div className="space-y-1.5">
                      <div className="relative flex items-center group">
                        <div className="absolute left-4 z-10 pointer-events-none transition-colors">
                          <svg className="text-blue-500 group-focus-within:text-blue-700" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          placeholder="6-Digit OTP Code"
                          maxLength="6"
                          className="w-full pl-12 pr-4 py-3.5 bg-white border-[1.5px] border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 outline-none transition-all text-sm text-slate-700 placeholder:text-slate-400 font-bold tracking-[0.2em] text-center"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                          required
                          disabled={forgotLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="relative flex items-center group">
                        <div className="absolute left-4 z-10 pointer-events-none transition-colors">
                          <svg className="text-blue-500 group-focus-within:text-blue-700" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          </svg>
                        </div>
                        <input
                          type="password"
                          placeholder="New Password"
                          className="w-full pl-12 pr-4 py-3.5 bg-white border-[1.5px] border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 outline-none transition-all text-sm text-slate-700 placeholder:text-slate-400 font-medium"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          disabled={forgotLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="relative flex items-center group">
                        <div className="absolute left-4 z-10 pointer-events-none transition-colors">
                          <svg className="text-blue-500 group-focus-within:text-blue-700" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          </svg>
                        </div>
                        <input
                          type="password"
                          placeholder="Confirm New Password"
                          className="w-full pl-12 pr-4 py-3.5 bg-white border-[1.5px] border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 outline-none transition-all text-sm text-slate-700 placeholder:text-slate-400 font-medium"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          disabled={forgotLoading}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 bg-[#1E88E5] text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:bg-[#0D47A1] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                      disabled={forgotLoading}
                    >
                      {forgotLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
                      ) : (
                        'Reset Password'
                      )}
                    </button>

                    <div className="flex justify-between items-center mt-4">
                      <button
                        type="button"
                        onClick={() => setForgotStep(2)}
                        className="text-slate-500 hover:text-blue-600 text-sm font-semibold transition-colors"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={() => { setForgotMode(false); setForgotStep(1); }}
                        className="text-slate-500 hover:text-blue-600 hover:underline text-sm font-semibold transition-colors"
                      >
                        Back to Login
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}


          </div>
        </div>

        {/* Right Section - Hero Area */}
        <div className="hidden lg:flex lg:w-[45%] bg-[#E4F2FD] items-center justify-center p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 to-transparent z-0"></div>
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

export default Login;
