"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { NewsArticle, Voice } from "./api";

function pickSpeechVoice(voices: SpeechSynthesisVoice[], voice?: Voice) {
  if (voices.length === 0) return undefined;
  if (voice?.language === "Hindi") {
    return (
      voices.find((v) => v.lang.toLowerCase().startsWith("hi")) ??
      voices.find((v) => v.lang.toLowerCase().startsWith("en-in"))
    );
  }
  if (voice?.accent === "British") {
    return voices.find((v) => v.lang.toLowerCase() === "en-gb") ?? voices.find((v) => v.lang.startsWith("en"));
  }
  if (voice?.accent === "American") {
    return voices.find((v) => v.lang.toLowerCase() === "en-us") ?? voices.find((v) => v.lang.startsWith("en"));
  }
  return voices.find((v) => v.default) ?? voices[0];
}

// Drives the personalized-news "audio brief": queues each article's narration
// through the browser's built-in speech synthesis, so the feed is genuinely
// played aloud rather than just simulated with a progress bar.
export function useNarrator(articles: NewsArticle[], voice?: Voice) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const queueRef = useRef<NewsArticle[]>([]);
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;

  useEffect(() => {
    return () => {
      if (supported) window.speechSynthesis.cancel();
    };
  }, [supported]);

  const speakNext = useCallback(() => {
    const next = queueRef.current.shift();
    if (!next) {
      setPlayingId(null);
      return;
    }
    setPlayingId(next.id);
    const utterance = new SpeechSynthesisUtterance(`${next.title}. ${next.narration}`);
    const voices = window.speechSynthesis.getVoices();
    const match = pickSpeechVoice(voices, voice);
    if (match) utterance.voice = match;
    utterance.rate = 1;
    utterance.onend = () => speakNext();
    utterance.onerror = () => speakNext();
    window.speechSynthesis.speak(utterance);
  }, [voice]);

  const playFrom = useCallback(
    (startId?: string) => {
      if (!supported) return;
      window.speechSynthesis.cancel();
      const startIndex = startId ? articles.findIndex((a) => a.id === startId) : 0;
      queueRef.current = articles.slice(Math.max(startIndex, 0));
      setIsPaused(false);
      speakNext();
    },
    [articles, speakNext, supported]
  );

  const pause = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
  }, [supported]);

  const resume = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.resume();
    setIsPaused(false);
  }, [supported]);

  const stop = useCallback(() => {
    if (!supported) return;
    queueRef.current = [];
    window.speechSynthesis.cancel();
    setPlayingId(null);
    setIsPaused(false);
  }, [supported]);

  return { playingId, isPaused, supported, playFrom, pause, resume, stop };
}
