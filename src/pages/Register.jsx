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
    role: 'patient',
  });

  // Step 2: OTP verification
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState('');
  const [token, setToken] = useState(''); // Store token for step 3
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
    if (!formData.role) {
      setError('Please select a role');
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
          // Instead of redirecting, go to step 3
          setToken(data.token);
          localStorage.setItem('token', data.token); // Still need it for API
          localStorage.setItem('user', JSON.stringify(data.user));
          
          // Pre-fill doctor name if available
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

  // Handle doctor profile submission (Step 3)
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
        profile: {
          gender: doctorData.gender
        }
      };

      const response = await fetch(`${apiUrl}/api/${apiVersion}/doctor/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        // Success! Clear up and go to login
        localStorage.clear();
        navigate('/login');
      } else {
        setError(data.message || 'Failed to save doctor details');
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
      <div className="bg-decoration">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>
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
                <h2 style={{ color: '#0D47A1' }}>
                  {step === 1 ? 'Register' : step === 2 ? 'Verification' : 'Clinical Details'}
                </h2>
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
                <div className="form-row">
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
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="form-row">
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
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      required
                      disabled={loading}
                      className="role-select"
                    >
                      <option value="patient">Patient</option>
                      <option value="doctor">Doctor</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
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
                      {showPassword ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>

                  <div className="input-field">
                    <svg className="field-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#757575" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      required
                      disabled={loading}
                    />
                    <button type="button" className="toggle-password" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                      {showConfirmPassword ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
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

            {/* Step 3: Doctor Details */}
            {step === 3 && (
              <form onSubmit={handleDoctorProfileSubmit} className="auth-form doctor-onboarding-step">
                <div className="form-row">
                  <div className="input-field" style={{flex: '0.4'}}>
                    <select
                      value={doctorData.salutation}
                      onChange={(e) => setDoctorData({...doctorData, salutation: e.target.value})}
                      className="role-select"
                      style={{paddingLeft: '15px'}}
                    >
                      <option value="Dr.">Dr.</option>
                      <option value="Prof. Dr.">Prof. Dr.</option>
                      <option value="Assoc. Prof. Dr.">Assoc. Prof. Dr.</option>
                      <option value="Asst. Prof. Dr.">Asst. Prof. Dr.</option>
                    </select>
                  </div>
                  <div className="input-field">
                    <input
                      type="text"
                      placeholder="First Name"
                      value={doctorData.firstName}
                      onChange={(e) => setDoctorData({...doctorData, firstName: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="input-field">
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={doctorData.lastName}
                      onChange={(e) => setDoctorData({...doctorData, lastName: e.target.value})}
                      required
                    />
                  </div>
                  <div className="input-field">
                    <input
                      type="text"
                      placeholder="NMC / NAMC Number"
                      value={doctorData.nmcNumber}
                      onChange={(e) => setDoctorData({...doctorData, nmcNumber: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="input-field">
                    <input
                      type="text"
                      placeholder="Speciality"
                      value={doctorData.speciality}
                      onChange={(e) => setDoctorData({...doctorData, speciality: e.target.value})}
                      required
                    />
                  </div>
                  <div className="input-field">
                    <input
                      type="number"
                      placeholder="Experience (Years)"
                      value={doctorData.experience}
                      onChange={(e) => setDoctorData({...doctorData, experience: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="input-field">
                    <input
                      type="text"
                      placeholder="Qualification"
                      value={doctorData.qualification}
                      onChange={(e) => setDoctorData({...doctorData, qualification: e.target.value})}
                      required
                    />
                  </div>
                  <div className="input-field">
                    <select
                      value={doctorData.gender}
                      onChange={(e) => setDoctorData({...doctorData, gender: e.target.value})}
                      className="role-select"
                      style={{paddingLeft: '15px'}}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="submit-auth-btn" disabled={loading}>
                  {loading ? 'Saving...' : 'Complete Registration'}
                </button>
              </form>
            )}

            <div className="auth-switch">
              <p>Already have an account? <button type="button" onClick={() => navigate('/login')}>Login</button></p>
            </div>

            <div className="auth-footer-note">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>Secure | Reliable | Trusted Healthcare</span>
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
