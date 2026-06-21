import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const HospitalDashboard = () => {
  const [stats, setStats] = useState({
    totalDoctors: 0,
    totalNurses: 0,
    totalPatients: 0
  });
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('doctor'); // doctor, nurse, patient
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
  const apiVersion = import.meta.env.VITE_API_VERSION || 'v1';

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let endpoint = `${apiUrl}/api/${apiVersion}/hospital/users?role=${filter}`;
      if (filter === 'link-requests') {
        endpoint = `${apiUrl}/api/${apiVersion}/hospital/link-requests`;
      }
      
      const response = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        setUsers(filter === 'link-requests' ? data.requests : data.users);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveLink = async (doctorId, status) => {
    try {
      const response = await fetch(`${apiUrl}/api/${apiVersion}/hospital/link-requests/${doctorId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        fetchUsers();
      }
    } catch (err) {
      console.error('Error updating link request:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/${apiVersion}/hospital/users`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        const u = data.users;
        setStats({
          totalDoctors: u.filter(user => user.role === 'doctor').length,
          totalNurses: u.filter(user => user.role === 'nurse').length,
          totalPatients: u.filter(user => user.role === 'patient').length
        });
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [filter]);

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Hospital Administration</h1>
          <p className="text-slate-500 font-medium">Manage your hospital's doctors, nurses, and patients.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/hospital/onboard')}
            className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 transition-all flex items-center gap-2"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Onboard Staff / Patient
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>
            </div>
            <div>
              <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Doctors</div>
              <div className="text-2xl font-black text-slate-900">{stats.totalDoctors}</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle><path d="M12 11v4"></path><path d="M10 13h4"></path></svg>
            </div>
            <div>
              <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Nurses</div>
              <div className="text-2xl font-black text-slate-900">{stats.totalNurses}</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
            <div>
              <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Patients</div>
              <div className="text-2xl font-black text-slate-900">{stats.totalPatients}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content / Table */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        {/* Table Header / Filters */}
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center p-1 bg-slate-50 rounded-2xl w-fit">
            <button 
              onClick={() => setFilter('doctor')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${filter === 'doctor' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Doctors
            </button>
            <button 
              onClick={() => setFilter('nurse')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${filter === 'nurse' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Nurses
            </button>
            <button 
              onClick={() => setFilter('patient')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${filter === 'patient' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Patients
            </button>
            <button 
              onClick={() => setFilter('link-requests')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${filter === 'link-requests' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Link Requests
            </button>
          </div>
          
          <div className="relative mt-4 md:mt-0 w-full md:w-64">
            <input 
              type="text" 
              placeholder="Search by name or phone..." 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 transition-all"
              onChange={(e) => {
                const term = e.target.value.toLowerCase();
                if (!term) {
                  fetchUsers(); // reset if empty
                } else {
                  setUsers(prev => prev.filter(u => u.name.toLowerCase().includes(term) || u.phone.includes(term)));
                }
              }}
            />
            <svg className="absolute left-3.5 top-3 text-slate-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-[2px]">Identity</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-[2px]">Role</th>
                {filter === 'doctor' && <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-[2px]">Join Method</th>}
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-[2px]">Status</th>
                {filter === 'link-requests' && <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-[2px]">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={filter === 'doctor' ? 4 : 3} className="px-6 py-20 text-center">
                    <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-slate-400 font-bold text-sm uppercase tracking-widest">Loading...</p>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={filter === 'doctor' ? 4 : 3} className="px-6 py-20 text-center text-slate-400 font-medium">No users found for this selection.</td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg shadow-blue-100">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 leading-tight">{user.name}</div>
                          <div className="text-xs text-slate-400 font-medium mt-1">{user.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm font-bold text-slate-700 capitalize">{filter === 'link-requests' ? 'Doctor' : user.role}</div>
                    </td>
                    {filter === 'doctor' && (
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-50 border border-slate-100 text-slate-600`}>
                          {user.joinMethod || 'Added by Hospital Admin'}
                        </span>
                      </td>
                    )}
                    <td className="px-6 py-5">
                      {filter === 'link-requests' ? (
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${user.status === 'pending' ? 'bg-amber-50 text-amber-600' : user.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'pending' ? 'bg-amber-500 animate-pulse' : user.status === 'approved' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                          {user.status}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                          Active
                        </span>
                      )}
                    </td>
                    {filter === 'link-requests' && (
                      <td className="px-6 py-5">
                        {user.status === 'pending' && (
                          <div className="flex gap-2">
                            <button onClick={() => handleApproveLink(user._id, 'approved')} className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-lg hover:bg-emerald-600 transition-all">Approve</button>
                            <button onClick={() => handleApproveLink(user._id, 'rejected')} className="px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 transition-all">Reject</button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HospitalDashboard;
