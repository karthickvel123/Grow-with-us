import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Video, VideoOff, Mic, MicOff, Volume2, VolumeX,
  Send, Bot, Award, CheckCircle2, AlertTriangle,
  Building2, Sparkles, Loader2, ArrowRight, Code2,
  Eye, Smile, ShieldCheck, ChevronRight, PhoneOff,
  Zap, MessageSquare, Maximize2
} from 'lucide-react';
import { VideoTelemetryAnalyzer, FaceTelemetry, SessionAggregates } from '../utils/faceTracker';

interface VideoInterviewRoomProps {
  companyTarget: string;
  track: string;
  topic?: string | null;
  currentQuestion: string;
  conversationHistory: Array<{ sender: string; text: string; code?: string }>;
  loadingTurn: boolean;
  onSendAnswer: (answer: string, code?: string, telemetry?: SessionAggregates) => void;
  onFinishInterview: (telemetry: SessionAggregates) => void;
}

export const VideoInterviewRoom: React.FC<VideoInterviewRoomProps> = ({
  companyTarget,
  track,
  topic,
  currentQuestion,
  conversationHistory,
  loadingTurn,
  onSendAnswer,
  onFinishInterview,
}) => {
  // Video and stream states
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraEnabled, setCameraEnabled] = useState<boolean>(true);
  const [micEnabled, setMicEnabled] = useState<boolean>(true);
  const [aiVoiceMuted, setAiVoiceMuted] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Telemetry state
  const analyzerRef = useRef<VideoTelemetryAnalyzer>(new VideoTelemetryAnalyzer());
  const [telemetry, setTelemetry] = useState<FaceTelemetry>({
    faceDetected: true,
    eyeContactScore: 92,
    eyeContactStatus: 'optimal',
    postureStatus: 'optimal',
    postureScore: 94,
    expression: 'confident',
    composureScore: 90,
    motionDelta: 2,
    headTiltAngle: 0,
    tip: 'Great posture! Look straight into the camera when introducing yourself.',
  });

  // Speech Recognition & Input states
  const [userSpeechText, setUserSpeechText] = useState<string>('');
  const [codeSnippet, setCodeSnippet] = useState<string>('');
  const [showCodeDrawer, setShowCodeDrawer] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  // AI Speaking animation state
  const [isAiSpeaking, setIsAiSpeaking] = useState<boolean>(false);
  const [spokenSubtitle, setSpokenSubtitle] = useState<string>('');

  // Start Camera Stream
  useEffect(() => {
    let activeStream: MediaStream | null = null;

    async function initCamera() {
      try {
        const userMedia = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
          audio: true,
        });
        activeStream = userMedia;
        setStream(userMedia);
        if (videoRef.current) {
          videoRef.current.srcObject = userMedia;
        }
      } catch (err: any) {
        console.warn('Camera access denied or not available:', err);
        setCameraError('Webcam access optional: You can continue with voice and text.');
      }
    }

    initCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Frame telemetry loop at 8 FPS
  useEffect(() => {
    const interval = setInterval(() => {
      if (videoRef.current && cameraEnabled && !cameraError) {
        const metrics = analyzerRef.current.analyzeFrame(videoRef.current);
        setTelemetry(metrics);
      }
    }, 125);

    return () => clearInterval(interval);
  }, [cameraEnabled, cameraError]);

  // Speech Recognition Setup (Web Speech API)
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const combined = (finalTranscript || interimTranscript).trim();
        if (combined) {
          setUserSpeechText((prev) => (finalTranscript ? `${prev} ${finalTranscript}`.trim() : prev || interimTranscript));
        }
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition error:', e.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Speak AI responses aloud using SpeechSynthesis
  const speakAiResponse = useCallback((text: string) => {
    if (aiVoiceMuted || typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    setSpokenSubtitle(text);
    setIsAiSpeaking(true);

    const cleanText = text.replace(/[*#_`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      (v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha'))
    );
    if (naturalVoice) utterance.voice = naturalVoice;

    utterance.onend = () => {
      setIsAiSpeaking(false);
      // Automatically prompt candidate to respond via speech
      startListening();
    };

    utterance.onerror = () => {
      setIsAiSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  }, [aiVoiceMuted]);

  // Speak initial question when question changes
  useEffect(() => {
    if (currentQuestion) {
      speakAiResponse(currentQuestion);
    }
  }, [currentQuestion, speakAiResponse]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Recognition already started:', err);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
        setIsListening(false);
      } catch (err) {
        console.warn('Recognition stop error:', err);
      }
    }
  };

  const toggleMic = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !micEnabled;
      }
    }
    setMicEnabled(!micEnabled);
    if (micEnabled) stopListening();
    else startListening();
  };

  const toggleCamera = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !cameraEnabled;
      }
    }
    setCameraEnabled(!cameraEnabled);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userSpeechText.trim() || loadingTurn) return;

    stopListening();
    window.speechSynthesis.cancel();
    setIsAiSpeaking(false);

    const report = analyzerRef.current.getSessionReport();
    onSendAnswer(userSpeechText, codeSnippet || undefined, report);
    setUserSpeechText('');
    setCodeSnippet('');
    setShowCodeDrawer(false);
  };

  const handleFinish = () => {
    window.speechSynthesis.cancel();
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
    }
    const finalReport = analyzerRef.current.getSessionReport();
    onFinishInterview(finalReport);
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto pb-12">
      {/* Top Interview Header Bar */}
      <div className="rounded-2xl border border-white/10 bg-[#0f172a]/90 p-4 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold shadow-md shadow-blue-500/20">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-black text-white">{companyTarget} Technical Interview Room</span>
              <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                LIVE INTERVIEW
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Track: <strong className="text-slate-200">{track}</strong>
              {topic && <> • Concept: <strong className="text-blue-300">{topic.replace('_', ' ').toUpperCase()}</strong></>}
            </p>
          </div>
        </div>

        {/* Live Audio & Room Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              if (aiVoiceMuted) {
                setAiVoiceMuted(false);
                speakAiResponse(currentQuestion);
              } else {
                setAiVoiceMuted(true);
                window.speechSynthesis.cancel();
                setIsAiSpeaking(false);
              }
            }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              aiVoiceMuted
                ? 'border-red-500/30 bg-red-950/30 text-red-400'
                : 'border-white/10 bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            {aiVoiceMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4 text-emerald-400" />}
            <span>{aiVoiceMuted ? 'AI Voice Muted' : 'AI Voice Active'}</span>
          </button>

          <button
            onClick={handleFinish}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl border border-red-500/30 bg-red-900/40 hover:bg-red-800/60 text-red-200 text-xs font-bold transition shadow-sm"
          >
            <PhoneOff className="h-4 w-4 text-red-400" />
            <span>End Call & Evaluate</span>
          </button>
        </div>
      </div>

      {/* Main Split Video Screen: AI Interviewer (Left) vs Candidate (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* LEFT: AI Technical Interviewer Feed */}
        <div className="relative rounded-3xl border border-white/10 bg-gradient-to-b from-[#0f172a] to-[#090d16] p-6 shadow-2xl flex flex-col justify-between min-h-[380px] overflow-hidden">
          {/* Company Watermark */}
          <div className="absolute top-4 left-4 flex items-center space-x-2 text-xs font-mono font-bold text-slate-400">
            <Bot className="h-4 w-4 text-blue-400" />
            <span>{companyTarget} Interviewer AI</span>
          </div>

          <div className="absolute top-4 right-4 flex items-center space-x-1.5">
            <span className={`flex h-2.5 w-2.5 rounded-full ${isAiSpeaking ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
            <span className="text-[11px] font-mono text-slate-400">
              {isAiSpeaking ? 'Speaking...' : 'Listening to candidate'}
            </span>
          </div>

          {/* AI Avatar Centerpiece */}
          <div className="flex-1 flex flex-col items-center justify-center my-6">
            <div className="relative">
              {/* Animated Glowing rings when speaking */}
              {isAiSpeaking && (
                <>
                  <div className="absolute -inset-4 rounded-full bg-blue-500/20 blur-xl animate-pulse" />
                  <div className="absolute -inset-8 rounded-full bg-indigo-500/10 blur-2xl animate-ping" />
                </>
              )}

              <div className="relative h-28 w-28 rounded-full border-2 border-blue-500/40 bg-gradient-to-tr from-blue-950 via-slate-900 to-indigo-950 flex items-center justify-center shadow-2xl">
                <Bot className={`h-12 w-12 text-blue-400 transition-transform ${isAiSpeaking ? 'scale-110' : 'scale-100'}`} />
              </div>
            </div>

            {/* Audio Wave Bars */}
            <div className="flex items-center space-x-1 mt-5 h-6">
              {[40, 70, 100, 60, 90, 50, 80, 45].map((height, idx) => (
                <div
                  key={idx}
                  className={`w-1 rounded-full bg-blue-400 transition-all duration-150 ${
                    isAiSpeaking ? 'opacity-100' : 'opacity-20 h-1.5'
                  }`}
                  style={{
                    height: isAiSpeaking ? `${(height * Math.random()) + 15}%` : '4px',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Live Question / Speaking Subtitles Box */}
          <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4 backdrop-blur-md space-y-1.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400 flex items-center space-x-1">
              <MessageSquare className="h-3 w-3" />
              <span>Interviewer Question:</span>
            </span>
            <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-medium">
              {currentQuestion}
            </p>
          </div>
        </div>

        {/* RIGHT: Candidate Live Video Feed + On-the-Spot Telemetry HUD */}
        <div className="relative rounded-3xl border border-white/10 bg-black min-h-[380px] overflow-hidden flex flex-col justify-between shadow-2xl">
          {/* Live Video Element */}
          {cameraEnabled && !cameraError ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover transform -scale-x-100"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 text-slate-400 p-6 text-center space-y-2">
              <VideoOff className="h-10 w-10 text-slate-600 mb-1" />
              <p className="text-xs font-semibold text-slate-300">Camera Off or Permissions Denied</p>
              <p className="text-[11px] text-slate-500 max-w-xs">
                You can still speak using the microphone or type code and responses below.
              </p>
            </div>
          )}

          {/* Top HUD: Real-time Telemetry Badges */}
          <div className="relative z-10 p-4 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
            {/* Eye Contact Badge */}
            <div className="rounded-xl border border-white/15 bg-black/60 backdrop-blur-md px-3 py-1 flex items-center space-x-1.5 text-[11px] font-mono font-bold shadow-md">
              <Eye className="h-3.5 w-3.5 text-blue-400" />
              <span className="text-slate-300">Eye Contact:</span>
              <span className={telemetry.eyeContactScore > 80 ? 'text-emerald-400' : 'text-amber-400'}>
                {telemetry.eyeContactScore}%
              </span>
            </div>

            {/* Posture & Alignment Badge */}
            <div className="rounded-xl border border-white/15 bg-black/60 backdrop-blur-md px-3 py-1 flex items-center space-x-1.5 text-[11px] font-mono font-bold shadow-md">
              <ShieldCheck className="h-3.5 w-3.5 text-purple-400" />
              <span className="text-slate-300">Posture:</span>
              <span className={telemetry.postureStatus === 'optimal' ? 'text-emerald-400' : 'text-amber-400'}>
                {telemetry.postureStatus.toUpperCase()}
              </span>
            </div>

            {/* Composure / Expression Badge */}
            <div className="rounded-xl border border-white/15 bg-black/60 backdrop-blur-md px-3 py-1 flex items-center space-x-1.5 text-[11px] font-mono font-bold shadow-md">
              <Smile className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-slate-300">Composure:</span>
              <span className="text-amber-300 capitalize">{telemetry.expression} ({telemetry.composureScore}%)</span>
            </div>
          </div>

          {/* Bottom HUD: Live On-The-Spot Coaching Bubble */}
          <div className="relative z-10 p-4 space-y-2 pointer-events-none">
            <div className="rounded-2xl border border-emerald-500/30 bg-black/75 p-3 backdrop-blur-md flex items-center space-x-2 text-xs shadow-xl">
              <Sparkles className="h-4 w-4 text-emerald-400 flex-shrink-0 animate-pulse" />
              <p className="text-slate-200 font-medium leading-snug">
                {telemetry.tip}
              </p>
            </div>
          </div>

          {/* Floating Device Controls (Cam, Mic) */}
          <div className="absolute bottom-4 right-4 z-20 flex items-center space-x-2">
            <button
              onClick={toggleMic}
              className={`p-2.5 rounded-full border shadow-lg transition ${
                micEnabled
                  ? 'border-white/10 bg-slate-900/80 hover:bg-slate-800 text-white'
                  : 'border-red-500/40 bg-red-600 text-white'
              }`}
              title={micEnabled ? 'Mute Mic' : 'Unmute Mic'}
            >
              {micEnabled ? <Mic className="h-4 w-4 text-emerald-400" /> : <MicOff className="h-4 w-4" />}
            </button>

            <button
              onClick={toggleCamera}
              className={`p-2.5 rounded-full border shadow-lg transition ${
                cameraEnabled
                  ? 'border-white/10 bg-slate-900/80 hover:bg-slate-800 text-white'
                  : 'border-red-500/40 bg-red-600 text-white'
              }`}
              title={cameraEnabled ? 'Disable Camera' : 'Enable Camera'}
            >
              {cameraEnabled ? <Video className="h-4 w-4 text-blue-400" /> : <VideoOff className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Candidate Live Response & Speech Input Box */}
      <form onSubmit={handleSubmit} className="rounded-3xl border border-white/10 bg-[#0f172a]/95 p-5 backdrop-blur-xl space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Your Verbal Response
            </span>
            {isListening && (
              <span className="flex items-center space-x-1.5 rounded-full bg-red-500/20 px-2.5 py-0.5 text-[10px] font-mono font-bold text-red-400 border border-red-500/30 animate-pulse">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                <span>Microphone Listening...</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => {
                if (isListening) stopListening();
                else startListening();
              }}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-semibold border transition ${
                isListening
                  ? 'border-red-500 bg-red-500/20 text-red-300'
                  : 'border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300'
              }`}
            >
              <Mic className="h-3.5 w-3.5" />
              <span>{isListening ? 'Stop Speech Recognition' : '🎙️ Speak with Voice'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowCodeDrawer(!showCodeDrawer)}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-semibold border transition ${
                showCodeDrawer
                  ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                  : 'border-white/10 bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Code2 className="h-3.5 w-3.5" />
              <span>{showCodeDrawer ? 'Hide Code Box' : '+ Attach Code'}</span>
            </button>
          </div>
        </div>

        {/* Response Textarea (live populated by speech or manual typing) */}
        <textarea
          value={userSpeechText}
          onChange={(e) => setUserSpeechText(e.target.value)}
          rows={3}
          placeholder="Speak into your microphone or type your response here (e.g. 'Hi, I'm Alex. I specialize in backend systems in Python and have built high-concurrency microservices...')"
          className="w-full rounded-2xl border border-white/10 bg-slate-900/90 p-4 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 transition shadow-inner"
        />

        {/* Optional Code Snippet Area */}
        {showCodeDrawer && (
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono text-emerald-400">Python Implementation Snippet:</span>
            <textarea
              value={codeSnippet}
              onChange={(e) => setCodeSnippet(e.target.value)}
              rows={5}
              placeholder="# Defend your solution or write code here...
def solve(nums):
    seen = {}
    for i, num in enumerate(nums):
        if num in seen:
            return [seen[num], i]
        seen[num] = i"
              className="w-full rounded-2xl border border-white/10 bg-[#0c101c] p-4 font-mono text-xs text-emerald-300 placeholder-slate-600 outline-none focus:border-emerald-500 transition"
            />
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-slate-400">
            Press <strong>Submit Answer</strong> or Enter to reply to the interviewer.
          </span>

          <button
            type="submit"
            disabled={!userSpeechText.trim() || loadingTurn}
            className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/25 transition disabled:opacity-50"
          >
            {loadingTurn ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Evaluating Response...</span>
              </>
            ) : (
              <>
                <span>Submit Answer</span>
                <Send className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
