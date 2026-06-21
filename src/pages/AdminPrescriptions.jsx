import React, { useState, useEffect } from 'react';

const AdminPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/v1/prescriptions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setPrescriptions(data.prescriptions);
      }
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  // Filter prescriptions locally based on doctor name, patient name, or diagnosis
  const filteredPrescriptions = prescriptions.filter(px => {
    const query = searchQuery.toLowerCase();
    const docName = px.doctor?.name?.toLowerCase() || '';
    const patName = px.patient?.name?.toLowerCase() || '';
    const diagnosis = px.diagnosis?.toLowerCase() || '';
    return docName.includes(query) || patName.includes(query) || diagnosis.includes(query);
  });

  return (
    <main className="flex-1 lg:ml-[280px] py-12 px-4 lg:px-16 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-1 text-slate-900">Prescriptions</h1>
          <p className="text-slate-500 text-sm font-medium">Monitor and view digital prescriptions issued by clinical staff.</p>
        </div>
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search by doctor, patient..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all"
          />
          <div className="absolute left-3 top-3 text-slate-400">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
        </div>
      </header>

      <section className="mt-8">
        {loading ? (
          <div className="flex justify-center p-20 text-slate-400">
            <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          </div>
        ) : filteredPrescriptions.length > 0 ? (
          <div className="flex flex-col gap-4">
            {filteredPrescriptions.map((px) => (
              <div key={px._id} className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all">
                {/* Card Header */}
                <div 
                  className="flex flex-col md:flex-row items-start md:items-center gap-4 py-6 px-8 cursor-pointer select-none" 
                  onClick={() => setExpanded(expanded === px._id ? null : px._id)}
                >
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="12" y1="18" x2="12" y2="12"></line>
                      <line x1="9" y1="15" x2="15" y2="15"></line>
                    </svg>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="text-[16px] font-bold text-slate-900">{px.diagnosis || 'General Consultation'}</div>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 font-medium">
                      <span className="text-slate-800 font-semibold">Dr. {px.doctor?.name || 'Unknown'}</span>
                      <span className="opacity-40">→</span>
                      <span>Patient: <strong className="text-slate-700 font-semibold">{px.patient?.name || 'Unknown'}</strong></span>
                      <span className="opacity-40">·</span>
                      <span>{px.medicines?.length || 0} medicine{px.medicines?.length !== 1 ? 's' : ''}</span>
                      <span className="opacity-40">·</span>
                      <span>{new Date(px.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                  <button className={`bg-slate-50 border-none w-8 h-8 rounded-full flex items-center justify-center text-slate-500 transition-all duration-300 ${expanded === px._id ? 'rotate-180' : ''}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </button>
                </div>

                {/* Expanded Detail */}
                {expanded === px._id && (
                  <div className="border-t border-slate-50 py-6 px-8 flex flex-col gap-6 bg-slate-50/30 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2.5">
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Doctor details</div>
                        <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-base">{px.doctor?.name?.charAt(0)}</div>
                          <div>
                            <div className="text-sm font-bold text-slate-900">Dr. {px.doctor?.name}</div>
                            <div className="text-xs text-slate-500 font-medium">{px.doctor?.doctorDetails?.speciality || 'Medical Specialist'}</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2.5">
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Patient details</div>
                        <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-base">{px.patient?.name?.charAt(0)}</div>
                          <div>
                            <div className="text-sm font-bold text-slate-900">{px.patient?.name}</div>
                            <div className="text-xs text-slate-500 font-medium">{px.patient?.phone || 'No Phone'}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {px.medicines?.length > 0 && (
                      <div className="flex flex-col gap-2.5">
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Prescribed Medicines</div>
                        <div className="rounded-2xl border border-slate-200/60 overflow-hidden bg-white shadow-sm">
                          <div className="grid grid-cols-[2fr_1fr_1fr_1fr] bg-slate-50/50 py-3 px-5 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                            <span>Medicine</span><span>Dosage</span><span>Frequency</span><span>Duration</span>
                          </div>
                          {px.medicines.map((med, i) => (
                            <div key={i} className="grid grid-cols-[2fr_1fr_1fr_1fr] py-4 px-5 border-t border-slate-100 text-[13px] text-slate-700 items-center">
                              <div className="flex items-center gap-2.5">
                                <span className="w-5 h-5 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0">{i + 1}</span>
                                <div>
                                  <strong className="font-semibold text-slate-900">{med.name}</strong>
                                  {med.strength && <span className="text-[11px] text-slate-500 font-normal"> {med.strength}</span>}
                                </div>
                              </div>
                              <span className="text-slate-500 font-medium">{med.dosage || '—'}</span>
                              <span className="text-slate-500 font-medium">{med.frequency || '—'}</span>
                              <span className="text-slate-500 font-medium">{med.duration || '—'}</span>
                              {med.instruction && (
                                <div className="col-span-full text-xs text-slate-600 bg-amber-50/40 py-2 px-3 rounded-xl mt-2 border border-amber-100/50 font-medium">📝 {med.instruction}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {px.advice && (
                      <div className="flex flex-col gap-2.5">
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Doctor's Advice</div>
                        <div className="bg-emerald-50/30 border border-emerald-100 text-emerald-800 py-4 px-5 rounded-2xl text-[13px] leading-relaxed font-medium">{px.advice}</div>
                      </div>
                    )}

                    {px.pdfUrl && (
                      <a
                        href={`${apiUrl}/${px.pdfUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[13px] font-bold shadow-md shadow-blue-100 transition-all no-underline self-start hover:-translate-y-0.5"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="7 10 12 15 17 10"/>
                          <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                        Download PDF Prescription
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-16 bg-white rounded-3xl border border-slate-100 text-center shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No prescriptions found</h3>
            <p className="text-slate-500 text-sm font-medium">Digital prescriptions issued in the system will show up here.</p>
          </div>
        )}
      </section>
    </main>
  );
};

export default AdminPrescriptions;
