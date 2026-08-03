"use client";

import { Pause, Play, Square } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useCallback, useEffect, useRef, useState } from "react";

type LiteContenidoPlayerProps = {
  contenido: string;
};

/** Chrome Android falla con textos largos: trozos cortos en cola. */
function splitIntoChunks(text: string, maxLen = 160): string[] {
  if (text.length <= maxLen) return [text];
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    let end = Math.min(start + maxLen, text.length);
    if (end < text.length) {
      const sentenceEnd = Math.max(
        text.lastIndexOf(". ", end),
        text.lastIndexOf("! ", end),
        text.lastIndexOf("? ", end),
        text.lastIndexOf("\n", end),
      );
      if (sentenceEnd > start) {
        end = sentenceEnd + 1;
      } else {
        const wordEnd = text.lastIndexOf(" ", end);
        if (wordEnd > start) end = wordEnd;
      }
    }
    const chunk = text.slice(start, end).trim();
    if (chunk) chunks.push(chunk);
    start = end;
  }
  return chunks;
}

function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/[#*`>~_\-|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Reproductor TTS + renderizado de Markdown para la vista Lite.
 * Mantiene la misma estética que LiteConceptosPlayer.
 */
export function LiteContenidoPlayer({ contenido }: LiteContenidoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const runIdRef = useRef(0);

  const hasActive = isPlaying || isPaused;

  const stopAll = useCallback(() => {
    runIdRef.current += 1;
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
  }, []);

  const handlePlay = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
      setIsPaused(false);
      return;
    }

    const runId = ++runIdRef.current;
    window.speechSynthesis.cancel();

    const voices =
      voicesRef.current.length > 0
        ? voicesRef.current
        : window.speechSynthesis.getVoices();
    const esVoice = voices.find((v) => v.lang.startsWith("es"));

    const textToRead = stripMarkdown(contenido);
    const chunks = splitIntoChunks(textToRead);

    if (chunks.length === 0) return;

    setIsPlaying(true);
    setIsPaused(false);

    let currentIndex = 0;

    const speakChunk = (i: number) => {
      if (runId !== runIdRef.current) return;
      if (i >= chunks.length) {
        setIsPlaying(false);
        setIsPaused(false);
        return;
      }

      const utt = new SpeechSynthesisUtterance(chunks[i]);
      if (esVoice) {
        utt.voice = esVoice;
        utt.lang = esVoice.lang;
      }
      utt.onerror = () => {
        if (runId !== runIdRef.current) return;
        stopAll();
      };
      utt.onend = () => {
        if (runId !== runIdRef.current) return;
        speakChunk(i + 1);
      };
      
      window.speechSynthesis.speak(utt);
    };

    speakChunk(0);
  }, [contenido, isPaused, stopAll]);

  const handlePause = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.pause();
    setIsPlaying(false);
    setIsPaused(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    const loadVoices = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
    };
    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
      runIdRef.current += 1;
      window.speechSynthesis.cancel();
    };
  }, []);

  // Si cambia el contenido, cortar reproducción.
  useEffect(() => {
    stopAll();
  }, [contenido, stopAll]);

  const etiqueta = isPlaying
    ? "Reproduciendo…"
    : isPaused
      ? "En pausa"
      : "Escuchar contenido";

  return (
    <div className="flex flex-col gap-3">
      <div className="lite-tts-bar">
        <div className="lite-tts-card">
          <button
            type="button"
            onClick={handlePlay}
            disabled={isPlaying || !contenido.trim()}
            className="lite-tts-play"
            aria-label={isPaused ? "Continuar" : "Escuchar contenido"}
          >
            <Play className="h-[15px] w-[15px]" fill="currentColor" strokeWidth={0} aria-hidden />
          </button>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold leading-snug text-[var(--lt-text)]">
              {etiqueta}
            </p>
            {isPaused ? (
              <p className="text-[11px] leading-tight text-[var(--lt-text-3)]">
                Toca ▶ para continuar
              </p>
            ) : !hasActive ? (
              <p className="text-[11px] leading-tight text-[var(--lt-text-3)]">
                Lectura en voz alta
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={handlePause}
            disabled={!isPlaying}
            className="lite-tts-ctrl"
            aria-label="Pausar"
          >
            <Pause className="h-[14px] w-[14px]" strokeWidth={2.25} aria-hidden />
          </button>

          <button
            type="button"
            onClick={stopAll}
            disabled={!hasActive}
            className="lite-tts-ctrl"
            aria-label="Detener"
          >
            <Square className="h-[12px] w-[12px]" fill="currentColor" strokeWidth={0} aria-hidden />
          </button>
        </div>
      </div>

      <article className="lite-panel lite-prose p-5">
        <ReactMarkdown>{contenido}</ReactMarkdown>
      </article>
    </div>
  );
}
