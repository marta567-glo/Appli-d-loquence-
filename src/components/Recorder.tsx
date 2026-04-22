import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, RotateCcw, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzePerformance, AnalysisResult } from '../services/gemini';

interface RecorderProps {
  context: string;
  onAnalysisComplete?: (result: AnalysisResult) => void;
}

export const AudioRecorder: React.FC<RecorderProps> = ({ context, onAnalysisComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setAudioBlob(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);
      setAnalysis(null);
      setError(null);
      
      timerRef.current = setInterval(() => {
        setDuration(d => d + 1);
      }, 1000);

      // Visualizer
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      
      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;
      drawVisualizer();

    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      const errorName = err instanceof DOMException ? err.name : '';
      
      if (errorName === 'NotAllowedError' || errorMessage.toLowerCase().includes('dismissed') || errorMessage.toLowerCase().includes('denied')) {
        setError("L'accès au micro a été ignoré ou refusé. Veuillez l'autoriser dans votre navigateur (icône micro dans la barre d'adresse) pour enregistrer.");
      } else {
        setError("Impossible d'accéder au microphone : " + errorMessage);
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  };

  const drawVisualizer = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2;
        ctx.fillStyle = `rgb(99, 102, 241)`; // indigo-500
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(99, 102, 241, 0.5)';
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    };
    draw();
  };

  const handleAnalyze = async () => {
    if (!audioBlob) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64data = (reader.result as string).split(',')[1];
        const result = await analyzePerformance(base64data, audioBlob.type, context);
        setAnalysis(result);
        if (onAnalysisComplete) onAnalysisComplete(result);
        setIsAnalyzing(false);
      };
    } catch (err) {
      setError("L'analyse a échoué. Veuillez réessayer.");
      setIsAnalyzing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-[#101216] p-6 rounded-2xl border border-slate-800 shadow-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${isRecording ? 'bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-slate-700'}`} />
          <span className="font-mono text-[10px] tracking-[0.2em] text-slate-500 uppercase font-bold">
            {isRecording ? 'REC' : 'STANDBY'}
          </span>
        </div>
        <span className="font-mono text-2xl text-slate-200 tracking-widest tabular-nums">
          {formatTime(duration)}
        </span>
      </div>

      <div className="relative h-28 bg-[#0A0C0F] rounded-xl overflow-hidden border border-slate-800/50">
        <canvas ref={canvasRef} width={600} height={100} className="w-full h-full opacity-80" />
        {!isRecording && !audioUrl && (
          <div className="absolute inset-0 flex items-center justify-center text-slate-700 font-mono text-[10px] uppercase tracking-[0.2em]">
            Prêt pour captation
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-4">
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="group relative p-6 rounded-full bg-indigo-500 hover:bg-indigo-600 transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
            id="start-rec"
          >
            <Mic className="w-7 h-7 text-white" />
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="group relative p-6 rounded-full bg-red-500 hover:bg-red-600 transition-all active:scale-95 shadow-[0_0_20px_rgba(239,68,68,0.25)]"
            id="stop-rec"
          >
            <Square className="w-7 h-7 text-white" />
          </button>
        )}

        {audioUrl && !isRecording && (
          <button
            onClick={() => {
              const audio = new Audio(audioUrl);
              audio.play();
            }}
            className="p-4 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all border border-slate-700"
            id="play-rec"
          >
            <Play className="w-5 h-5 fill-current" />
          </button>
        )}

        {audioUrl && !isRecording && (
          <button
            onClick={() => {
              setAudioUrl(null);
              setAudioBlob(null);
              setDuration(0);
              setAnalysis(null);
            }}
            className="p-4 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-500 transition-all border border-slate-800"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {audioUrl && !isRecording && !analysis && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="pt-4"
          >
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full py-4 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              id="analyze-btn"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  Calcul AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Générer rapport AI
                </>
              )}
            </button>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-red-500 text-[10px] font-bold uppercase tracking-wider mt-4 justify-center bg-red-500/10 p-3 rounded-lg border border-red-500/20"
          >
            <AlertCircle className="w-3 h-3" />
            {error}
          </motion.div>
        )}

        {analysis && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6 pt-6 border-t border-slate-800"
          >
            <div className="flex items-end justify-between">
              <div>
                <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-2">SCORE ÉLOQUENCE</p>
                <h3 className="text-5xl font-serif text-slate-100 leading-none">
                  {analysis.score}<span className="text-lg text-slate-600 font-sans">/100</span>
                </h3>
              </div>
              <div className="text-right">
                <div className="h-1.5 w-24 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${analysis.score}%` }}
                    className="h-full bg-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-3">
                <p className="text-indigo-400 text-[10px] font-bold uppercase tracking-wider">Points de Maîtrise</p>
                <div className="space-y-2">
                  {analysis.feedback.positive.map((item, i) => (
                    <div key={i} className="bg-slate-800/20 p-3 rounded-lg border border-slate-800 flex items-start gap-2 text-[11px] text-slate-300">
                      <div className="w-1 h-1 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-orange-400 text-[10px] font-bold uppercase tracking-wider">Axes de Progrès</p>
                <div className="space-y-2">
                  {analysis.feedback.toImprove.map((item, i) => (
                    <div key={i} className="bg-orange-500/5 p-3 rounded-lg border border-orange-500/10 flex items-start gap-2 text-[11px] text-slate-400">
                      <div className="w-1 h-1 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-indigo-500/10 p-5 rounded-2xl border border-indigo-500/20 shadow-inner">
              <p className="text-indigo-200 text-xs italic font-serif leading-relaxed">
                "{analysis.advice}"
              </p>
            </div>

            <div className="p-4 bg-[#0A0C0F] rounded-xl border border-slate-800">
              <p className="text-slate-600 text-[9px] uppercase font-bold tracking-widest mb-2">Transcription</p>
              <p className="text-slate-400 text-[11px] leading-relaxed max-h-24 overflow-y-auto font-mono">
                {analysis.transcript}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
