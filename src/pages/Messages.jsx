import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import Peer from 'simple-peer';

const Messages = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || {});
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  
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
  const [currentSessionId, setCurrentSessionId] = useState(null);

  // Prescription states
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [prescriptionForm, setPrescriptionForm] = useState({ diagnosis: '', advice: '' });
  const [prescriptionMedicines, setPrescriptionMedicines] = useState([
    { name: '', strength: '', dosage: '', frequency: '', duration: '', instruction: '' }
  ]);
  const [prescriptionSubmitting, setPrescriptionSubmitting] = useState(false);
  const [prescriptionSuccess, setPrescriptionSuccess] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  
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

  // Initial load: Fetch all consultations (conversations)
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${apiUrl}/api/${apiVersion}/consultations`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
          // Filter only active consultations for the messenger view
          const activeCons = data.consultations.filter(c => c.status === 'active');
          setConversations(activeCons);
          
          // Optionally select the first one if it exists
          if (activeCons.length > 0) {
            handleSelectChat(activeCons[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
    socketRef.current = io(apiUrl);
    
    socketRef.current.on('connect', () => {
      setSocketConnected(true);
      if (selectedChat) {
        socketRef.current.emit('join_consultation', selectedChat._id);
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  // Handle chat selection
  const handleSelectChat = async (consultation) => {
    setChatLoading(true);
    setSelectedChat(consultation);
    
    // Join the socket room for this consultation
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('join_consultation', consultation._id);
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/${apiVersion}/consultations/${consultation._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setMessages(data.consultation.messages || []);
      }
    } catch (error) {
      console.error('Error loading chat:', error);
    } finally {
      setChatLoading(false);
    }
  };

  // Listen for incoming messages and signals
  useEffect(() => {
    if (!socketRef.current || !socketConnected) return;

    const socket = socketRef.current;

    socket.on('receive_message', (message) => {
      if (selectedChat && String(message.consultationId) === String(selectedChat._id)) {
        // Avoid adding my own message again since it's added optimistically
        const isMe = String(message.sender) === String(user._id) || String(message.senderId) === String(user._id);
        if (!isMe) {
          setMessages((prev) => [...prev, message]);
        }
      }
      
      // Update the last message in the conversation list
      setConversations(prev => prev.map(c => 
        c._id === message.consultationId 
          ? { ...c, lastMessage: message.text, lastMessageTime: message.timestamp }
          : c
      ));
    });

    socket.on('call_signal', (data) => {
      if (data.type === 'offer') {
        setReceivingCall(true);
        setCallerSignal(data.signal);
        setCallType(data.callType || 'audio');
      } else if (data.type === 'answer') {
        setCallAccepted(true);
        if (connectionRef.current) {
          connectionRef.current.signal(data.signal);
        }
      }
    });

    socket.on('reject_call', () => {
      setCallStatus('Call Rejected');
      setTimeout(() => {
        setCalling(false);
        setCallStatus('');
      }, 3000);
    });

    socket.on('end_call', () => {
      cleanupCall();
    });

    return () => {
      socket.off('receive_message');
      socket.off('call_signal');
      socket.off('reject_call');
      socket.off('end_call');
    };
  }, [selectedChat, socketConnected]);

  const startCall = async (type) => {
    if (!selectedChat) return;
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
          consultationId: selectedChat._id,
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
      recordCallSession(type);
    } catch (err) {
      console.error('Error accessing devices:', err);
      alert('Could not access microphone/camera.');
    }
  };

  const answerCall = async () => {
    if (!selectedChat) return;
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
          consultationId: selectedChat._id,
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
      recordCallSession(callType);
    } catch (err) {
      console.error('Error answering call:', err);
    }
  };

  const recordCallSession = async (type) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${apiUrl}/api/${apiVersion}/consultations/${selectedChat._id}/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ type })
      });
      const data = await res.json();
      if (data.success) {
        setCurrentSessionId(data.session._id);
      }
    } catch (error) {
      console.error('Error recording session:', error);
    }
  };

  const finalizeCallSession = async () => {
    if (!currentSessionId || !selectedChat) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${apiUrl}/api/${apiVersion}/consultations/${selectedChat._id}/session/${currentSessionId}/finish`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setCurrentSessionId(null);
    } catch (error) {
      console.error('Error finalizing session:', error);
    }
  };

  const cleanupCall = () => {
    setCalling(false);
    setReceivingCall(false);
    setCallAccepted(false);
    setCallStatus('');
    setCallTimer(0);
    clearInterval(timerRef.current);
    
    if (currentSessionId) {
      finalizeCallSession();
    }

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

  const endCall = () => {
    socketRef.current.emit('end_call', { consultationId: selectedChat._id });
    cleanupCall();
  };

  const rejectCall = () => {
    socketRef.current.emit('reject_call', { consultationId: selectedChat._id });
    setReceivingCall(false);
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
            socketRef.current?.emit('end_call', { consultationId: selectedChat._id });
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
          consultationId: selectedChat._id,
          patientId: selectedChat.patient?._id,
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

  const handleCompleteConsultation = async () => {
    if (!selectedChat) return;
    if (!window.confirm('Are you sure you want to finish this consultation? This will close the session.')) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${apiUrl}/api/${apiVersion}/consultations/${selectedChat._id}/complete`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        setSelectedChat(prev => ({ ...prev, status: 'completed' }));
        setConversations(prev => prev.filter(c => c._id !== selectedChat._id));
        alert('Consultation marked as completed.');
      }
    } catch (error) {
      console.error('Error completing consultation:', error);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    const messageData = {
      consultationId: selectedChat._id,
      senderId: user._id,
      text: newMessage,
      timestamp: new Date()
    };

    socketRef.current.emit('send_message', messageData);
    
    // Optimistic UI update for the chat window
    setMessages(prev => [...prev, {
      ...messageData,
      sender: user._id, // Add sender for immediate styling
      isOptimistic: true 
    }]);

    setNewMessage('');
    
    // Optimistic UI update for the conversation list
    setConversations(prev => prev.map(c => 
      c._id === selectedChat._id 
        ? { ...c, lastMessage: newMessage, lastMessageTime: new Date() }
        : c
    ));
  };

  if (loading) {
    return (
      <div className="flex-1 lg:ml-[280px] h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const isDoctor = user.role === 'doctor';
  const otherParty = selectedChat ? (isDoctor ? selectedChat.patient : selectedChat.doctor) : null;

  return (
    <main className="flex-1 lg:ml-[280px] h-screen max-h-screen flex bg-white font-['Poppins'] overflow-hidden relative">
      {/* Sidebar - Conversations List */}
      <aside className={`w-full lg:w-[350px] border-r border-slate-100 flex flex-col bg-white h-full overflow-hidden ${selectedChat ? 'hidden lg:flex' : 'flex'}`}>
        <div className="p-6 border-b border-slate-50">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-4">Messages</h1>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="w-full bg-slate-50 border-none rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No active conversations</div>
          ) : (
            conversations.map((con) => {
              const other = isDoctor ? con.patient : con.doctor;
              const isActive = selectedChat?._id === con._id;
              return (
                <div 
                  key={con._id} 
                  onClick={() => handleSelectChat(con)}
                  className={`px-4 py-4 cursor-pointer transition-all flex items-center gap-4 border-b border-slate-50/50 ${isActive ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}
                >
                  <div className="relative">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center font-bold shadow-sm">
                      {other?.name?.charAt(0)}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-0.5">
                      <h3 className="text-sm font-bold text-slate-900 truncate">{isDoctor ? other?.name : `Dr. ${other?.name}`}</h3>
                      <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                        {con.lastMessageTime ? new Date(con.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate font-medium">
                      {con.lastMessage || 'Start a conversation...'}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* Main Chat Area */}
      <section className={`flex-1 flex flex-col bg-slate-50 min-h-0 ${!selectedChat ? 'hidden lg:flex' : 'flex'}`}>
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <header className="px-4 lg:px-8 py-4 bg-white border-b border-slate-100 flex items-center justify-between shadow-sm z-10 flex-shrink-0">
              <div className="flex items-center gap-3 lg:gap-4">
                <button 
                  onClick={() => setSelectedChat(null)}
                  className="lg:hidden p-2 text-slate-400 hover:bg-slate-50 rounded-xl"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline>
                  </svg>
                </button>
                <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold shadow-lg shadow-blue-100">
                  {(isDoctor ? selectedChat.patient?.name : selectedChat.doctor?.name)?.charAt(0)}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    {isDoctor ? selectedChat.patient?.name : `Dr. ${selectedChat.doctor?.name}`}
                  </h2>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Active Session</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!calling && !callAccepted && !receivingCall && (
                  <div className="flex gap-2">
                    <button 
                      className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all border border-blue-100" 
                      onClick={() => startCall('audio')}
                      title="Audio Call"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                      </svg>
                    </button>
                    <button 
                      className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all border border-blue-100" 
                      onClick={() => startCall('video')}
                      title="Video Call"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                      </svg>
                    </button>
                  </div>
                )}
                {(calling || callAccepted) && (
                  <div className="flex items-center gap-2 bg-slate-900 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-xl">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    <span>{formatTimer(callTimer)}</span>
                    <button className="ml-2 text-white/60 hover:text-white" onClick={endCall}>✕</button>
                  </div>
                )}
                
                {/* More Options Dropdown */}
                {isDoctor && !calling && !callAccepted && (
                  <div className="relative">
                    <button 
                      className={`p-2.5 rounded-xl transition-all ${showMoreMenu ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'}`}
                      onClick={() => setShowMoreMenu(!showMoreMenu)}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle>
                      </svg>
                    </button>

                    {showMoreMenu && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
                        <button 
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                          onClick={() => { setShowPrescriptionModal(true); setShowMoreMenu(false); }}
                        >
                          <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                          </span>
                          Issue Prescription
                        </button>
                        {selectedChat.status === 'active' && (
                          <button 
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors border-t border-slate-50"
                            onClick={() => { handleCompleteConsultation(); setShowMoreMenu(false); }}
                          >
                            <span className="p-1.5 bg-red-50 text-red-600 rounded-lg">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/></svg>
                            </span>
                            Finish Consultation
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </header>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-8 flex flex-col gap-4 min-h-0 scroll-smooth">
              {chatLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-8 h-8 border-3 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">Conversation Started</span>
                  </div>
                  {messages.map((msg, index) => {
                    const isMe = msg.sender === user._id || msg.senderId === user._id;
                    return (
                      <div key={index} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] px-5 py-3 rounded-2xl text-sm shadow-sm relative ${isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'}`}>
                          {msg.text}
                          <div className={`text-[9px] mt-1 text-right ${isMe ? 'text-blue-200' : 'text-slate-400'}`}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Chat Input */}
            <footer className="p-4 lg:p-6 bg-white border-t border-slate-100 flex-shrink-0">
              <form onSubmit={handleSendMessage} className="flex items-center gap-4 bg-slate-50 rounded-2xl p-2 pr-3 border border-slate-100 focus-within:border-blue-500/50 transition-all">
                <button type="button" className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                  </svg>
                </button>
                <input 
                  type="text" 
                  placeholder="Aa" 
                  className="flex-1 bg-transparent border-none outline-none text-sm py-2 font-medium"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button 
                  type="submit" 
                  disabled={!newMessage.trim()}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${newMessage.trim() ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
              </form>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
            <div className="w-24 h-24 bg-blue-50 text-blue-400 rounded-full flex items-center justify-center mb-6">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-2">Select a conversation</h2>
            <p className="text-slate-500 text-sm max-w-[300px]">Choose from your existing consultations to start messaging.</p>
          </div>
        )}
      </section>

      {/* Call Overlay */}
      {(calling || callAccepted) && (
        <div className="absolute inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
           {callType === 'video' ? (
             <>
               <video ref={remoteVideoRef} autoPlay playsInline className={`w-full h-full object-cover transition-opacity duration-500 ${remoteStream ? 'opacity-100' : 'opacity-0'}`} />
               {!remoteStream && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800">
                   <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-3xl font-bold text-white animate-pulse mb-4">
                     {otherParty?.name?.charAt(0)}
                   </div>
                   <p className="text-white font-bold tracking-wider animate-pulse">{callStatus || 'Connecting Video...'}</p>
                 </div>
               )}
               <div className="absolute top-6 right-6 w-32 h-48 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl z-50 bg-slate-800">
                 <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
               </div>
             </>
           ) : (
             <div className="flex flex-col items-center">
               <div className="w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-2xl mb-8 relative">
                 <div className="absolute inset-0 rounded-full border-4 border-blue-500 animate-ping opacity-25"></div>
                 {otherParty?.name?.charAt(0)}
               </div>
               <h2 className="text-2xl font-bold text-white mb-2">{isDoctor ? otherParty?.name : `Dr. ${otherParty?.name}`}</h2>
               <p className="text-blue-400 font-bold tracking-widest uppercase text-xs mb-8">{callAccepted ? formatTimer(callTimer) : (callStatus || 'Calling...')}</p>
               <audio ref={remoteVideoRef} autoPlay className="hidden" />
             </div>
           )}
           <div className="absolute bottom-12 flex items-center gap-6 px-8 py-4 bg-white/10 backdrop-blur-xl rounded-full border border-white/10 shadow-2xl">
              <button className={`w-14 h-14 flex items-center justify-center rounded-full transition-all ${isMuted ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`} onClick={toggleMute}>
                {isMuted ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
                )}
              </button>
              {callType === 'video' && (
                <button className={`w-14 h-14 flex items-center justify-center rounded-full transition-all ${isVideoOff ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`} onClick={toggleVideo}>
                  {isVideoOff ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34M23 7l-7 5 7 5M1 1l22 22"/></svg>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                  )}
                </button>
              )}
              <button className="w-16 h-16 flex items-center justify-center bg-red-500 text-white rounded-full hover:bg-red-600 shadow-xl" onClick={endCall}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{transform: 'rotate(135deg)', transformOrigin: 'center'}}><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" /></svg>
              </button>
           </div>
        </div>
      )}

      {/* Incoming Call Modal */}
      {receivingCall && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6">
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
        <audio ref={remoteVideoRef} autoPlay className="hidden" />
      )}
    </main>
  );
};

export default Messages;
