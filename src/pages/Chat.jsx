import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import Peer from 'simple-peer';
import '../styles/Chat.css';

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
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callStatus, setCallStatus] = useState('');
  const [callType, setCallType] = useState('audio'); // 'audio' or 'video'
  const [callTimer, setCallTimer] = useState(0); // seconds elapsed

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
          headers: {
            'Authorization': `Bearer ${token}`
          }
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

    // Socket setup
    socketRef.current = io(apiUrl);
    
    socketRef.current.on('connect', () => {
      console.log('Socket connected, joining consultation:', id);
      socketRef.current.emit('join_consultation', id);
    });

    socketRef.current.on('receive_message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    // Call signaling listeners
    socketRef.current.on('call_signal', (data) => {
      console.log('Call signal received:', data.type, 'from:', data.from);
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
      if (stream) stream.getTracks().forEach(track => track.stop());
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

  // Call Functions
  const startCall = async (type) => {
    try {
      setCallType(type);
      const constraints = { 
        audio: true, 
        video: type === 'video' ? { width: 1280, height: 720 } : false 
      };
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setCalling(true);
      setCallStatus(type === 'video' ? 'Starting Video Call...' : 'Calling...');

      if (type === 'video' && localVideoRef.current) {
        localVideoRef.current.srcObject = mediaStream;
      }

      if (typeof Peer === 'undefined') {
        throw new Error('Peer library not loaded correctly');
      }

      const peer = new Peer({
        initiator: true,
        trickle: false,
        stream: mediaStream,
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
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      });

      connectionRef.current = peer;
    } catch (err) {
      console.error('Error accessing devices:', err);
      alert('Could not access microphone/camera. Please ensure you have given permission.');
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
      setCallAccepted(true);
      setReceivingCall(false);

      if (callType === 'video' && localVideoRef.current) {
        localVideoRef.current.srcObject = mediaStream;
      }

      if (typeof Peer === 'undefined') {
        throw new Error('Peer library not loaded correctly');
      }

      const peer = new Peer({
        initiator: false,
        trickle: false,
        stream: mediaStream,
      });

      peer.on('signal', (data) => {
        socketRef.current.emit('call_signal', {
          consultationId: id,
          type: 'answer',
          signal: data,
          from: user._id
        });
      });

      peer.on('stream', (remoteStream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
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

  const cleanupCall = () => {
    setCalling(false);
    setReceivingCall(false);
    setCallAccepted(false);
    setCallStatus('');
    setCallTimer(0);
    clearInterval(timerRef.current);
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (connectionRef.current) {
      connectionRef.current.destroy();
    }
  };

  const MAX_CALL_SECONDS = 15 * 60; // 15 minutes

  // Start/stop session timer when video call is active
  useEffect(() => {
    if (callAccepted && callType === 'video') {
      setCallTimer(0);
      timerRef.current = setInterval(() => {
        setCallTimer(prev => {
          const next = prev + 1;
          if (next >= MAX_CALL_SECONDS) {
            clearInterval(timerRef.current);
            // Auto end call at 15 minutes
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

  const timeRemaining = MAX_CALL_SECONDS - callTimer;
  const isWarning = timeRemaining <= 120; // last 2 minutes

  // Prescription helpers
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
      const data = await res.json();
      if (data.success) {
        setPrescriptionSuccess(true);
        setTimeout(() => {
          setPrescriptionSuccess(false);
          setShowPrescriptionModal(false);
          setPrescriptionForm({ diagnosis: '', advice: '' });
          setPrescriptionMedicines([{ name: '', strength: '', dosage: '', frequency: '', duration: '', instruction: '' }]);
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
    <div className="chat-page">
      <div className="chat-container">
        <header className="chat-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <div className="party-info">
            <div className="party-avatar">
              {otherParty?.name?.charAt(0)}
            </div>
            <div className="party-details">
              <h3>{isDoctor ? otherParty?.name : `Dr. ${otherParty?.name}`}</h3>
              <p>{consultation.status.toUpperCase()} SESSION</p>
            </div>
          </div>
          <div className="chat-actions">
            {callAccepted && (
              <div className="active-call-pill">
                <span className="live-dot"></span>
                {callType === 'video' ? 'Video Live' : 'In Call'}
              </div>
            )}
            {!calling && !callAccepted && !receivingCall && (
              <>
                <button className="call-btn" onClick={() => startCall('audio')} title="Voice Call">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </button>
                <button className="call-btn" onClick={() => startCall('video')} title="Video Call">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                  </svg>
                </button>
                {isDoctor && (
                  <button className="call-btn prescription-btn" onClick={() => setShowPrescriptionModal(true)} title="Write Prescription">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                      <line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
                    </svg>
                  </button>
                )}
              </>
            )}
            {(calling || callAccepted) && (
              <div className="call-controls-mini">
                {callType === 'video' && (
                  <button className={`control-btn ${isVideoOff ? 'muted' : ''}`} onClick={toggleVideo}>
                    {isVideoOff ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10l-1.32-.94"/><line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                      </svg>
                    )}
                  </button>
                )}
                <button className={`control-btn ${isMuted ? 'muted' : ''}`} onClick={toggleMute}>
                  {isMuted ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/>
                      <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
                    </svg>
                  )}
                </button>
                <button className="control-btn end" onClick={endCall}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.03 19.42 19.42 0 0 1-5.33-3.57 19.42 19.42 0 0 1-3.57-5.33 19.79 19.79 0 0 1-3.03-8.63A2 2 0 0 1 3.1 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.09 9.91" />
                    <line x1="23" y1="1" x2="1" y2="23" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="messages-area">
          <div className="chat-notice">
            <p>This consultation is valid for 7 days. Your data is encrypted and secure.</p>
          </div>
          
          {messages.map((msg, index) => {
            const isMe = msg.sender === user._id || msg.senderId === user._id;
            return (
              <div key={index} className={`message-wrapper ${isMe ? 'me' : 'other'}`}>
                <div className="message-bubble">
                  {msg.text}
                  <span className="message-time">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {receivingCall && (
          <div className="call-modal">
            <div className="modal-content">
              <div className="caller-avatar">{otherParty?.name?.charAt(0)}</div>
              <h3>Incoming {callType === 'video' ? 'Video' : 'Audio'} Call</h3>
              <p>{isDoctor ? otherParty?.name : `Dr. ${otherParty?.name}`} is calling you...</p>
              <div className="modal-actions">
                <button className="accept-btn" onClick={answerCall}>Accept</button>
                <button className="decline-btn" onClick={rejectCall}>Decline</button>
              </div>
            </div>
          </div>
        )}

        {calling && !callAccepted && (
          <div className="call-status-overlay">
            <div className="calling-indicator">
              <div className="pulse-circle"></div>
              <p>{callStatus}</p>
              {callStatus === 'Call Rejected' && (
                <button className="btn-secondary-sm mt-4" style={{marginTop: '20px', background: 'white'}} onClick={() => setCalling(false)}>Dismiss</button>
              )}
            </div>
          </div>
        )}

        <form className="chat-input-area" onSubmit={handleSendMessage}>
          <button type="button" className="attachment-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
            </svg>
          </button>
          <input 
            type="text" 
            placeholder="Type your message..." 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button type="submit" className="send-btn" disabled={!newMessage.trim()}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </form>
      </div>

      {/* Messenger-style Video Overlay */}
      {callAccepted && callType === 'video' && (
        <div className="video-overlay">
          {/* Session Timer - top right */}
          <div className={`video-session-timer ${isWarning ? 'timer-warning' : ''}`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span>{formatTimer(callTimer)}</span>
            {isWarning && <span className="timer-limit-badge">{Math.ceil(timeRemaining / 60)}m left</span>}
          </div>

          {/* Remote (main) video */}
          <video ref={remoteVideoRef} autoPlay playsInline className="video-remote-main" />
          <div className="video-remote-label">{isDoctor ? otherParty?.name : `Dr. ${otherParty?.name}`}</div>

          {/* Local (PiP) video */}
          <div className="video-pip-wrap">
            <video ref={localVideoRef} autoPlay playsInline muted className="video-pip" />
            <div className="video-pip-label">You</div>
          </div>

          {/* In-call controls overlay */}
          <div className="video-controls-bar">
            <button className={`vc-btn ${isMuted ? 'vc-muted' : ''}`} onClick={toggleMute}>
              {isMuted ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
              )}
              <span>{isMuted ? 'Unmute' : 'Mute'}</span>
            </button>
            <button className={`vc-btn ${isVideoOff ? 'vc-muted' : ''}`} onClick={toggleVideo}>
              {isVideoOff ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10l-1.32-.94"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
              )}
              <span>{isVideoOff ? 'Start Video' : 'Stop Video'}</span>
            </button>
            <button className="vc-btn vc-end" onClick={endCall}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.03 19.42 19.42 0 0 1-5.33-3.57 19.42 19.42 0 0 1-3.57-5.33 19.79 19.79 0 0 1-3.03-8.63A2 2 0 0 1 3.1 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.09 9.91" /><line x1="23" y1="1" x2="1" y2="23" /></svg>
              <span>End Call</span>
            </button>
          </div>
        </div>
      )}

      {/* Hidden Audio Element for voice calls */}
      {(!callAccepted || callType !== 'video') && (
        <audio ref={remoteVideoRef} autoPlay />
      )}

      {/* Prescription Modal (Doctor only) */}
      {showPrescriptionModal && (
        <div className="rx-modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowPrescriptionModal(false)}>
          <div className="rx-modal">
            <div className="rx-modal-header">
              <div className="rx-modal-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                  <line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
                </svg>
                <h2>Write Prescription</h2>
              </div>
              <div className="rx-patient-tag">Patient: <strong>{consultation.patient?.name}</strong></div>
              <button className="rx-close-btn" onClick={() => setShowPrescriptionModal(false)}>✕</button>
            </div>

            {prescriptionSuccess ? (
              <div className="rx-success-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <h3>Prescription Sent!</h3>
                <p>The patient will see it in My Prescriptions.</p>
              </div>
            ) : (
              <form className="rx-form" onSubmit={handleSubmitPrescription}>
                <div className="rx-section">
                  <label className="rx-label">Diagnosis *</label>
                  <textarea
                    className="rx-textarea"
                    placeholder="e.g. Acute pharyngitis, Common cold..."
                    value={prescriptionForm.diagnosis}
                    onChange={(e) => setPrescriptionForm(p => ({...p, diagnosis: e.target.value}))}
                    required
                    rows={2}
                  />
                </div>

                <div className="rx-section">
                  <div className="rx-section-header">
                    <label className="rx-label">Medicines</label>
                    <button type="button" className="rx-add-med-btn" onClick={handleAddMedicine}>
                      + Add Medicine
                    </button>
                  </div>
                  {prescriptionMedicines.map((med, i) => (
                    <div key={i} className="rx-medicine-row">
                      <div className="rx-med-grid">
                        <input className="rx-input" placeholder="Medicine name *" value={med.name} onChange={(e) => handleMedicineChange(i, 'name', e.target.value)} required />
                        <input className="rx-input" placeholder="Strength (e.g. 500mg)" value={med.strength} onChange={(e) => handleMedicineChange(i, 'strength', e.target.value)} />
                        <input className="rx-input" placeholder="Dosage (e.g. 1 tablet)" value={med.dosage} onChange={(e) => handleMedicineChange(i, 'dosage', e.target.value)} />
                        <input className="rx-input" placeholder="Frequency (e.g. TDS)" value={med.frequency} onChange={(e) => handleMedicineChange(i, 'frequency', e.target.value)} />
                        <input className="rx-input" placeholder="Duration (e.g. 5 days)" value={med.duration} onChange={(e) => handleMedicineChange(i, 'duration', e.target.value)} />
                        <input className="rx-input" placeholder="Instructions" value={med.instruction} onChange={(e) => handleMedicineChange(i, 'instruction', e.target.value)} />
                      </div>
                      {prescriptionMedicines.length > 1 && (
                        <button type="button" className="rx-remove-btn" onClick={() => handleRemoveMedicine(i)}>✕</button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="rx-section">
                  <label className="rx-label">Advice / Notes</label>
                  <textarea
                    className="rx-textarea"
                    placeholder="Rest, drink fluids, follow-up in 5 days..."
                    value={prescriptionForm.advice}
                    onChange={(e) => setPrescriptionForm(p => ({...p, advice: e.target.value}))}
                    rows={2}
                  />
                </div>

                <div className="rx-footer">
                  <button type="button" className="rx-cancel-btn" onClick={() => setShowPrescriptionModal(false)}>Cancel</button>
                  <button type="submit" className="rx-submit-btn" disabled={prescriptionSubmitting}>
                    {prescriptionSubmitting ? 'Sending...' : '📋 Issue Prescription'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
