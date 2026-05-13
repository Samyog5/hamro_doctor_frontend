import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import Peer from 'simple-peer';

const Chat = () => {
  const { id } = useParams();

  const [calling, setCalling] = useState(false);
  const [receivingCall, setReceivingCall] = useState(false);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callerSignal, setCallerSignal] = useState(null);

  const [stream, setStream] = useState(null);

  const socketRef = useRef();
  const connectionRef = useRef();

  const localVideoRef = useRef();
  const remoteVideoRef = useRef();

  const remoteStreamRef = useRef(null);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  // ---------------- SOCKET ----------------
  useEffect(() => {
    socketRef.current = io(apiUrl);

    socketRef.current.on('connect', () => {
      console.log('Socket connected');
      socketRef.current.emit('join_consultation', id);
    });

    socketRef.current.on('call_signal', (data) => {
      console.log('📥 SOCKET RECEIVED:', data.type);

      if (data.type === 'offer') {
        setReceivingCall(true);
        setCallerSignal(data.signal);
      }

      if (data.type === 'answer') {
        setCallAccepted(true);
        connectionRef.current?.signal(data.signal);
      }

      if (data.type === 'candidate') {
        connectionRef.current?.signal(data.signal);
      }
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [id]);

  // ---------------- LOCAL STREAM ----------------
  const getLocalStream = async () => {
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 640, max: 640 },
        height: { ideal: 360, max: 360 },
        frameRate: { ideal: 15, max: 20 },
        facingMode: 'user'
      },
      audio: true
    });

    setStream(mediaStream);

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = mediaStream;
    }

    return mediaStream;
  };

  // ---------------- CREATE PEER ----------------
  const createPeer = (initiator, mediaStream) => {
    const peer = new Peer({
      initiator,
      trickle: true,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ],
        sdpSemantics: 'unified-plan'
      }
    });

    // Add tracks manually (better Safari compatibility)
    mediaStream.getTracks().forEach((track) => {
      peer.addTrack(track, mediaStream);
    });

    // Signaling
    peer.on('signal', (data) => {
      console.log('📤 SIGNAL OUT:', data.type || 'candidate');

      socketRef.current.emit('call_signal', {
        consultationId: id,
        type: data.candidate
          ? 'candidate'
          : initiator
            ? 'offer'
            : 'answer',
        signal: data
      });
    });

    // Connection
    peer.on('connect', () => {
      console.log('✅ PEER CONNECTED');
    });

    // Track handling
    peer.on('track', (track, incomingStream) => {
      console.log('🎥 TRACK RECEIVED:', track.kind);

      if (!incomingStream) return;

      // Prevent duplicate stream resets
      if (remoteStreamRef.current?.id === incomingStream.id) {
        return;
      }

      remoteStreamRef.current = incomingStream;

      if (remoteVideoRef.current) {
        console.log('📺 ATTACHING REMOTE STREAM');
        remoteVideoRef.current.srcObject = incomingStream;
      }
    });

    peer.on('close', () => {
      console.log('❌ PEER CLOSED');
    });

    peer.on('error', (err) => {
      console.log('🔥 PEER ERROR:', err);
    });

    return peer;
  };

  // ---------------- START CALL ----------------
  const startCall = async () => {
    try {
      const mediaStream = await getLocalStream();

      setCalling(true);

      const peer = createPeer(true, mediaStream);

      connectionRef.current = peer;
    } catch (err) {
      console.log('Start call error:', err);
    }
  };

  // ---------------- ANSWER CALL ----------------
  const answerCall = async () => {
    try {
      const mediaStream = await getLocalStream();

      setCallAccepted(true);
      setReceivingCall(false);

      const peer = createPeer(false, mediaStream);

      peer.signal(callerSignal);

      connectionRef.current = peer;
    } catch (err) {
      console.log('Answer call error:', err);
    }
  };

  // ---------------- CLEANUP ----------------
  useEffect(() => {
    return () => {
      if (connectionRef.current) {
        connectionRef.current.destroy();
      }

      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  // ---------------- UI ----------------
  return (
    <div
      style={{
        height: '100vh',
        background: '#111',
        position: 'relative'
      }}
    >
      {!calling && !callAccepted && (
        <button
          onClick={startCall}
          style={{
            position: 'absolute',
            zIndex: 10,
            top: 20,
            left: 20
          }}
        >
          Start Call
        </button>
      )}

      {receivingCall && (
        <div
          style={{
            position: 'absolute',
            zIndex: 10,
            top: 20,
            left: 20
          }}
        >
          <button onClick={answerCall}>Answer Call</button>
        </div>
      )}

      {/* Remote Video */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          background: 'black'
        }}
      />

      {/* Local Video */}
      <video
        ref={localVideoRef}
        autoPlay
        muted
        playsInline
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          width: 220,
          height: 160,
          objectFit: 'cover',
          borderRadius: 12,
          background: '#000',
          border: '2px solid white'
        }}
      />
    </div>
  );
};

export default Chat;