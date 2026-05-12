import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logoImg from '../assets/logo.png';
import heroImg from '../assets/homepage_hero.png';
import stethIcon from '../assets/steth.svg';

const Home = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);

    const fetchArticles = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/v1/articles?limit=4`);
        const data = await response.json();
        if (data.success) {
          setArticles(data.articles || []);
        }
      } catch (err) {
        console.error('Error fetching articles:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const benefits = [
    {
      title: "24/7 Virtual Consultation",
      desc: "Connect with certified specialists anytime, anywhere via secure video or audio calls.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15.6 11.6L22 7v10l-6.4-4.6z"/><rect x="2" y="3" width="14" height="18" rx="2" ry="2"/>
        </svg>
      ),
      color: "blue"
    },
    {
      title: "Verified Specialists",
      desc: "Every doctor on our platform is vetted and NMC verified for your peace of mind.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      ),
      color: "emerald"
    },
    {
      title: "Digital Prescriptions",
      desc: "Receive instant, valid digital prescriptions that you can use at any pharmacy.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
        </svg>
      ),
      color: "purple"
    }
  ];

  return (
    <div className="min-h-screen bg-white font-['Poppins']">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 px-6 lg:px-16 py-4 flex items-center justify-between ${scrolled ? 'bg-white/80 backdrop-blur-xl shadow-lg shadow-slate-200/50 py-3' : 'bg-transparent'}`}>
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
            <img src={stethIcon} alt="Logo" className="w-6 h-6 lg:w-8 lg:h-8 invert" />
          </div>
          <span className="text-xl lg:text-2xl font-black text-slate-900 tracking-tighter">Hamro<span className="text-blue-600">Doctor</span></span>
        </div>

        <div className="hidden lg:flex items-center gap-10">
          {['Services', 'Specialists', 'Articles', 'About'].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors tracking-wide uppercase">{item}</a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <button 
              onClick={() => navigate(user.role === 'doctor' ? '/doctor-dashboard' : '/dashboard')}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all"
            >
              Go to Dashboard
            </button>
          ) : (
            <>
              <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors px-4">Login</Link>
              <Link to="/register" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all">Join Now</Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 lg:pt-48 pb-20 lg:pb-40 px-6 lg:px-16 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-50/50 -z-10 rounded-bl-[200px] hidden lg:block"></div>
        
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="animate-in fade-in slide-in-from-left duration-1000">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
              <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
              Nepal's #1 Digital Healthcare Platform
            </div>
            <h1 className="text-5xl lg:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight mb-8">
              Your Health, <br />
              <span className="text-blue-600 text-glow">Our Priority.</span>
            </h1>
            <p className="text-lg text-slate-500 leading-relaxed max-w-lg mb-10 font-medium">
              Access the best healthcare from the comfort of your home. Video consultations, digital prescriptions, and expert health advice—all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => navigate('/register')}
                className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
              >
                Find a Doctor
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
              <button className="px-10 py-4 bg-white text-slate-900 border-2 border-slate-100 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all flex items-center justify-center">
                How it works
              </button>
            </div>

            <div className="mt-16 flex items-center gap-8 border-t border-slate-100 pt-10">
              <div>
                <div className="text-3xl font-black text-slate-900">50k+</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Patients</div>
              </div>
              <div className="w-px h-10 bg-slate-100"></div>
              <div>
                <div className="text-3xl font-black text-slate-900">500+</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Expert Doctors</div>
              </div>
            </div>
          </div>

          <div className="relative lg:h-[600px] animate-in fade-in slide-in-from-right duration-1000">
            <div className="absolute inset-0 bg-blue-600/5 rounded-[60px] -rotate-3 translate-x-4 translate-y-4"></div>
            <img 
              src={heroImg} 
              alt="Healthcare" 
              className="w-full h-full object-cover rounded-[60px] shadow-2xl relative z-10"
            />
            <div className="absolute -bottom-10 -left-10 bg-white p-6 rounded-3xl shadow-2xl z-20 hidden lg:block border border-slate-50">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                </div>
                <div>
                  <div className="text-sm font-black text-slate-900">Verified Health</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Digital Platform</div>
                </div>
              </div>
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white">+</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="services" className="py-32 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <div className="text-center mb-20">
            <h2 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4">Why Choose Us</h2>
            <h3 className="text-3xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              A healthcare experience <br /> designed for the modern world.
            </h3>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((b, i) => (
              <div key={i} className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100 hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-2 transition-all group">
                <div className={`w-16 h-16 bg-${b.color}-50 text-${b.color}-600 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-${b.color}-600 group-hover:text-white transition-colors`}>
                  {b.icon}
                </div>
                <h4 className="text-xl font-black text-slate-900 mb-4">{b.title}</h4>
                <p className="text-slate-500 leading-relaxed font-medium">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Section */}
      <section id="articles" className="py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
            <div>
              <h2 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4">Medical Insights</h2>
              <h3 className="text-3xl lg:text-5xl font-black text-slate-900 tracking-tight">Latest Health Articles</h3>
            </div>
            <button 
              onClick={() => navigate('/articles')}
              className="text-blue-600 font-bold flex items-center gap-2 hover:gap-3 transition-all"
            >
              Browse all articles
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              [1, 2, 3, 4].map(i => <div key={i} className="h-[400px] bg-slate-100 rounded-[32px] animate-pulse"></div>)
            ) : articles.map((article) => (
              <div 
                key={article._id} 
                className="bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all group cursor-pointer"
                onClick={() => navigate(`/articles/${article._id}`)}
              >
                <div className="h-48 overflow-hidden">
                  <img 
                    src={article.featureImage ? (article.featureImage.startsWith('http') || article.featureImage.startsWith('data:') ? article.featureImage : `${apiUrl}${article.featureImage}`) : "https://images.unsplash.com/photo-1505751172107-573228a64221?q=80&w=800&auto=format&fit=crop"} 
                    alt={article.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase tracking-widest">{article.category || 'Health'}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{article.readTime || '5 min'} read</span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mb-3 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {article.title}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-3 mb-6 leading-relaxed">
                    {article.summary || article.content?.substring(0, 100) + '...'}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <span className="text-[10px] font-bold text-slate-400">By {article.author?.name || 'Dr. Specialist'}</span>
                    <div className="flex items-center gap-1 text-blue-600">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                      <span className="text-[10px] font-black">{article.comments?.length || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-20 p-10 lg:p-16 bg-slate-900 rounded-[50px] relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10 text-center lg:text-left">
              <h3 className="text-3xl lg:text-4xl font-black text-white mb-4 tracking-tight">Want to participate in discussions?</h3>
              <p className="text-blue-100/60 max-w-lg mb-0 font-medium">Create an account as a Patient or Doctor to comment on articles and engage with the community.</p>
            </div>
            {!user && (
              <div className="flex gap-4 relative z-10">
                <button 
                  onClick={() => navigate('/register')}
                  className="px-10 py-4 bg-white text-slate-900 rounded-2xl font-bold hover:bg-slate-100 transition-all shadow-2xl shadow-black/20"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 pt-20 pb-10 px-6 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-1 lg:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center">
                  <img src={stethIcon} alt="Logo" className="w-6 h-6 invert" />
                </div>
                <span className="text-xl font-black text-slate-900 tracking-tighter">Hamro<span className="text-blue-600">Doctor</span></span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed font-medium mb-8">
                Empowering healthcare through digital innovation. Connecting patients with the best medical care in Nepal.
              </p>
              <div className="flex gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all cursor-pointer">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h5 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Platform</h5>
              <ul className="space-y-4 text-sm font-medium text-slate-500">
                <li><a href="#" className="hover:text-blue-600 transition-colors">Telemedicine</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Digital Pharmacy</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Medical Forum</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Specialists</a></li>
              </ul>
            </div>

            <div>
              <h5 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Company</h5>
              <ul className="space-y-4 text-sm font-medium text-slate-500">
                <li><a href="#" className="hover:text-blue-600 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a></li>
              </ul>
            </div>

            <div>
              <h5 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Contact</h5>
              <ul className="space-y-4 text-sm font-medium text-slate-500">
                <li>support@hamrodoctor.com</li>
                <li>+977-1-4XXXXXX</li>
                <li>Kathmandu, Nepal</li>
              </ul>
            </div>
          </div>
          
          <div className="pt-10 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">© 2026 Hamro Doctor. All rights reserved.</p>
            <div className="flex gap-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <a href="#" className="hover:text-blue-600">Facebook</a>
              <a href="#" className="hover:text-blue-600">Twitter</a>
              <a href="#" className="hover:text-blue-600">LinkedIn</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
