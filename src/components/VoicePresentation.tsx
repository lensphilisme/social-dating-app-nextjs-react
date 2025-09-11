'use client';

import { useState, useRef, useEffect } from 'react';

interface VoicePresentationProps {
  audioUrl?: string;
  onRecordingComplete?: (audioBlob: Blob) => void;
  isOwner?: boolean;
}

export default function VoicePresentation({ 
  audioUrl, 
  onRecordingComplete, 
  isOwner = false 
}: VoicePresentationProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasPermission, setHasPermission] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check for microphone permission
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => setHasPermission(true))
      .catch(() => setHasPermission(false));

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const audioChunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        onRecordingComplete?.(audioBlob);
        setRecordingTime(0);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      
      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      setHasPermission(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <span className="text-white text-lg">🎤</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Voice Presentation</h3>
          <p className="text-sm text-gray-600">Share your voice with potential matches</p>
        </div>
      </div>

      {!hasPermission && isOwner && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <p className="text-yellow-800 text-sm">
            Microphone permission is required to record voice presentations.
          </p>
        </div>
      )}

      {isOwner && hasPermission && (
        <div className="space-y-4">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-4 px-6 rounded-lg font-semibold hover:from-red-600 hover:to-pink-600 transition-all duration-300 shadow-lg flex items-center justify-center gap-3"
            >
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              </div>
              Start Recording
            </button>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-mono text-red-600 mb-2">
                  {formatTime(recordingTime)}
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-red-600 font-medium">Recording...</span>
                </div>
              </div>
              
              <button
                onClick={stopRecording}
                className="w-full bg-gray-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-gray-700 transition-all duration-300 shadow-lg flex items-center justify-center gap-3"
              >
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 bg-gray-600 rounded-sm"></div>
                </div>
                Stop Recording
              </button>
            </div>
          )}
        </div>
      )}

      {audioUrl && (
        <div className="mt-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-4">
              <button
                onClick={togglePlayback}
                className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg"
              >
                {isPlaying ? (
                  <div className="w-4 h-4 bg-white rounded-sm"></div>
                ) : (
                  <div className="w-0 h-0 border-l-[6px] border-l-white border-y-[4px] border-y-transparent ml-1"></div>
                )}
              </button>
              
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">Voice Presentation</p>
                <p className="text-xs text-gray-500">Click to play</p>
              </div>
              
              <div className="text-sm text-gray-500">
                {isOwner ? 'Your recording' : 'Voice message'}
              </div>
            </div>
          </div>
          
          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={() => setIsPlaying(false)}
            onPause={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
            className="hidden"
          />
        </div>
      )}

      {!audioUrl && !isOwner && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">🎤</div>
          <p>No voice presentation available</p>
        </div>
      )}
    </div>
  );
}
