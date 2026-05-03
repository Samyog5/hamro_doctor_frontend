import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';
import '../styles/Onboarding.css';

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
    <div className="onboarding-page">
      <div className="onboarding-container">
        <header className="onboarding-header">
          <h1>Please fill in the Basic information</h1>
          <p>Please complete the following basic form. Once you complete modifying the form, you can proceed to completing your profile.</p>
        </header>

        <form onSubmit={handleSubmit} className="onboarding-form">
          <section className="form-section">
            <h2 className="section-title">Basic Information</h2>
            
            <div className="form-group full-width">
              <label>NMC / NAMC / NHPC Number</label>
              <input 
                type="text" 
                name="nmcNumber" 
                placeholder="NMC / NAMC / NHPC Number" 
                value={formData.nmcNumber} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="form-row">
              <div className="form-group quarter">
                <label>Salutation</label>
                <select name="salutation" value={formData.salutation} onChange={handleChange}>
                  <option value="Dr.">Dr.</option>
                  <option value="Prof. Dr.">Prof. Dr.</option>
                  <option value="Assoc. Prof. Dr.">Assoc. Prof. Dr.</option>
                  <option value="Asst. Prof. Dr.">Asst. Prof. Dr.</option>
                </select>
              </div>
              <div className="form-group flex-1">
                <label>First Name</label>
                <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} required />
              </div>
              <div className="form-group flex-1">
                <label>Last Name</label>
                <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group flex-1">
                <label>Email</label>
                <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="form-group flex-1">
                <label>Phone</label>
                <input type="tel" name="phone" placeholder="Phone" value={formData.phone} readOnly />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group flex-1">
                <label>Website</label>
                <input type="url" name="website" placeholder="Website" value={formData.website} onChange={handleChange} />
              </div>
              <div className="form-group flex-1">
                <label>Years Practiced</label>
                <input type="number" name="experience" placeholder="Years of Practice" value={formData.experience} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group flex-1">
                <label>Speciality</label>
                <input type="text" name="speciality" placeholder="Speciality" value={formData.speciality} onChange={handleChange} required />
              </div>
              <div className="form-group flex-1">
                <label>Qualification</label>
                <input type="text" name="qualification" placeholder="Qualification" value={formData.qualification} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group half-width">
              <label>Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </section>

          {error && <div className="onboarding-error">{error}</div>}

          <div className="onboarding-footer">
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? 'Saving...' : 'Save & Continue'}
            </button>
            <button type="button" className="cancel-btn" onClick={onLogout}>
              Logout
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DoctorOnboarding;
