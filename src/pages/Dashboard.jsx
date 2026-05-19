import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import storyImage from '../assets/story_image.png';
import exerciseImg from '../assets/exercise_illustration.png';
import doctorAvatar from '../assets/doctor_illustration.png';
const Dashboard = ({ onLogout }) => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(() => {
    const savedUser = JSON.parse(localStorage.getItem('user'));
    return savedUser || { name: 'User', id: '', avatar: 'U' };
  });
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (userData?.role === 'admin') {
      navigate('/admin-dashboard');
    } else if (userData?.role === 'doctor') {
      navigate('/doctor-dashboard');
    } else if (userData?.role === 'hospital') {
      navigate('/hospital-dashboard');
    }
  }, [userData, navigate]);

  const weight = profile?.bmi?.weight || 0;
  const heightCm = profile?.bmi?.height || 0;
  const heightM = heightCm / 100;
  const bmi = (weight > 0 && heightM > 0) ? (weight / (heightM * heightM)).toFixed(2) : '0.00';

  const getBmiPlan = (bmiValue) => {
    const bmiVal = parseFloat(bmiValue);
    if (!bmiVal || bmiVal === 0) {
      return {
        category: 'No Data Available',
        badge: 'Setup Profile',
        color: 'slate',
        bgGradient: 'from-slate-500 to-slate-700',
        textColor: 'text-slate-700',
        bgColor: 'bg-slate-50',
        borderColor: 'border-slate-200',
        iconBg: 'bg-slate-100',
        iconColor: 'text-slate-500',
        summary: 'Please update your height and weight in your profile to generate a customized BMI-based health plan.',
        plans: [
          {
            title: 'Complete Profile Setup',
            desc: 'Head over to your Profile settings page.',
            icon: '⚙️'
          },
          {
            title: 'Enter Exact Metrics',
            desc: 'Provide your accurate weight (in kg) and height (in cm).',
            icon: '📐'
          },
          {
            title: 'Auto Calculation',
            desc: 'Our system will automatically calculate your exact BMI.',
            icon: '🧮'
          },
          {
            title: 'Unlock Personalized Plan',
            desc: 'Get clinical nutrition & exercise tips tailored to you.',
            icon: '🔓'
          },
          {
            title: 'Daily Tracking',
            desc: 'Keep checking back to view updated health recommendations.',
            icon: '📈'
          },
          {
            title: 'Consult a Doctor',
            desc: 'Request digital consultations if you require specialized care.',
            icon: '🏥'
          }
        ]
      };
    }

    if (bmiVal < 18.5) {
      return {
        category: 'Underweight Range',
        badge: 'Nutritional Support Required',
        color: 'amber',
        bgGradient: 'from-amber-500 to-orange-600',
        textColor: 'text-amber-700',
        bgColor: 'bg-amber-50/50',
        borderColor: 'border-amber-100',
        iconBg: 'bg-amber-100/50',
        iconColor: 'text-amber-600',
        summary: 'Your BMI is in the underweight range. Focus on nutrient-rich energy sources and resistance training to build healthy muscle tissue and boost immunity.',
        plans: [
          {
            title: 'Healthy Calorie Surplus',
            desc: 'Aim for a nutrient-dense, calorie-surplus diet. Add 300–500 extra calories per day to support gradual, healthy weight gain.',
            icon: '🍳'
          },
          {
            title: 'Targeted Protein Intake',
            desc: 'Eat 1.2 to 2.0 grams of high-quality protein per kilogram of body weight to support healthy lean muscle growth.',
            icon: '🥩'
          },
          {
            title: 'Resistance Strength Training',
            desc: 'Focus on full-body strength/resistance exercises 3 times a week to stimulate muscle growth instead of excess cardio.',
            icon: '🏋️'
          },
          {
            title: 'Frequent Nutrient-Rich Meals',
            desc: 'Consume 5 to 6 smaller, energy-dense meals throughout the day to avoid feeling prematurely full or bloated.',
            icon: '🥗'
          },
          {
            title: 'Incorporate Healthy Fats',
            desc: 'Add avocados, raw nuts, seeds, olive oil, and organic nut butters into your meals for dense, clean energy.',
            icon: '🥑'
          },
          {
            title: 'Smart Hydration Timing',
            desc: 'Drink water and fluids in between meals rather than right before or during to maximize appetite capacity.',
            icon: '🥤'
          },
          {
            title: 'Deep Recovery & Sleep',
            desc: 'Ensure 8+ hours of deep, restful sleep every night to allow optimal muscle tissue repair and hormone synthesis.',
            icon: '😴'
          }
        ]
      };
    } else if (bmiVal < 25) {
      return {
        category: 'Healthy Weight Range',
        badge: 'Excellent Shape',
        color: 'emerald',
        bgGradient: 'from-emerald-500 to-teal-600',
        textColor: 'text-emerald-700',
        bgColor: 'bg-emerald-50/50',
        borderColor: 'border-emerald-100',
        iconBg: 'bg-emerald-100/50',
        iconColor: 'text-emerald-600',
        summary: 'Awesome! Your BMI is in the healthy weight range. Keep maintaining your lifestyle with balanced nutrition and regular physical activity.',
        plans: [
          {
            title: 'Balanced Macronutrients',
            desc: 'Keep consuming complex carbs (whole grains, oats), clean proteins (poultry, legumes), and plenty of colorful fresh produce.',
            icon: '🍎'
          },
          {
            title: 'Consistent Cardiovascular Activity',
            desc: 'Aim for at least 150 minutes of moderate aerobic workouts (brisk walking, cycling, swimming) distributed throughout the week.',
            icon: '🏃'
          },
          {
            title: 'Muscle Toning Exercises',
            desc: 'Perform bodyweight or free-weight resistance routines 2 days a week to preserve bone density and metabolic vitality.',
            icon: '💪'
          },
          {
            title: 'Optimum Hydration Levels',
            desc: 'Drink 2.5 to 3 liters of fresh water daily to maintain cellular health, joint lubrication, and optimal digestion.',
            icon: '💧'
          },
          {
            title: 'Mindful Eating Practices',
            desc: 'Maintain weight stability by practicing portion control and tuning in to your natural hunger and satiety signals.',
            icon: '🧠'
          },
          {
            title: 'Stress Management & Sleep',
            desc: 'Secure 7 to 9 hours of quality sleep nightly to manage daily cortisol levels and ensure cellular rejuvenation.',
            icon: '✨'
          },
          {
            title: 'Preventive Health Checks',
            desc: 'Stay proactive! Schedule regular checkups and monitor your primary metrics like blood pressure and cholesterol.',
            icon: '🏥'
          }
        ]
      };
    } else if (bmiVal < 30) {
      return {
        category: 'Overweight Range',
        badge: 'Activity & Nutrition Boost Needed',
        color: 'orange',
        bgGradient: 'from-orange-500 to-red-500',
        textColor: 'text-orange-700',
        bgColor: 'bg-orange-50/50',
        borderColor: 'border-orange-100',
        iconBg: 'bg-orange-100/50',
        iconColor: 'text-orange-600',
        summary: 'Your BMI indicates an overweight range. A moderate calorie deficit combined with high-fiber food and physical training will lead to steady weight management.',
        plans: [
          {
            title: 'Moderate Calorie Deficit',
            desc: 'Create a comfortable, sustainable calorie deficit of 300 to 500 calories under your daily maintenance requirements.',
            icon: '📉'
          },
          {
            title: 'Enhance Cardiovascular Volume',
            desc: 'Build up to 45–60 minutes of low-to-medium impact cardio daily, such as power walking, cycling, or jogging.',
            icon: '🚴'
          },
          {
            title: 'Maximize Dietary Fiber',
            desc: 'Focus on dietary fiber (beans, lentils, green veggies, berries) to trigger satiety hormones and naturally curb cravings.',
            icon: '🥦'
          },
          {
            title: 'Resistance Training for Muscle',
            desc: 'Train with weights or resistance bands 3 times a week to preserve your metabolic rate while burning body fat.',
            icon: '🏋️‍♂️'
          },
          {
            title: 'Eliminate Refined Sugars',
            desc: 'Drastically reduce processed sugars, sweetened coffee, sodas, packaged juices, and refined flour products.',
            icon: '🍩'
          },
          {
            title: 'Nutritious & Mindful Snacking',
            desc: 'Prepare wholesome snacks like fresh berries, mixed nuts, or hummus with cucumbers to replace packaged convenience foods.',
            icon: '🍇'
          },
          {
            title: 'Consistent Lifestyle Habits',
            desc: 'Prioritize gradual progress over extreme diets. Aiming for a steady, healthy loss of 0.5 kg (1 lb) per week is key.',
            icon: '📆'
          }
        ]
      };
    } else {
      return {
        category: 'Obese Range',
        badge: 'Clinical Care & Structured Strategy',
        color: 'red',
        bgGradient: 'from-red-500 to-rose-700',
        textColor: 'text-red-700',
        bgColor: 'bg-red-50/50',
        borderColor: 'border-red-100',
        iconBg: 'bg-red-100/50',
        iconColor: 'text-red-600',
        summary: 'Your BMI is in the obese range. We strongly recommend low-impact joint-friendly physical activity, specialized dietary planning, and medical checkups.',
        plans: [
          {
            title: 'Consult Professional Care',
            desc: 'Collaborate with a registered nutritionist or physician to design a personalized and medically safe weight-loss route.',
            icon: '🩺'
          },
          {
            title: 'Joint-Friendly Low-Impact Cardio',
            desc: 'Protect your joints by choosing low-impact exercises like swimming, water aerobics, recumbent cycling, or brisk walking.',
            icon: '🏊'
          },
          {
            title: 'Gradual Pace & Time Progression',
            desc: 'Begin with short 10–15 minute active daily walks, then gradually scale up the duration as your conditioning improves.',
            icon: '🚶'
          },
          {
            title: 'Protein & Vegetable Centricity',
            desc: 'Build all major meals around lean proteins (tofu, egg whites, fish) and non-starchy green vegetables to secure satiety.',
            icon: '🥗'
          },
          {
            title: 'Zero Sweetened Beverages',
            desc: 'Replace all sugary beverages, sodas, energy drinks, and juices entirely with pure filtered water or herbal teas.',
            icon: '💧'
          },
          {
            title: 'Identify Emotional Food Triggers',
            desc: 'Keep a food and mood journal to identify psychological triggers for stress-eating and substitute with walking or breathing.',
            icon: '📓'
          },
          {
            title: 'Strict Sleep Regulation',
            desc: 'Maintain strict sleep patterns. Insufficient sleep triggers hunger hormones (ghrelin) and elevated fat-storage hormones.',
            icon: '🛌'
          }
        ]
      };
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const [doctors, setDoctors] = useState([]);
  const [articles, setArticles] = useState([]);
  const [selectedSpeciality, setSelectedSpeciality] = useState('All');
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [requestingId, setRequestingId] = useState(null);
  const [debugData, setDebugData] = useState(null);
  const [showChatBox, setShowChatBox] = useState(false);
  const [showHealthPlanModal, setShowHealthPlanModal] = useState(false);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
        const response = await fetch(`${apiUrl}/api/v1/users/doctors`);
        const data = await response.json();
        if (data.success) {
          setDoctors(data.doctors || []);
        }
      } catch (err) {
        console.error('Error fetching doctors:', err);
      } finally {
        setLoadingDoctors(false);
      }
    };

    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
        const response = await fetch(`${apiUrl}/api/v1/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
          setProfile(data.user.profile);
          setUserData(data.user);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };

    const fetchArticles = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
        const response = await fetch(`${apiUrl}/api/v1/articles?limit=3`);
        const data = await response.json();
        if (data.success) {
          setArticles(data.articles || []);
        }
      } catch (err) {
        console.error('Error fetching articles:', err);
      }
    };

    fetchDoctors();
    fetchProfile();
    fetchArticles();
  }, []);

  const handleConsultationRequest = async (doctorId) => {
    setRequestingId(doctorId);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';

      const response = await fetch(`${apiUrl}/api/v1/consultations/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ doctorId })
      });

      const data = await response.json();
      if (data.success) {
        alert('Consultation request sent successfully! Please wait for the doctor to accept.');
      } else {
        alert(data.message || 'Failed to send request');
      }
    } catch (err) {
      console.error('Error requesting consultation:', err);
      alert('An error occurred while sending the request');
    } finally {
      setRequestingId(null);
    }
  };

  const specialities = ['All', ...new Set(doctors.map(d => d.doctorDetails?.speciality).filter(Boolean))];
  const filteredDoctors = selectedSpeciality === 'All'
    ? doctors
    : doctors.filter(d => d.doctorDetails?.speciality === selectedSpeciality);

  return (
    <main className="flex-1 min-w-0 lg:ml-[280px] py-12 px-4 lg:px-16 max-h-screen overflow-y-auto overflow-x-hidden">
      <header className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6 mb-12">
        <div className="header-left">
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight mb-1 text-slate-900 flex items-center gap-3">
            {getGreeting()}, {userData.name.split(' ')[0]}
            {getGreeting() === 'Good evening' ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" className="animate-pulse">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" className="animate-spin-slow">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            )}
          </h1>
          <p className="text-slate-500 text-sm">Here's your health summary for today</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="hidden lg:flex relative w-11 h-11 rounded-full bg-white border border-slate-100 items-center justify-center text-slate-500 hover:bg-slate-50 transition-all shadow-sm">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
          </button>
          <button
            onClick={() => document.getElementById('specialists-section').scrollIntoView({ behavior: 'smooth' })}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 transition-all"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span className="whitespace-nowrap">Book Consultation</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-8">
        {/* Middle Column */}
        <div className="flex flex-col gap-8">
          {/* HERO Health Summary */}
          <section className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm relative overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.05)_0%,transparent_70%)]">
            {(() => {
              const weight = profile?.bmi?.weight || 0;
              const heightCm = profile?.bmi?.height || 0;
              const heightM = heightCm / 100;
              const bmi = (weight > 0 && heightM > 0) ? (weight / (heightM * heightM)).toFixed(2) : '0.00';

              let status = { text: 'Data missing', color: 'text-slate-400', bg: 'bg-slate-50', border: 'border-slate-100', percentage: '0%' };
              if (bmi > 0) {
                let pct = 0;
                if (bmi < 18.5) {
                  status = { text: 'Underweight range', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' };
                  pct = Math.max(2, ((bmi - 15) / (18.5 - 15)) * 10);
                } else if (bmi < 25) {
                  status = { text: 'Healthy weight range', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' };
                  pct = 10 + ((bmi - 18.5) / (25.0 - 18.5)) * (33.3 - 10);
                } else if (bmi < 30) {
                  status = { text: 'Overweight range', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' };
                  pct = 33.3 + ((bmi - 25.0) / (30.0 - 25.0)) * (66.6 - 33.3);
                } else {
                  status = { text: 'Obese range', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' };
                  pct = 66.6 + Math.min(1, (bmi - 30.0) / (40.0 - 30.0)) * (98 - 66.6);
                }
                status.percentage = `${pct}%`;
              }

              return (
                <>
                  <div className="flex justify-between items-start mb-6">
                    <div className={`flex items-center gap-1.5 ${status.color} font-bold text-sm ${status.bg} px-3 py-1 rounded-full border ${status.border}`}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M12 19V5M5 12l7-7 7 7" />
                      </svg>
                      <span>Keep it up! <small className="font-normal opacity-70 ml-1">Daily goal tracking</small></span>
                    </div>
                  </div>

                  <h2 className={`text-xl font-bold ${status.color} mb-1 leading-tight`}>{status.text}</h2>
                  <p className="text-slate-500 text-sm mb-8">
                    {bmi > 0 ? (bmi < 25 ? "You're in great shape! Keep maintaining your lifestyle." : "A bit of exercise and a balanced diet can help.") : "Please update your height and weight in profile."}
                  </p>

                  <div className="mb-8">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">BMI (kg/m²)</div>
                    <div className="text-6xl font-bold text-slate-900 tracking-tighter my-4">{bmi}</div>

                    <div className="mt-4">
                      <div className="h-2.5 rounded-full flex gap-1 relative overflow-hidden bg-slate-100">
                        <div className="flex-1 bg-emerald-500 rounded-sm"></div>
                        <div className="flex-1 bg-amber-500 rounded-sm"></div>
                        <div className="flex-1 bg-red-500 rounded-sm"></div>
                        <div className="absolute top-0 w-4 h-full bg-white border-2 border-slate-900 rounded-full shadow-md z-10 transition-all duration-1000" style={{ left: status.percentage, transform: 'translateX(-50%)' }}></div>
                      </div>
                      <div className="relative h-4 mt-2 text-[10px] font-bold text-slate-400">
                        <span className="absolute left-[10%] -translate-x-1/2">18.5</span>
                        <span className="absolute left-[33.3%] -translate-x-1/2">24.9</span>
                        <span className="absolute left-[66.6%] -translate-x-1/2">29.9</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-6 sm:gap-12 py-6 border-y border-slate-50 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
                          <path d="M3 6h18"></path>
                          <path d="M16 10a4 4 0 0 1-8 0"></path>
                        </svg>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">WEIGHT</span>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-slate-900">{weight || '--'} <small className="text-sm font-medium opacity-50">kg</small></span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">HEIGHT</span>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-slate-900">{heightCm || '--'} <small className="text-sm font-medium opacity-50">cm</small></span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/30">
              <div className="flex items-center gap-3 text-sm text-emerald-800">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 text-emerald-500">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                </svg>
                <span className="font-medium text-xs"><strong>Today's tip:</strong> A 20-minute walk can improve your mood and heart health.</span>
              </div>
              <button 
                onClick={() => setShowHealthPlanModal(true)}
                className="flex items-center gap-1 text-emerald-600 font-bold text-xs hover:underline whitespace-nowrap"
              >
                View health plan
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </section>

          {/* Doctors by Speciality */}
          <section id="specialists-section" className="mb-8 scroll-mt-24">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-900">Find a Specialist <span className="text-slate-400 font-medium text-sm ml-2">({doctors.length} doctors found)</span></h3>
              <button className="text-sm font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-all">View all</button>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
              {specialities.map(spec => (
                <button
                  key={spec}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${selectedSpeciality === spec ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200' : 'bg-white text-slate-500 border-slate-200 hover:border-blue-500 hover:text-blue-600'}`}
                  onClick={() => setSelectedSpeciality(spec)}
                >
                  {spec}
                </button>
              ))}
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {loadingDoctors ? (
                <div className="w-full h-40 bg-slate-50 rounded-3xl animate-pulse flex items-center justify-center text-slate-400 font-medium">Loading specialists...</div>
              ) : filteredDoctors.length > 0 ? (
                filteredDoctors.map(doctor => (
                  <div key={doctor._id} className="min-w-[200px] bg-white border border-slate-100 rounded-[24px] p-6 flex flex-col items-center text-center transition-all hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 group">
                    <div className="relative w-16 h-16 mb-4">
                      {doctor.profile?.avatar ? (
                        <img
                          src={doctor.profile.avatar.startsWith('http') || doctor.profile.avatar.startsWith('data:') ? doctor.profile.avatar : `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}${doctor.profile.avatar}`}
                          alt={doctor.name}
                          className="w-full h-full rounded-2xl object-cover"
                        />
                      ) : (
                        <div className="w-full h-full rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">{doctor.name.charAt(0)}</div>
                      )}
                      {doctor.doctorDetails?.isOnline && <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></span>}
                    </div>
                    <div className="mb-4">
                      <h4 className="text-sm font-bold text-slate-900 mb-0.5 leading-tight">{doctor.name}</h4>
                      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">{doctor.doctorDetails?.speciality}</span>
                      <div className="flex justify-center gap-2 text-[10px] font-bold text-slate-400 mt-2">
                        <span className="text-amber-500">⭐ 4.8</span>
                        <span>• {doctor.doctorDetails?.experience || 0} yrs exp</span>
                      </div>
                    </div>
                    <button
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${requestingId === doctor._id ? 'bg-slate-100 text-slate-400' : 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white'}`}
                      disabled={requestingId === doctor._id}
                      onClick={() => handleConsultationRequest(doctor._id)}
                    >
                      {requestingId === doctor._id ? 'Sending...' : 'Consult Now'}
                    </button>
                  </div>
                ))
              ) : (
                <div className="w-full p-12 bg-white rounded-3xl border border-dashed border-slate-200 text-center flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                  </div>
                  <p className="text-slate-500 font-bold">No doctors found for this speciality.</p>
                  <p className="text-slate-400 text-xs">Try selecting a different category or view all.</p>
                </div>
              )}
            </div>
          </section>

          {/* Health Insights */}
          <section className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-900">Health Insights</h3>
              <button className="text-sm font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-all" onClick={() => navigate('/articles')}>View all</button>
            </div>

            <div className="flex flex-col gap-6">
              {articles.length > 0 ? (
                articles.map(article => (
                  <div
                    key={article._id}
                    className="flex flex-col sm:flex-row bg-white border border-slate-100 rounded-[24px] overflow-hidden shadow-sm group cursor-pointer hover:shadow-lg transition-all border-l-4 border-l-blue-600"
                    onClick={() => navigate(`/articles/${article._id}`)}
                  >
                    <div className="w-full sm:w-48 h-40 sm:h-auto overflow-hidden">
                      <img
                        src={article.featureImage ? (article.featureImage.startsWith('http') || article.featureImage.startsWith('data:') ? article.featureImage : `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}${article.featureImage}`) : storyImage}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-center">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                        {article.author?.doctorDetails?.salutation || 'Dr.'} {article.author?.name} | {article.readTime || '5 min'} read
                      </div>
                      <h4 className="text-base font-bold text-slate-900 mb-2 leading-tight group-hover:text-blue-600 transition-colors line-clamp-1">{article.title}</h4>
                      <p className="text-sm text-slate-500 mb-4 leading-relaxed line-clamp-2">{article.summary || article.content?.substring(0, 120) + '...'}</p>
                      <button className="flex items-center gap-1.5 text-blue-600 font-bold text-sm hover:translate-x-1 transition-all self-start">
                        Read article
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 bg-white rounded-3xl border border-dashed border-slate-200 text-center text-slate-400 font-medium">
                  Loading latest insights...
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          <section className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4">Today's Schedule</h3>
            <div className="text-center py-4">
              <div className="mb-6 flex justify-center">
                <svg width="80" height="80" viewBox="0 0 100 100">
                  <rect x="10" y="20" width="80" height="70" rx="8" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="2" />
                  <rect x="10" y="20" width="80" height="20" rx="8" fill="#3B82F6" />
                  <circle cx="80" cy="70" r="12" fill="#10B981" />
                  <path d="M74 70l4 4 8-8" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h4 className="font-bold text-slate-900 mb-1 leading-tight">No appointments today</h4>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">You're all set! Check-ups help you stay ahead of health issues.</p>
              <button className="w-full py-3.5 bg-blue-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 hover:-translate-y-0.5 mb-4">Book a check-up</button>
              <button className="flex items-center justify-center gap-1.5 w-full text-slate-400 font-bold text-xs hover:text-slate-600 transition-colors uppercase tracking-widest">
                View full calendar
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </section>



          <section className="bg-amber-50 border border-amber-100 rounded-[24px] p-6 shadow-sm">
            <h3 className="text-base font-bold text-amber-900 flex items-center gap-2 mb-2">You're doing great!
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2.5" className="animate-bounce">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </h3>
            <p className="text-xs text-amber-800/70 font-medium mb-6">Consistency is the key to a healthier you. Keep it up!</p>

            <div className="flex justify-between items-center mb-6">
              <div className="flex flex-col items-center gap-2">
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <svg width="80" height="80" viewBox="0 0 100 100" className="-rotate-90">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#FEF3C7" strokeWidth="8" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#F59E0B" strokeWidth="8" strokeDasharray="150 251" strokeLinecap="round" className="animate-dash" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-bold text-amber-900">4/7</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-amber-800/60 uppercase tracking-widest text-center">Goals done</span>
              </div>
              <img src={exerciseImg} alt="Exercise" className="w-24 h-auto object-contain drop-shadow-md animate-float" />
            </div>

            <button className="flex items-center gap-1.5 text-amber-900 font-bold text-xs hover:gap-2 transition-all uppercase tracking-widest">
              View all goals
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </section>

          {/* Support Section */}
          <section className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-[24px] p-6 shadow-sm">
            <div className="flex gap-4 items-start">
              <div className="relative flex-shrink-0">
                <img src={doctorAvatar} alt="Doctor" className="w-14 h-14 rounded-full border-4 border-white shadow-md" />
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
              </div>
              <div className="flex flex-col gap-1">
                <h4 className="text-sm font-bold text-blue-900 leading-tight">Need help?</h4>
                <p className="text-[11px] text-blue-800/60 font-medium leading-relaxed mb-3">Our care team is available 24/7 for you.</p>
                <button 
                  onClick={() => setShowChatBox(true)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-[11px] font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all self-start"
                >
                  Contact Support
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Modern Chatbox Popup */}
      {showChatBox && (
        <div className="fixed bottom-6 right-6 w-[320px] sm:w-[350px] bg-white rounded-[32px] shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 z-[100]">
          {/* Header */}
          <div className="bg-blue-600 p-6 flex items-center justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            <div className="flex items-center gap-3 relative z-10">
              <div className="relative">
                <img src={doctorAvatar} alt="Support" className="w-10 h-10 rounded-full border-2 border-blue-400/50 bg-white" />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-blue-600 rounded-full"></div>
              </div>
              <div>
                <h4 className="text-white text-sm font-bold leading-tight">Support Care</h4>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                  <span className="text-blue-100 text-[10px] font-medium tracking-wide">Always Online</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setShowChatBox(false)} 
              className="text-white/60 hover:text-white transition-all bg-white/10 p-1.5 rounded-full relative z-10"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-6 bg-slate-50/50 min-h-[320px] flex flex-col gap-4 overflow-y-auto">
            <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 self-start max-w-[90%] transform transition-all animate-in fade-in slide-in-from-left-2">
              <p className="text-xs text-slate-800 leading-relaxed font-bold">Hi {userData?.name?.split(' ')[0] || 'there'}, 👋</p>
              <p className="text-xs text-slate-600 leading-relaxed mt-2 font-medium">We're currently working on our AI Chatbot to provide you with 24/7 instant medical guidance.</p>
              <p className="text-xs text-slate-600 leading-relaxed mt-2 font-medium">Stay tuned for a more seamless care experience!</p>
              <div className="flex items-center justify-between mt-4">
                <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Hamro Care Team</span>
                <span className="text-[9px] text-slate-300 font-bold">Just now</span>
              </div>
            </div>
          </div>

          {/* Footer Area */}
          <div className="p-4 bg-white border-t border-slate-100">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 opacity-60 cursor-not-allowed group transition-all">
              <span className="text-xs text-slate-400 font-bold flex-1 italic">Chatbot coming soon...</span>
              <button className="text-slate-300 transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              </button>
            </div>
            <p className="text-center text-[9px] text-slate-300 font-bold mt-3 uppercase tracking-tighter">Powered by Hamro Doctor Intelligence</p>
          </div>
        </div>
      )}

      {/* BMI Health Plan Modal Overlay */}
      {showHealthPlanModal && (() => {
        const plan = getBmiPlan(bmi);
        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4 transition-all duration-300 animate-in fade-in">
            <div className="bg-white rounded-[32px] shadow-2xl border border-slate-100 w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
              {/* Modal Banner Header */}
              <div className={`bg-gradient-to-br ${plan.bgGradient} p-6 text-white relative overflow-hidden flex-shrink-0`}>
                <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full -mr-12 -mt-12 blur-2xl"></div>
                <div className="flex justify-between items-start relative z-10">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">{plan.badge}</span>
                    <h3 className="text-xl font-bold mt-2.5 leading-tight">{plan.category} Plan</h3>
                    <p className="text-white/80 text-xs font-medium mt-1">Your BMI: <strong className="text-white font-bold">{bmi} kg/m²</strong></p>
                  </div>
                  <button 
                    onClick={() => setShowHealthPlanModal(false)}
                    className="text-white/80 hover:text-white transition-all bg-white/10 hover:bg-white/20 p-2 rounded-full"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal Content - Scrollable */}
              <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50 flex flex-col gap-4">
                <div className={`${plan.bgColor} border ${plan.borderColor} p-4 rounded-2xl`}>
                  <p className={`text-xs ${plan.textColor} leading-relaxed font-medium`}>{plan.summary}</p>
                </div>

                <div className="flex flex-col gap-3">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Personalized Guidelines</h4>
                  {plan.plans.map((item, idx) => (
                    <div key={idx} className="bg-white border border-slate-100 p-5 rounded-2xl flex items-start gap-4 shadow-sm hover:shadow-md transition-all group">
                      <div className="flex-shrink-0 mt-1.5 flex items-center justify-center">
                        <span className={`w-2.5 h-2.5 rounded-full transition-all duration-300 group-hover:scale-125 bg-${plan.color === 'emerald' ? 'emerald' : plan.color === 'amber' ? 'amber' : plan.color === 'orange' ? 'orange' : plan.color === 'red' ? 'red' : 'slate'}-500 shadow-sm`}></span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="text-xs font-bold text-slate-800 mb-1">{item.title}</h5>
                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-5 bg-white border-t border-slate-100 flex-shrink-0 flex gap-3">
                {bmi > 0 && bmi !== '0.00' && (
                  <button 
                    onClick={() => {
                      setShowHealthPlanModal(false);
                      document.getElementById('specialists-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="flex-1 py-3 bg-blue-50 text-blue-600 rounded-2xl text-xs font-bold transition-all hover:bg-blue-600 hover:text-white"
                  >
                    Consult a Nutritionist
                  </button>
                )}
                <button 
                  onClick={() => setShowHealthPlanModal(false)}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-2xl text-xs font-bold shadow-lg shadow-blue-200 transition-all hover:bg-blue-700"
                >
                  Got it, thanks!
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </main>
  );
};

export default Dashboard;
