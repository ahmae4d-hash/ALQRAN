import { createContext, useContext, useEffect, useRef, useState } from "react";
import { getAudioUrl, getReciter } from "@/lib/reciters";
import { useSettings } from "./SettingsContext";

interface AudioState {
  isPlaying: boolean;
  currentSurah: number;
  currentVerse: number;
  duration: number;
  currentTime: number;
  volume: number;
  isMuted: boolean;
  isLoading: boolean;
  reciterId: string;
}

interface AudioContextValue extends AudioState {
  play: (surah: number, verse: number) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  seek: (time: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  nextVerse: (maxVerses: number) => void;
  prevVerse: () => void;
  setReciter: (id: string) => void;
}

const AudioContext = createContext<AudioContextValue>({} as AudioContextValue);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const { settings, updateSettings } = useSettings();
  const audioRef = useRef<HTMLAudioElement>(new Audio());
  const [state, setState] = useState<AudioState>({
    isPlaying: false,
    currentSurah: 1,
    currentVerse: 1,
    duration: 0,
    currentTime: 0,
    volume: 1,
    isMuted: false,
    isLoading: false,
    reciterId: "yasser_dosari",
  });

  useEffect(() => {
    const audio = audioRef.current;
    const onTimeUpdate = () => setState((s) => ({ ...s, currentTime: audio.currentTime }));
    const onDurationChange = () => setState((s) => ({ ...s, duration: audio.duration || 0 }));
    const onEnded = () => setState((s) => ({ ...s, isPlaying: false }));
    const onWaiting = () => setState((s) => ({ ...s, isLoading: true }));
    const onCanPlay = () => setState((s) => ({ ...s, isLoading: false }));

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("canplay", onCanPlay);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("canplay", onCanPlay);
    };
  }, []);

  useEffect(() => {
    if (settings.selectedReciterId) {
      setState((s) => ({ ...s, reciterId: settings.selectedReciterId }));
    }
  }, [settings.selectedReciterId]);

  const play = (surah: number, verse: number) => {
    const audio = audioRef.current;
    const reciter = getReciter(state.reciterId);
    const url = getAudioUrl(reciter, surah, verse);
    audio.src = url;
    audio.playbackRate = settings.playbackSpeed || 1;
    audio.play().then(() => {
      setState((s) => ({ ...s, isPlaying: true, currentSurah: surah, currentVerse: verse }));
    }).catch(() => {
      setState((s) => ({ ...s, isPlaying: false, isLoading: false }));
    });
    setState((s) => ({ ...s, isLoading: true, currentSurah: surah, currentVerse: verse }));
  };

  const pause = () => {
    audioRef.current.pause();
    setState((s) => ({ ...s, isPlaying: false }));
  };

  const resume = () => {
    audioRef.current.play().then(() => setState((s) => ({ ...s, isPlaying: true })));
  };

  const stop = () => {
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setState((s) => ({ ...s, isPlaying: false, currentTime: 0 }));
  };

  const seek = (time: number) => {
    audioRef.current.currentTime = time;
    setState((s) => ({ ...s, currentTime: time }));
  };

  const setVolume = (vol: number) => {
    audioRef.current.volume = vol;
    setState((s) => ({ ...s, volume: vol, isMuted: vol === 0 }));
  };

  const toggleMute = () => {
    const newMuted = !state.isMuted;
    audioRef.current.muted = newMuted;
    setState((s) => ({ ...s, isMuted: newMuted }));
  };

  const nextVerse = (maxVerses: number) => {
    const next = state.currentVerse + 1;
    if (next <= maxVerses) play(state.currentSurah, next);
  };

  const prevVerse = () => {
    if (state.currentVerse > 1) play(state.currentSurah, state.currentVerse - 1);
  };

  const setReciter = (id: string) => {
    setState((s) => ({ ...s, reciterId: id }));
    updateSettings({ selectedReciterId: id });
    if (state.isPlaying) {
      play(state.currentSurah, state.currentVerse);
    }
  };

  return (
    <AudioContext.Provider value={{ ...state, play, pause, resume, stop, seek, setVolume, toggleMute, nextVerse, prevVerse, setReciter }}>
      {children}
    </AudioContext.Provider>
  );
}

export const useAudio = () => useContext(AudioContext);
