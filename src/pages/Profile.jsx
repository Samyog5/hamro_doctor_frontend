import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = ({ onUpdateUser }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || {});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    profile: {
      gender: '',
      address: '',
      dob: '',
      bmi: {
        height: '',
        weight: ''
      }
    },
    doctorDetails: {
      speciality: '',
      experience: '',
      nmcNumber: '',
      bio: '',
      education: ''
    }
  });

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
  const apiVersion = import.meta.env.VITE_API_VERSION || 'v1';

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/${apiVersion}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        const u = data.user;
        setUser(u);
        setFormData({
          name: u.name || '',
          email: u.email || '',
          phone: u.phone || '',
          profile: {
            gender: u.profile?.gender || '',
            address: u.profile?.address || '',
            dob: u.profile?.dob ? new Date(u.profile.dob).toISOString().split('T')[0] : '',
            bmi: {
              height: u.profile?.bmi?.height || '',
              weight: u.profile?.bmi?.weight || ''
            }
          },
          doctorDetails: {
            speciality: u.doctorDetails?.speciality || '',
            experience: u.doctorDetails?.experience || '',
            nmcNumber: u.doctorDetails?.nmcNumber || '',
            bio: u.doctorDetails?.bio || '',
            education: u.doctorDetails?.education || ''
          }
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const parts = name.split('.');
      if (parts.length === 3) {
        const [p1, p2, p3] = parts;
        setFormData(prev => ({
          ...prev,
          [p1]: {
            ...prev[p1],
            [p2]: {
              ...prev[p1][p2],
              [p3]: value
            }
          }
        }));
      } else {
        const [p1, p2] = parts;
        setFormData(prev => ({
          ...prev,
          [p1]: {
            ...prev[p1],
            [p2]: value
          }
        }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/${apiVersion}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        if (onUpdateUser) onUpdateUser(data.user);
        setIsEditing(false);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update profile' });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setSaveLoading(false);
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image size should be less than 5MB' });
      return;
    }

    setPhotoLoading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${apiUrl}/api/${apiVersion}/users/avatar`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ image: reader.result })
        });

        const data = await response.json();
        if (data.success) {
          localStorage.setItem('user', JSON.stringify(data.user));
          setUser(data.user);
          if (onUpdateUser) onUpdateUser(data.user);
          setMessage({ type: 'success', text: 'Photo updated successfully!' });
        } else {
          setMessage({ type: 'error', text: data.message || 'Failed to update photo' });
        }
      } catch (error) {
        console.error('Error uploading photo:', error);
        setMessage({ type: 'error', text: 'Failed to upload photo' });
      } finally {
        setPhotoLoading(false);
      }
    };
  };

  const isDoctor = user.role === 'doctor';

  if (loading) {
    return (
      <main className="flex-1 lg:ml-[280px] min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
      </main>
    );
  }

  return (
    <main className="flex-1 lg:ml-[280px] min-h-screen bg-slate-50 font-['Poppins'] py-8 px-4 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Profile</h1>
            <p className="text-slate-500 text-sm">Manage your personal information and preferences.</p>
          </div>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${isEditing ? 'bg-slate-200 text-slate-600' : 'bg-blue-600 text-white shadow-lg shadow-blue-100'}`}
          >
            {isEditing ? (
              <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>Cancel Edit</>
            ) : (
              <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>Edit Profile</>
            )}
          </button>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-xl text-sm font-bold animate-in fade-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <form onSubmit={handleSubmit}>
            {/* Top Banner & Avatar */}
            <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
              <div className="absolute -bottom-12 left-8 p-1 bg-white rounded-3xl shadow-xl group/avatar">
                <div 
                  className="w-24 h-24 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-3xl font-black relative overflow-hidden cursor-pointer"
                  onClick={() => document.getElementById('avatar-input').click()}
                >
                  {user.profile?.avatar ? (
                    <img 
                      src={user.profile.avatar.startsWith('http') || user.profile.avatar.startsWith('data:') ? user.profile.avatar : `${apiUrl}${user.profile.avatar}`} 
                      alt="Avatar" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    user.name?.charAt(0)
                  )}
                  <div className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover/avatar:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-[10px] font-bold">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                    CHANGE
                  </div>
                  {photoLoading && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                <input id="avatar-input" type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              </div>
            </div>

            <div className="pt-16 pb-8 px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Basic Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-black text-slate-900 border-b border-slate-50 pb-2">Basic Details</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                      <input type="text" name="name" value={formData.name} onChange={handleChange} disabled={!isEditing} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60 transition-all outline-none" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
                      <input type="email" name="email" value={formData.email} onChange={handleChange} disabled={!isEditing} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60 transition-all outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Gender</label>
                        <select name="profile.gender" value={formData.profile.gender} onChange={handleChange} disabled={!isEditing} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60 transition-all outline-none">
                          <option value="">Select</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Date of Birth</label>
                        <input type="date" name="profile.dob" value={formData.profile.dob} onChange={handleChange} disabled={!isEditing} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60 transition-all outline-none" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact & Physical */}
                <div className="space-y-6">
                  <h3 className="text-lg font-black text-slate-900 border-b border-slate-50 pb-2">Contact & Health</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Phone Number</label>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleChange} disabled={!isEditing} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60 transition-all outline-none" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Address</label>
                      <input type="text" name="profile.address" value={formData.profile.address} onChange={handleChange} disabled={!isEditing} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60 transition-all outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Height (cm)</label>
                        <input type="number" name="profile.bmi.height" value={formData.profile.bmi.height} onChange={handleChange} disabled={!isEditing} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60 transition-all outline-none" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Weight (kg)</label>
                        <input type="number" name="profile.bmi.weight" value={formData.profile.bmi.weight} onChange={handleChange} disabled={!isEditing} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60 transition-all outline-none" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Doctor Specific Details */}
                {isDoctor && (
                  <div className="lg:col-span-2 space-y-6 mt-4">
                    <h3 className="text-lg font-black text-slate-900 border-b border-slate-50 pb-2">Professional Credentials</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Speciality</label>
                        <input type="text" name="doctorDetails.speciality" value={formData.doctorDetails.speciality} onChange={handleChange} disabled={!isEditing} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60 transition-all outline-none" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Experience (Years)</label>
                        <input type="number" name="doctorDetails.experience" value={formData.doctorDetails.experience} onChange={handleChange} disabled={!isEditing} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60 transition-all outline-none" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">NMC Number</label>
                        <input type="text" name="doctorDetails.nmcNumber" value={formData.doctorDetails.nmcNumber} onChange={handleChange} disabled={!isEditing} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60 transition-all outline-none" />
                      </div>
                      <div className="lg:col-span-3">
                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Bio / About Me</label>
                        <textarea name="doctorDetails.bio" value={formData.doctorDetails.bio} onChange={handleChange} disabled={!isEditing} rows={4} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60 transition-all outline-none resize-none" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {isEditing && (
                <div className="mt-12 pt-8 border-t border-slate-50 flex justify-end gap-4">
                  <button type="button" onClick={() => setIsEditing(false)} className="px-8 py-3 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition-all">Discard Changes</button>
                  <button type="submit" disabled={saveLoading} className="px-8 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-xl shadow-blue-100 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50">
                    {saveLoading ? 'Saving Changes...' : 'Save Profile'}
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default Profile;
