import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import Peer from 'simple-peer';

const Chat = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [consultation, setConsultation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || {});
  const [loading, setLoading] = useState(true);
  
  // Call States
  const [calling, setCalling] = useState(false);
  const [receivingCall, setReceivingCall] = useState(false);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callerSignal, setCallerSignal] = useState(null);
  const [stream, setStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callStatus, setCallStatus] = useState('');
  const [callType, setCallType] = useState('audio');
  const [callTimer, setCallTimer] = useState(0);

  // Prescription states
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [prescriptionForm, setPrescriptionForm] = useState({ diagnosis: '', advice: '' });
  const [prescriptionMedicines, setPrescriptionMedicines] = useState([
    { name: '', strength: '', dosage: '', frequency: '', duration: '', instruction: '' }
  ]);
  const [prescriptionSubmitting, setPrescriptionSubmitting] = useState(false);
  const [prescriptionSuccess, setPrescriptionSuccess] = useState(false);

  const timerRef = useRef(null);
  const socketRef = useRef();
  const messagesEndRef = useRef(null);
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const connectionRef = useRef();
  const streamRef = useRef();

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
  const apiVersion = import.meta.env.VITE_API_VERSION || 'v1';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchConsultation = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${apiUrl}/api/${apiVersion}/consultations/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
          setConsultation(data.consultation);
          setMessages(data.consultation.messages || []);
        }
      } catch (error) {
        console.error('Error fetching consultation:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConsultation();

    socketRef.current = io(apiUrl);
    
    socketRef.current.on('connect', () => {
      socketRef.current.emit('join_consultation', id);
    });

    socketRef.current.on('receive_message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socketRef.current.on('call_signal', (data) => {
      if (data.type === 'offer') {
        setReceivingCall(true);
        setCallerSignal(data.signal);
        setCallType(data.callType || 'audio');
      } else if (data.type === 'answer') {
        setCallAccepted(true);
        connectionRef.current.signal(data.signal);
      }
    });

    socketRef.current.on('reject_call', () => {
      setCallStatus('Call Rejected');
      setTimeout(() => {
        setCalling(false);
        setCallStatus('');
      }, 3000);
    });

    socketRef.current.on('end_call', () => {
      cleanupCall();
    });

    return () => {
      socketRef.current.disconnect();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [id, apiUrl, apiVersion]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageData = {
      consultationId: id,
      senderId: user._id,
      text: newMessage,
      timestamp: new Date()
    };

    socketRef.current.emit('send_message', messageData);
    setNewMessage('');
  };

  const startCall = async (type) => {
    try {
      setCallType(type);
      const constraints = { 
        audio: true, 
        video: type === 'video' ? { width: 1280, height: 720 } : false 
      };
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      streamRef.current = mediaStream;
      setCalling(true);
      setCallStatus(type === 'video' ? 'Starting Video Call...' : 'Calling...');

      const peer = new Peer({
        initiator: true,
        trickle: false,
        stream: mediaStream,
        config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }
      });

      peer.on('signal', (data) => {
        socketRef.current.emit('call_signal', {
          consultationId: id,
          type: 'offer',
          callType: type,
          signal: data,
          from: user._id
        });
      });

      peer.on('stream', (remoteStream) => {
        setRemoteStream(remoteStream);
      });

      connectionRef.current = peer;
    } catch (err) {
      console.error('Error accessing devices:', err);
      alert('Could not access microphone/camera.');
    }
  };

  const answerCall = async () => {
    try {
      const constraints = { 
        audio: true, 
        video: callType === 'video' ? { width: 1280, height: 720 } : false 
      };
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      streamRef.current = mediaStream;

      const peer = new Peer({
        initiator: false,
        trickle: false,
        stream: mediaStream,
        config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }
      });

      setCallAccepted(true);
      setReceivingCall(false);

      peer.on('signal', (data) => {
        socketRef.current.emit('call_signal', {
          consultationId: id,
          type: 'answer',
          signal: data,
          from: user._id
        });
      });

      peer.on('stream', (remoteStream) => {
        setRemoteStream(remoteStream);
      });

      peer.signal(callerSignal);
      connectionRef.current = peer;
    } catch (err) {
      console.error('Error answering call:', err);
    }
  };

  const rejectCall = () => {
    socketRef.current.emit('reject_call', { consultationId: id });
    setReceivingCall(false);
  };

  const cleanupCall = () => {
    setCalling(false);
    setReceivingCall(false);
    setCallAccepted(false);
    setCallStatus('');
    setCallTimer(0);
    clearInterval(timerRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setStream(null);
    if (connectionRef.current) {
      connectionRef.current.destroy();
    }
    setRemoteStream(null);
  };

  const toggleMute = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);
    }
  };

  const toggleVideo = () => {
    if (stream && callType === 'video') {
      const videoTrack = stream.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOff(!videoTrack.enabled);
    }
  };

  const endCall = () => {
    socketRef.current.emit('end_call', { consultationId: id });
    cleanupCall();
  };

  // Sync streams with video elements
  useEffect(() => {
    if (stream && localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
  }, [stream, calling, callAccepted]);

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, calling, callAccepted]);

  const MAX_CALL_SECONDS = 15 * 60;

  useEffect(() => {
    if (callAccepted && callType === 'video') {
      setCallTimer(0);
      timerRef.current = setInterval(() => {
        setCallTimer(prev => {
          const next = prev + 1;
          if (next >= MAX_CALL_SECONDS) {
            clearInterval(timerRef.current);
            socketRef.current?.emit('end_call', { consultationId: id });
            cleanupCall();
            alert('Video call ended: 15-minute session limit reached.');
            return MAX_CALL_SECONDS;
          }
          return next;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [callAccepted, callType]);

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleAddMedicine = () => {
    setPrescriptionMedicines(prev => [...prev, { name: '', strength: '', dosage: '', frequency: '', duration: '', instruction: '' }]);
  };

  const handleRemoveMedicine = (index) => {
    setPrescriptionMedicines(prev => prev.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (index, field, value) => {
    setPrescriptionMedicines(prev => prev.map((m, i) => i === index ? { ...m, [field]: value } : m));
  };

  const handleSubmitPrescription = async (e) => {
    e.preventDefault();
    setPrescriptionSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${apiUrl}/api/${apiVersion}/prescriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          consultationId: id,
          patientId: consultation.patient?._id,
          diagnosis: prescriptionForm.diagnosis,
          medicines: prescriptionMedicines.filter(m => m.name.trim()),
          advice: prescriptionForm.advice,
        })
      });
      if (res.ok) {
        setPrescriptionSuccess(true);
        setTimeout(() => {
          setPrescriptionSuccess(false);
          setShowPrescriptionModal(false);
        }, 2000);
      }
    } catch (err) {
      console.error('Prescription error:', err);
    } finally {
      setPrescriptionSubmitting(false);
    }
  };

  if (loading) return <div className="loading-state">Loading chat...</div>;
  if (!consultation) return <div className="error-state">Consultation not found</div>;

  const isDoctor = user.role === 'doctor';
  const otherParty = isDoctor ? consultation.patient : consultation.doctor;

  return (
    <main className="flex-1 ml-[280px] h-screen bg-slate-50 font-['Poppins'] flex flex-col items-center py-6 px-4">
      <div className="w-full max-w-[900px] flex-1 bg-white flex flex-col rounded-2xl shadow-xl border border-slate-100 overflow-hidden relative">
        {/* Header */}
        <header className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white z-20">
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-slate-50 rounded-full text-slate-400" onClick={() => navigate(-1)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold">{otherParty?.name?.charAt(0)}</div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">{isDoctor ? otherParty?.name : `Dr. ${otherParty?.name}`}</h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{consultation.status}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!calling && !callAccepted && !receivingCall && (
              <div className="flex gap-2">
                <button className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all" onClick={() => startCall('audio')}>
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                </button>
                <button className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all" onClick={() => startCall('video')}>
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                </button>
                {isDoctor && (
                  <button className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-all border border-emerald-100" onClick={() => setShowPrescriptionModal(true)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                  </button>
                )}
              </div>
            )}
            {(calling || callAccepted) && (
              <div className="flex items-center gap-2 bg-slate-900 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-xl">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                <span>{formatTimer(callTimer)}</span>
                <button className="ml-2 text-white/60 hover:text-white" onClick={endCall}>✕</button>
              </div>
            )}
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 flex flex-col gap-4">
          <div className="text-center mb-4">
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Digital Care Session</span>
          </div>
          {messages.map((msg, index) => {
            const isMe = msg.sender === user._id || msg.senderId === user._id;
            return (
              <div key={index} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm relative shadow-sm ${isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'}`}>
                  {msg.text}
                  <span className={`block text-[9px] mt-1 text-right ${isMe ? 'text-blue-200' : 'text-slate-400'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form className="p-4 bg-white border-t border-slate-100 flex items-center gap-3" onSubmit={handleSendMessage}>
          <input 
            type="text" 
            placeholder="Type your message..." 
            className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button type="submit" className={`p-3 rounded-xl transition-all ${!newMessage.trim() ? 'bg-slate-100 text-slate-300' : 'bg-blue-600 text-white shadow-lg shadow-blue-200'}`} disabled={!newMessage.trim()}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </form>        {/* Call Overlay - Messenger Style */}
        {(calling || callAccepted) && (
          <div className="absolute inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
             {callType === 'video' ? (
               <>
                 {/* Remote Video */}
                 <video 
                   ref={remoteVideoRef} 
                   autoPlay 
                   playsInline 
                   className={`w-full h-full object-cover transition-opacity duration-500 ${remoteStream ? 'opacity-100' : 'opacity-0'}`} 
                 />
                 
                 {/* Remote Placeholder (while connecting) */}
                 {!remoteStream && (
                   <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800">
                     <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-3xl font-bold text-white animate-pulse mb-4">
                       {otherParty?.name?.charAt(0)}
                     </div>
                     <p className="text-white font-bold tracking-wider animate-pulse">{callStatus || 'Connecting Video...'}</p>
                   </div>
                 )}

                 {/* Local Video - PiP */}
                 <div className="absolute top-6 right-6 w-32 h-48 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl z-50 bg-slate-800">
                   <video 
                     ref={localVideoRef} 
                     autoPlay 
                     playsInline 
                     muted 
                     className="w-full h-full object-cover scale-x-[-1]" 
                   />
                 </div>
               </>
             ) : (
               /* Audio Call View */
               <div className="flex flex-col items-center">
                 <div className="w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-2xl mb-8 relative">
                   <div className="absolute inset-0 rounded-full border-4 border-blue-500 animate-ping opacity-25"></div>
                   {otherParty?.name?.charAt(0)}
                 </div>
                 <h2 className="text-2xl font-bold text-white mb-2">{isDoctor ? otherParty?.name : `Dr. ${otherParty?.name}`}</h2>
                 <p className="text-blue-400 font-bold tracking-widest uppercase text-xs mb-8">{callAccepted ? formatTimer(callTimer) : (callStatus || 'Calling...')}</p>
                 
                 {/* Dummy Audio for ref if needed */}
                 <audio ref={remoteVideoRef} autoPlay className="hidden" />
               </div>
             )}

             {/* Integrated Controls */}
             <div className="absolute bottom-12 flex items-center gap-6 px-8 py-4 bg-white/10 backdrop-blur-xl rounded-full border border-white/10 shadow-2xl">
                <button 
                  className={`w-14 h-14 flex items-center justify-center rounded-full transition-all ${isMuted ? 'bg-red-500 text-white shadow-lg shadow-red-500/40' : 'bg-white/10 text-white hover:bg-white/20'}`} 
                  onClick={toggleMute}
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
                  )}
                </button>

                {callType === 'video' && (
                  <button 
                    className={`w-14 h-14 flex items-center justify-center rounded-full transition-all ${isVideoOff ? 'bg-red-500 text-white shadow-lg shadow-red-500/40' : 'bg-white/10 text-white hover:bg-white/20'}`} 
                    onClick={toggleVideo}
                    title={isVideoOff ? "Turn Video On" : "Turn Video Off"}
                  >
                    {isVideoOff ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34M23 7l-7 5 7 5M1 1l22 22"/></svg>
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                    )}
                  </button>
                )}

                <button 
                  className="w-16 h-16 flex items-center justify-center bg-red-500 text-white rounded-full hover:bg-red-600 shadow-xl shadow-red-500/40 hover:-translate-y-1 active:translate-y-0 transition-all" 
                  onClick={endCall}
                  title="Hang Up"
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" style={{transform: 'rotate(135deg)', transformOrigin: 'center'}}/></svg>
                </button>
             </div>
          </div>
        )}

        {/* Incoming Call Modal */}
        {receivingCall && (
          <div className="absolute inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="bg-white rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">{otherParty?.name?.charAt(0)}</div>
              <h3 className="font-bold text-lg mb-2">Incoming {callType} Call</h3>
              <p className="text-sm text-slate-500 mb-8">{otherParty?.name} is calling...</p>
              <div className="flex gap-4">
                <button className="flex-1 bg-emerald-500 text-white py-3 rounded-xl font-bold" onClick={answerCall}>Accept</button>
                <button className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold" onClick={rejectCall}>Decline</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Prescription Modal */}
      {showPrescriptionModal && (
        <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="px-6 py-4 border-b flex items-center justify-between bg-slate-50">
              <h3 className="font-bold">Issue Prescription</h3>
              <button onClick={() => setShowPrescriptionModal(false)}>✕</button>
            </div>
            {prescriptionSuccess ? (
              <div className="p-12 text-center text-emerald-600 font-bold">Prescription Sent Successfully!</div>
            ) : (
              <form className="p-6 overflow-y-auto flex flex-col gap-6" onSubmit={handleSubmitPrescription}>
                 <textarea className="w-full bg-slate-50 border rounded-xl p-4 text-sm" placeholder="Diagnosis..." value={prescriptionForm.diagnosis} onChange={(e) => setPrescriptionForm({...prescriptionForm, diagnosis: e.target.value})} required rows={2} />
                 {prescriptionMedicines.map((med, i) => (
                   <div key={i} className="flex gap-2 items-center bg-slate-50 p-3 rounded-xl">
                      <input className="flex-1 bg-white border rounded-lg px-2 py-1.5 text-xs" placeholder="Medicine Name" value={med.name} onChange={(e) => handleMedicineChange(i, 'name', e.target.value)} required />
                      <button type="button" onClick={() => handleRemoveMedicine(i)}>✕</button>
                   </div>
                 ))}
                 <button type="button" className="text-blue-600 text-xs font-bold" onClick={handleAddMedicine}>+ Add More</button>
                 <button type="submit" className="w-full bg-emerald-500 text-white py-3 rounded-xl font-bold shadow-lg" disabled={prescriptionSubmitting}>Send Prescription</button>
              </form>
            )}
          </div>
        </div>
      )}

      {(!callAccepted || callType !== 'video') && (
        <audio ref={remoteVideoRef} autoPlay />
      )}
    </main>
  );
};

export default Chat;
