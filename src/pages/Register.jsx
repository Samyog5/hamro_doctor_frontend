import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Register.css';
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
  });

  // Step 2: OTP verification
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpExpiry, setOtpExpiry] = useState(null);

  // Validation function
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
    return true;
  };

  // Handle registration
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email || undefined,
          phone: formData.phone,
          password: formData.password,
          role: 'patient',
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
      console.error('Register error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP verification
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp.trim()) {
      setError('Please enter the OTP');
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError('OTP must be 6 digits');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/v1/auth/verify-otp', {
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
        if (onLogin) {
          onLogin(data.token, data.user);
        } else {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          window.location.href = '/dashboard';
        }
      } else {
        setError(data.message || 'OTP verification failed. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('OTP verification error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle resend OTP
  const handleResendOtp = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email || undefined,
          phone: formData.phone,
          password: formData.password,
          role: 'patient',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setError('');
        const expiryTime = new Date(Date.now() + 10 * 60 * 1000);
        setOtpExpiry(expiryTime);
      } else {
        setError('Failed to resend OTP. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Go back to register form
  const handleBackToRegister = () => {
    setStep(1);
    setOtp('');
    setError('');
  };

  return (
    <div className="register-page">
      <div className="register-card">
        {/* Left Section - Register Form */}
        <div className="register-form-area">
          <div className="register-inside">
            {/* Logo Section */}
            <div className="auth-logo">
              <div className="logo-icon-wrapper">
                <img src={logoImg} alt="Hamro Doctor Logo" className="hd-logo-img" style={{ width: '180px', height: 'auto' }} />
              </div>
            </div>

            {/* Header */}
            <div className="auth-header">
              <div className="header-title">
                <img src={stethImg} alt="Stethoscope" className="action-icon" style={{ width: '28px', height: '28px', filter: 'invert(37%) sepia(93%) saturate(1471%) hue-rotate(188deg) brightness(95%) contrast(89%)' }} />
                <h2 style={{ color: '#0D47A1' }}>{step === 1 ? 'Register' : 'Verification'}</h2>
              </div>
            </div>

            {error && (
              <div className="auth-error">
                <span>{error}</span>
              </div>
            )}

            {/* Step 1: Form */}
            {step === 1 && (
              <form onSubmit={handleRegister} className="auth-form">
                <div className="input-field">
                  <svg className="field-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#757575" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="input-field">
                  <svg className="field-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#757575" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    maxLength="10"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="input-field">
                  <svg className="field-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#757575" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    disabled={loading}
                  />
                  <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? '👁' : '👁‍🗨'}
                  </button>
                </div>

                <div className="input-field">
                  <svg className="field-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#757575" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                    disabled={loading}
                  />
                  <button type="button" className="toggle-password" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? '👁' : '👁‍🗨'}
                  </button>
                </div>

                <button type="submit" className="submit-auth-btn" disabled={loading}>
                  {loading ? 'Processing...' : 'Continue'}
                </button>
              </form>
            )}

            {/* Step 2: OTP */}
            {step === 2 && (
              <form onSubmit={handleVerifyOtp} className="auth-form">
                <div className="otp-container">
                  <p style={{textAlign: 'center', fontSize: '14px', color: '#7f8c8d'}}>OTP sent to {formData.phone}</p>
                  <div className="input-field">
                    <input
                      type="text"
                      className="otp-input"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      maxLength="6"
                      required
                      style={{textAlign: 'center', letterSpacing: '8px', fontSize: '20px'}}
                    />
                  </div>
                </div>

                <button type="submit" className="submit-auth-btn" disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
                
                <div className="auth-options" style={{justifyContent: 'center', gap: '20px'}}>
                  <button type="button" onClick={handleResendOtp} disabled={loading} style={{background: 'none', border: 'none', color: '#1E88E5', cursor: 'pointer', fontWeight: 600}}>Resend</button>
                  <button type="button" onClick={handleBackToRegister} disabled={loading} style={{background: 'none', border: 'none', color: '#7f8c8d', cursor: 'pointer', fontWeight: 600}}>Edit Info</button>
                </div>
              </form>
            )}

            <div className="auth-switch">
              <p>Already have an account? <button type="button" onClick={() => navigate('/login')}>Login</button></p>
            </div>

            <div className="auth-footer-note">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>Secure • Reliable • Trusted Healthcare</span>
            </div>
          </div>
        </div>

        {/* Right Section - Hero Area */}
        <div className="hero-visual-area">
          <div className="hero-image-container">
            <img src={heroImg} alt="Healthcare Professional" className="hero-img" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
