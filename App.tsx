
import React, { useState, useRef, useCallback } from 'react';
import { AudioState, VocalAnalysis } from './types';
import { analyzeVocal, fileToBase64 } from './services/geminiService';
import VocalVisualizer from './components/VocalVisualizer';
import AnalysisDashboard from './components/AnalysisDashboard';

const App: React.FC = () => {
  const [state, setState] = useState<AudioState>({
    isRecording: false,
    audioUrl: null,
    audioBlob: null,
    isAnalyzing: false,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [analysis, setAnalysis] = useState<VocalAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setState(prev => ({ ...prev, audioBlob: blob, audioUrl: url, isRecording: false }));
      };

      mediaRecorder.start();
      setState(prev => ({ ...prev, isRecording: true, audioUrl: null, audioBlob: null }));
      setAnalysis(null);
      setError(null);
    } catch (err) {
      console.error("Failed to start recording:", err);
      setError("マイクへのアクセスが拒否されました。設定を確認してください。");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.stop();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('audio/')) {
      setError("オーディオファイルを選択してください。");
      return;
    }
    const url = URL.createObjectURL(file);
    setState(prev => ({ ...prev, audioBlob: file, audioUrl: url }));
    setAnalysis(null);
    setError(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const performAnalysis = async () => {
    if (!state.audioBlob) return;

    setState(prev => ({ ...prev, isAnalyzing: true }));
    setError(null);

    try {
      const base64 = await fileToBase64(state.audioBlob);
      const result = await analyzeVocal(base64, state.audioBlob.type || 'audio/webm');
      setAnalysis(result);
    } catch (err: any) {
      console.error("Analysis failed:", err);
      setError("解析中にエラーが発生しました: " + (err.message || "不明なエラー"));
    } finally {
      setState(prev => ({ ...prev, isAnalyzing: false }));
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-gray-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="mb-12 text-center">
          <div className="inline-block px-4 py-1.5 mb-4 text-xs font-bold tracking-widest text-blue-400 uppercase bg-blue-400/10 rounded-full">
            AI-Powered Vocal Intelligence
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Vocal <span className="text-blue-500">Analyzer</span> AI
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            発声の質を科学的・芸術的視点から精密に分析。あなたの「声」の可能性を可視化します。
          </p>
        </header>

        {/* Controls Section (Drop Zone) */}
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`bg-gray-800/20 rounded-3xl p-6 md:p-10 border transition-all duration-300 mb-12 shadow-2xl ${
            isDragging 
            ? 'border-blue-500 bg-blue-500/5 scale-[1.01] ring-4 ring-blue-500/10' 
            : 'border-gray-700/50'
          }`}
        >
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 w-full space-y-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-400 uppercase">Input Method</span>
                {isDragging && <span className="text-blue-400 text-xs font-bold animate-pulse">ドロップして読み込み</span>}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={state.isRecording ? stopRecording : startRecording}
                  disabled={state.isAnalyzing}
                  className={`flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold transition-all ${
                    state.isRecording 
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                    : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-900/20'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {state.isRecording ? (
                    <>
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                      録音停止
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4z" />
                        <path d="M5 10a5 5 0 0010 0v1a1 1 0 112 0v-1a7 7 0 00-14 0v1a1 1 0 112 0v-1z" />
                      </svg>
                      録音開始
                    </>
                  )}
                </button>

                <label className="flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold bg-gray-700 hover:bg-gray-600 transition-all cursor-pointer border-2 border-dashed border-gray-600 hover:border-blue-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  ファイルをアップロード
                  <input type="file" className="hidden" accept="audio/*" onChange={handleFileUpload} />
                </label>
              </div>

              {state.audioUrl && (
                <div className="mt-6 p-4 bg-gray-900/80 rounded-2xl flex items-center gap-4 animate-in zoom-in-95 duration-300">
                  <audio src={state.audioUrl} controls className="flex-1 h-10" />
                  <button
                    onClick={performAnalysis}
                    disabled={state.isAnalyzing}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-bold transition-colors disabled:opacity-50 shadow-lg shadow-emerald-900/20"
                  >
                    {state.isAnalyzing ? "分析中..." : "分析実行"}
                  </button>
                </div>
              )}
            </div>

            <div className="w-full md:w-72 flex flex-col items-center justify-center bg-gray-900/50 p-6 rounded-2xl border border-gray-700">
              <p className="text-xs text-gray-500 mb-4 uppercase font-bold tracking-widest">Live Spectrum</p>
              <VocalVisualizer stream={streamRef.current} isActive={state.isRecording} />
              <div className="mt-4 flex gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className={`w-1.5 h-1.5 rounded-full ${state.isRecording ? 'bg-red-500 animate-bounce' : 'bg-gray-700'}`} style={{ animationDelay: `${i * 0.1}s` }}></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-900/20 border border-red-500/50 rounded-xl text-red-400 flex items-center gap-3 animate-in slide-in-from-top-4">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {/* Results Section */}
        {state.isAnalyzing && (
          <div className="py-20 text-center space-y-6">
            <div className="relative inline-block">
              <div className="w-20 h-20 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 bg-blue-500/10 rounded-full animate-ping"></div>
              </div>
            </div>
            <p className="text-xl font-medium text-blue-300">AIが音響スペクトラムを精密解析中...</p>
            <div className="max-w-xs mx-auto space-y-2">
              <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 animate-[loading_2s_ease-in-out_infinite]"></div>
              </div>
              <p className="text-xs text-gray-500 italic">生理学的・演劇学的多角分析を実施しています</p>
            </div>
          </div>
        )}

        {analysis && <AnalysisDashboard analysis={analysis} />}

        {!analysis && !state.isAnalyzing && !state.isRecording && (
          <div className="py-20 text-center opacity-40">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            <p className="text-lg">録音またはファイルをアップロード・ドロップして分析を開始してください</p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes loading {
          0% { width: 0%; transform: translateX(-100%); }
          50% { width: 100%; transform: translateX(0%); }
          100% { width: 0%; transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default App;
