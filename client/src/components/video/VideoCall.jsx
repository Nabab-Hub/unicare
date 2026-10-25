import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { Video, VideoOff, Mic, MicOff, PhoneOff, MessageSquare } from 'lucide-react';

export const VideoCall = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [stream, setStream] = useState(null);
  const [micActive, setMicActive] = useState(true);
  const [videoActive, setVideoActive] = useState(true);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');

  const myVideoRef = useRef(null);
  const peerVideoRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const socketUrl = import.meta.env?.PROD ? 'https://unicare-api.onrender.com' : 'http://localhost:5000';
    socketRef.current = io(socketUrl);

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        if (myVideoRef.current) {
          myVideoRef.current.srcObject = currentStream;
        }

        socketRef.current.emit('join-video-room', { roomId, userId: 'user_' + Math.random(), userName: 'Participant' });
      })
      .catch((err) => {
        console.error('Error accessing media devices.', err);
      });

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [roomId]);

  const toggleMic = () => {
    if (stream) {
      stream.getAudioTracks()[0].enabled = !micActive;
      setMicActive(!micActive);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks()[0].enabled = !videoActive;
      setVideoActive(!videoActive);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setMessages([...messages, { sender: 'You', text: chatInput }]);
    setChatInput('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[90vh] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Unicare Secure Video Consultation</h1>
          <p className="text-xs text-slate-500 font-mono">Room ID: {roomId}</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="bg-rose-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-rose-700 flex items-center space-x-2"
        >
          <PhoneOff className="h-4 w-4" />
          <span>Leave Call</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1">
        {/* Video Feeds */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-900 rounded-2xl p-4 relative overflow-hidden flex items-center justify-center">
          <div className="relative bg-slate-800 rounded-xl overflow-hidden aspect-video flex items-center justify-center shadow-lg border border-slate-700">
            <video ref={myVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <div className="absolute bottom-3 left-3 bg-black/60 text-white px-2 py-1 rounded text-xs">You (Patient/Doctor)</div>
          </div>

          <div className="relative bg-slate-800 rounded-xl overflow-hidden aspect-video flex items-center justify-center shadow-lg border border-slate-700">
            <video ref={peerVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <div className="absolute bottom-3 left-3 bg-black/60 text-white px-2 py-1 rounded text-xs">Connected Participant</div>
          </div>

          {/* Controls Bar */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 bg-slate-800/90 backdrop-blur px-6 py-3 rounded-full border border-slate-700 shadow-xl">
            <button
              onClick={toggleMic}
              className={`p-3 rounded-full text-white ${micActive ? 'bg-slate-700 hover:bg-slate-600' : 'bg-rose-600 hover:bg-rose-700'}`}
            >
              {micActive ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </button>
            <button
              onClick={toggleVideo}
              className={`p-3 rounded-full text-white ${videoActive ? 'bg-slate-700 hover:bg-slate-600' : 'bg-rose-600 hover:bg-rose-700'}`}
            >
              {videoActive ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Chat Sidebar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="font-bold text-slate-800 mb-3 flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-sky-600" /> Consultation Chat
            </h3>
            <div className="space-y-3 h-[60vh] overflow-y-auto pr-2">
              {messages.map((m, i) => (
                <div key={i} className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs">
                  <span className="font-bold text-sky-700">{m.sender}:</span> {m.text}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={sendMessage} className="pt-3 border-t flex space-x-2">
            <input
              type="text"
              placeholder="Type message..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 rounded-lg border px-3 py-2 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
            <button type="submit" className="bg-sky-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-sky-700">Send</button>
          </form>
        </div>
      </div>
    </div>
  );
};
