import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalHospitals: 0,
    pendingDoctors: 0,
    pendingHospitals: 0
  });
  const [users, setUsers] = useState([]);
  const [articles, setArticles] = useState([]);
  const [totalArticles, setTotalArticles] = useState(0);
  const [filter, setFilter] = useState('doctor'); // doctor, hospital, patient, article
  const [approvalFilter, setApprovalFilter] = useState('pending'); // pending, approved, all
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const navigate = useNavigate();

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
  const apiVersion = import.meta.env.VITE_API_VERSION || 'v1';

  const fetchTotalArticlesCount = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/${apiVersion}/admin/articles`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        setTotalArticles(data.count);
      }
    } catch (err) {
      console.error('Failed to fetch total articles count:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/${apiVersion}/admin/users`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        const u = data.users;
        setStats({
          totalPatients: u.filter(user => user.role === 'patient').length,
          totalDoctors: u.filter(user => user.role === 'doctor').length,
          totalHospitals: u.filter(user => user.role === 'hospital').length,
          pendingDoctors: u.filter(user => user.role === 'doctor' && !user.doctorDetails?.isApproved).length,
          pendingHospitals: u.filter(user => user.role === 'hospital' && user.hospitalDetails?.listingRequestStatus === 'pending').length
        });
      }
      fetchTotalArticlesCount();
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const fetchUsers = async () => {
    if (filter === 'article') return;
    setLoading(true);
    try {
      let url = `${apiUrl}/api/${apiVersion}/admin/users?role=${filter}`;
      if (approvalFilter !== 'all') {
        url += `&isApproved=${approvalFilter === 'approved'}`;
      }
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchArticles = async (searchVal = searchQuery) => {
    setLoading(true);
    try {
      let url = `${apiUrl}/api/${apiVersion}/admin/articles`;
      if (searchVal.trim()) {
        url += `?search=${encodeURIComponent(searchVal.trim())}`;
      }
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        setArticles(data.articles);
        if (!searchVal.trim()) {
          setTotalArticles(data.count);
        }
      }
    } catch (err) {
      console.error('Failed to fetch articles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    if (filter === 'article') {
      fetchArticles(searchQuery);
    } else {
      fetchUsers();
    }
  }, [filter, approvalFilter]);

  const handleApprove = async (id, status) => {
    setActionLoading(id);
    try {
      const response = await fetch(`${apiUrl}/api/${apiVersion}/admin/approve/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        fetchUsers();
        fetchStats();
      }
    } catch (err) {
      console.error('Approval failed:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteArticle = async (id) => {
    if (!window.confirm('Are you sure you want to delete this article? This will permanently delete the article and all associated comments.')) {
      return;
    }
    
    setActionLoading(id);
    try {
      const response = await fetch(`${apiUrl}/api/${apiVersion}/admin/articles/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        fetchArticles(searchQuery);
        fetchStats();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to delete article.');
      }
    } catch (err) {
      console.error('Failed to delete article:', err);
      alert('An error occurred while deleting the article.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Oversight</h1>
          <p className="text-slate-500 font-medium">Manage medical professionals, institutions, and users.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/admin/onboard')}
            className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 transition-all flex items-center gap-2"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Onboard New User
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
          {stats.pendingDoctors > 0 && (
            <div className="text-xs font-bold text-amber-500 flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-xl">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
              {stats.pendingDoctors} Pending Approval
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 21h18M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7M4 21V7m16 14V7m-4 14V11m-8 10V11" /></svg>
            </div>
            <div>
              <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Hospitals</div>
              <div className="text-2xl font-black text-slate-900">{stats.totalHospitals}</div>
            </div>
          </div>
          {stats.pendingHospitals > 0 && (
            <div className="text-xs font-bold text-amber-500 flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-xl">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
              {stats.pendingHospitals} New Listings
            </div>
          )}
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

        <div 
          onClick={() => navigate('/admin/articles')}
          className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group cursor-pointer hover:border-blue-100"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
            </div>
            <div>
              <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Articles</div>
              <div className="text-2xl font-black text-slate-900 flex items-center gap-1.5">
                {totalArticles}
                <svg className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </div>
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
              onClick={() => setFilter('hospital')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${filter === 'hospital' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Hospitals
            </button>
            <button 
              onClick={() => setFilter('patient')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${filter === 'patient' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Patients
            </button>
          </div>

          <div className="flex items-center gap-3">
            <select 
              value={approvalFilter}
              onChange={(e) => setApprovalFilter(e.target.value)}
              className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition-all"
            >
              <option value="pending">Pending Review</option>
              <option value="approved">Already Verified</option>
              <option value="all">All Status</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-[2px]">Identity</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-[2px]">Credentials</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-[2px]">Status</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-[2px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-20 text-center">
                    <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-slate-400 font-bold text-sm uppercase tracking-widest">Compiling Database...</p>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-20 text-center text-slate-400 font-medium">No users found for this selection.</td>
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
                      {user.role === 'doctor' ? (
                        <div>
                          <div className="text-sm font-bold text-slate-700">{user.doctorDetails?.speciality}</div>
                          <div className="text-[10px] text-blue-600 font-black uppercase mt-1 tracking-wider">NMC: {user.doctorDetails?.nmcNumber}</div>
                        </div>
                      ) : user.role === 'hospital' ? (
                        <div>
                          <div className="text-sm font-bold text-slate-700">{user.hospitalDetails?.hospitalType || 'Medical Center'}</div>
                          <div className="text-[10px] text-emerald-600 font-black uppercase mt-1 tracking-wider">Reg: {user.hospitalDetails?.registrationNumber || 'N/A'}</div>
                        </div>
                      ) : (
                        <div className="text-sm text-slate-500 font-medium">Regular Patient</div>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      {(user.role === 'doctor' && user.doctorDetails?.isApproved) || 
                       (user.role === 'hospital' && user.hospitalDetails?.listingRequestStatus === 'approved') ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                          Pending Review
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        {((user.role === 'doctor' && !user.doctorDetails?.isApproved) || 
                          (user.role === 'hospital' && user.hospitalDetails?.listingRequestStatus !== 'approved')) && (
                          <button 
                            onClick={() => handleApprove(user._id, true)}
                            disabled={actionLoading === user._id}
                            className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition-all shadow-md shadow-emerald-100 disabled:opacity-50"
                          >
                            {actionLoading === user._id ? '...' : 'Verify'}
                          </button>
                        )}
                        <button className="p-2 text-slate-400 hover:bg-white hover:text-blue-600 rounded-xl transition-all border border-transparent hover:border-slate-100">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
                        </button>
                      </div>
                    </td>
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

export default AdminDashboard;
