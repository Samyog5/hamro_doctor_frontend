import React, { useState, useEffect } from 'react';
const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/prescriptions`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) setPrescriptions(data.prescriptions);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching prescriptions:', error);
        setLoading(false);
      }
    };
    fetchPrescriptions();
  }, []);

  return (
    <main className="flex-1 lg:ml-[280px] py-12 px-4 lg:px-16">
      <header className="flex justify-between items-center mb-12">
        <div className="header-left">
          <h1 className="text-3xl font-bold tracking-tight mb-1 text-slate-900">My Prescriptions</h1>
          <p className="text-slate-500 text-sm">View and download your digital prescriptions.</p>
        </div>
      </header>

      <section className="mt-8">
        {loading ? (
          <div className="flex justify-center p-12 text-slate-400">Fetching prescriptions...</div>
        ) : prescriptions.length > 0 ? (
          <div className="flex flex-col gap-3">
            {prescriptions.map((px) => (
              <div key={px._id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden transition-shadow hover:shadow-lg">
                {/* Card Header */}
                <div className="flex items-center gap-4 py-5 px-6 cursor-pointer select-none" onClick={() => setExpanded(expanded === px._id ? null : px._id)}>
                  <div className="w-11 h-11 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-[15px] font-bold text-slate-900 mb-1">{px.diagnosis || 'General Consultation'}</div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <span>Dr. {px.doctor?.name}</span>
                      <span className="opacity-50">·</span>
                      <span>{px.medicines?.length} medicine{px.medicines?.length !== 1 ? 's' : ''}</span>
                      <span className="opacity-50">·</span>
                      <span>{new Date(px.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                  <button className={`bg-slate-100 border-none w-8 h-8 rounded-full flex items-center justify-center text-slate-500 transition-all duration-300 ${expanded === px._id ? 'rotate-180' : ''}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </button>
                </div>

                {/* Expanded Detail */}
                {expanded === px._id && (
                  <div className="border-t border-slate-50 py-5 px-6 flex flex-col gap-5 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex flex-col gap-2.5">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Doctor</div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-base">{px.doctor?.name?.charAt(0)}</div>
                        <div>
                          <div className="text-sm font-bold text-slate-900">Dr. {px.doctor?.name}</div>
                          <div className="text-xs text-slate-500">{px.doctor?.doctorDetails?.specialization || 'General Physician'}</div>
                        </div>
                      </div>
                    </div>

                    {px.medicines?.length > 0 && (
                      <div className="flex flex-col gap-2.5">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Prescribed Medicines</div>
                        <div className="rounded-xl border border-slate-200 overflow-hidden">
                          <div className="grid grid-cols-[2fr_1fr_1fr_1fr] bg-slate-50 py-2.5 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            <span>Medicine</span><span>Dosage</span><span>Frequency</span><span>Duration</span>
                          </div>
                          {px.medicines.map((med, i) => (
                            <div key={i} className="grid grid-cols-[2fr_1fr_1fr_1fr] py-3 px-4 border-t border-slate-50 text-[13px] text-slate-700 items-center">
                              <div className="flex items-center gap-2.5">
                                <span className="w-5 h-5 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0">{i + 1}</span>
                                <div>
                                  <strong className="font-semibold text-slate-900">{med.name}</strong>
                                  {med.strength && <span className="text-[11px] text-slate-500 font-normal"> {med.strength}</span>}
                                </div>
                              </div>
                              <span className="text-slate-500">{med.dosage || '—'}</span>
                              <span className="text-slate-500">{med.frequency || '—'}</span>
                              <span className="text-slate-500">{med.duration || '—'}</span>
                              {med.instruction && (
                                <div className="col-span-full text-xs text-slate-600 bg-amber-50 py-1.5 px-2.5 rounded-md mt-1.5 border border-amber-100/50">📝 {med.instruction}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {px.advice && (
                      <div className="flex flex-col gap-2.5">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Doctor's Advice</div>
                        <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 py-3 px-4 rounded-xl text-[13px] leading-relaxed">{px.advice}</div>
                      </div>
                    )}

                    {px.pdfUrl && (
                      <a
                        href={`${import.meta.env.VITE_API_URL}/${px.pdfUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 py-2.5 px-5 bg-white border-[1.5px] border-blue-600 text-blue-600 rounded-xl text-[13px] font-bold transition-all no-underline self-start hover:bg-blue-600 hover:text-white"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="7 10 12 15 17 10"/>
                          <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                        Download PDF
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-100 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M10 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No prescriptions found</h3>
            <p className="text-slate-500 text-sm">Your digital prescriptions will appear here once issued by your doctor.</p>
          </div>
        )}
      </section>
    </main>
  );
};

export default Prescriptions;
