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
  const [remoteStream, setRemoteStream] = useState(null);

  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const remoteStreamRef = useRef(null);

  const apiUrl = import.meta.env.VITE_API_URL || 'https://192.168.110.29:5001';

  // ---------------- SOCKET ----------------
  useEffect(() => {
    socketRef.current = io(apiUrl);
    socketRef.current.on('connect', () => {
      socketRef.current.emit('join_consultation', id);
    });

    socketRef.current.on('call_signal', (data) => {
      console.log("📥 SOCKET RECEIVED:", data.type, data);

      if (data.type === 'offer') {
        setReceivingCall(true);
        setCallerSignal(data.signal);
      }

      if (data.type === 'answer') {
        setCallAccepted(true);

        // ensure DOM ready before applying signal
        setTimeout(() => {
          connectionRef.current?.signal(data.signal);
        }, 0);
      }

      if (data.type === 'candidate') {
        connectionRef.current?.signal(data.signal);
      }
    });

    return () => socketRef.current.disconnect();

  }, [id]);

  // ---------------- START CALL ----------------
  const startCall = async () => {
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });

    setStream(mediaStream);
    setCalling(true);

    const peer = new Peer({
      initiator: true,
      trickle: true,
      streams: [mediaStream], // ✅ FIX
      config: {
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      }
    });

    peer.on('signal', (data) => {
      console.log("📤 SIGNAL OUT:", data.type || (data.candidate ? 'candidate' : 'sdp'));
      
      if (data.candidate) {
        console.log("🧊 ICE CANDIDATE OUT");
      } else if (data.sdp) {
        console.log("📡 SDP OUT");
      }

      socketRef.current.emit('call_signal', {
        consultationId: id,
        type: data.candidate ? 'candidate' : (peer.initiator ? 'offer' : 'answer'),
        signal: data
      });
    });

    peer.on('connect', () => {
      console.log("✅ PEER CONNECTED");
    });

    // ✅ FIX: use TRACK
    peer.on('track', (track, stream) => {
      console.log("TRACK RECEIVED");

      const finalStream = stream || new MediaStream([track]);

      remoteStreamRef.current = finalStream;
      setRemoteStream(finalStream);

      if (remoteVideoRef.current) {
        console.log("IMMEDIATE ATTACH");
        remoteVideoRef.current.srcObject = finalStream;
      }
    });

    peer.on('close', () => {
      console.log("❌ PEER CLOSED");
    });

    peer.on('error', err => {
      console.log("🔥 PEER ERROR:", err);
    });

    connectionRef.current = peer;

  };

  // ---------------- ANSWER CALL ----------------
  const answerCall = async () => {
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });

    setStream(mediaStream);
    setCallAccepted(true);
    setReceivingCall(false);

    const peer = new Peer({
      initiator: false,
      trickle: true,
      streams: [mediaStream], // ✅ FIX
      config: {
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      }
    });

    peer.on('signal', (data) => {
      console.log("📤 SIGNAL OUT:", data.type || (data.candidate ? 'candidate' : 'sdp'));

      if (data.candidate) {
        console.log("🧊 ICE CANDIDATE OUT");
      } else if (data.sdp) {
        console.log("📡 SDP OUT");
      }

      socketRef.current.emit('call_signal', {
        consultationId: id,
        type: data.candidate ? 'candidate' : (peer.initiator ? 'offer' : 'answer'),
        signal: data
      });
    });

    peer.on('connect', () => {
      console.log("✅ PEER CONNECTED");
    });

    // ✅ FIX: use TRACK
    peer.on('track', (track, stream) => {
      console.log("TRACK RECEIVED");

      const finalStream = stream || new MediaStream([track]);

      remoteStreamRef.current = finalStream;
      setRemoteStream(finalStream);

      if (remoteVideoRef.current) {
        console.log("IMMEDIATE ATTACH");
        remoteVideoRef.current.srcObject = finalStream;
      }
    });

    peer.on('close', () => {
      console.log("❌ PEER CLOSED");
    });

    peer.on('error', err => {
      console.log("🔥 PEER ERROR:", err);
    });

    peer.signal(callerSignal);
    connectionRef.current = peer;

  };

  // ---------------- STREAM ATTACH ----------------
  useEffect(() => {
    if (stream && localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      console.log("Attach remote stream");
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Force attach when ref becomes ready (retry interval)
  useEffect(() => {
    const interval = setInterval(() => {
      if (remoteVideoRef.current && remoteStreamRef.current) {
        if (remoteVideoRef.current.srcObject !== remoteStreamRef.current) {
          console.log("FORCING ATTACH (retry)");
          remoteVideoRef.current.srcObject = remoteStreamRef.current;
        }
      }
    }, 300);

    return () => clearInterval(interval);
  }, []);

  // ---------------- MONITORING ----------------
  useEffect(() => {
    const interval = setInterval(() => {
      if (connectionRef.current?._pc) {
        console.log("🔗 ICE STATE:", connectionRef.current._pc.iceConnectionState);
        console.log("📶 CONNECTION STATE:", connectionRef.current._pc.connectionState);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // ---------------- UI ----------------
  return (
    <div style={{ height: "100vh", background: "#111", position: "relative" }}>

      {!calling && !callAccepted && (
        <button onClick={startCall}>Start Call</button>
      )}

      {receivingCall && (
        <div>
          <button onClick={answerCall}>Answer Call</button>
        </div>
      )}

      {/* Remote video */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: (calling || callAccepted) ? "block" : "none"
        }}
      />

      {/* Local video */}
      <video
        ref={localVideoRef}
        autoPlay
        muted
        playsInline
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          width: 200,
          height: 150,
          borderRadius: 10,
          display: (calling || callAccepted) ? "block" : "none"
        }}
      />
    </div>

  );
};

export default Chat;
