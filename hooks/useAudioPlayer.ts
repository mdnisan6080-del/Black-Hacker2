
import { useState, useCallback, useRef, useEffect } from 'react';
import { generateSpeech } from '../services/geminiService';

// Helper functions for audio decoding
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


export function useAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    // Initialize AudioContext on user interaction (or component mount)
    // Note: It's best to create it after a user gesture
    if (!audioContextRef.current) {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
            audioContextRef.current = new AudioContext({ sampleRate: 24000 });
        }
    }
    
    return () => {
        audioContextRef.current?.close();
    }
  }, []);
  
  const play = useCallback(async (text: string) => {
    if (!audioContextRef.current || isPlaying) return;
    
    // Resume context if suspended
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }
    
    setIsPlaying(true);

    try {
      const base64Audio = await generateSpeech(text);
      if (base64Audio && audioContextRef.current) {
        const audioData = decode(base64Audio);
        const audioBuffer = await decodeAudioData(audioData, audioContextRef.current, 24000, 1);
        
        if (sourceRef.current) {
            sourceRef.current.stop();
        }

        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);
        source.onended = () => {
          setIsPlaying(false);
          sourceRef.current = null;
        };
        source.start();
        sourceRef.current = source;
      } else {
        setIsPlaying(false);
      }
    } catch (error) {
      console.error("Failed to play audio:", error);
      setIsPlaying(false);
    }
  }, [isPlaying]);

  return { play, isPlaying };
}
