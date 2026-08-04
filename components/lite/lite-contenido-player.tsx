"use client";

import { Pause, Play, Square } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  clearLiteTtsProgress,
  estimateSpeechSeconds,
  formatSpeechDuration,
  liteTtsFingerprint,
  progressFromChars,
  readLiteTtsProgress,
  writeLiteTtsProgress,
} from "@/lib/lite-tts-progress";

type LiteContenidoPlayerProps = {
  contenido: string;
  /** Clave local por ítem (kind+id). Obligatorio: nunca avance global. */
  progressKey: string;
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
 * Barra orientativa + estimado; avance guardado por ítem en localStorage.
 */
export function LiteContenidoPlayer({
  contenido,
  progressKey,
}: LiteContenidoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [chunkIndex, setChunkIndex] = useState(0);
  const [fractionInChunk, setFractionInChunk] = useState(0);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const runIdRef = useRef(0);
  const chunkIndexRef = useRef(0);
  const fractionRef = useRef(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const plain = useMemo(() => stripMarkdown(contenido), [contenido]);
  const chunks = useMemo(() => splitIntoChunks(plain), [plain]);
  const fingerprint = useMemo(() => liteTtsFingerprint(plain), [plain]);
  const estimatedLabel = useMemo(
    () => formatSpeechDuration(estimateSpeechSeconds(plain)),
    [plain],
  );

  const hasActive = isPlaying || isPaused;
  const progress = progressFromChars(chunks, chunkIndex, fractionInChunk);

  const stopTick = useCallback(() => {
    if (tickRef.current != null) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, []);

  const persist = useCallback(
    (index: number, fraction = 0) => {
      if (chunks.length === 0) return;
      if (index >= chunks.length) {
        clearLiteTtsProgress(progressKey);
        return;
      }
      // Sin índice avanzado no hay nada que retomar.
      if (index <= 0) return;
      writeLiteTtsProgress(progressKey, {
        fingerprint,
        index,
        chunkIndex: 0,
      });
      void fraction;
    },
    [chunks.length, fingerprint, progressKey],
  );

  const startTick = useCallback(
    (chunkText: string, baseIndex: number) => {
      stopTick();
      const chunkSec = Math.max(0.4, estimateSpeechSeconds(chunkText));
      const startedAt = Date.now();
      tickRef.current = setInterval(() => {
        const frac = Math.min(0.95, (Date.now() - startedAt) / (chunkSec * 1000));
        fractionRef.current = frac;
        setFractionInChunk(frac);
        persist(baseIndex, frac);
      }, 250);
    },
    [persist, stopTick],
  );

  const stopAll = useCallback(() => {
    runIdRef.current += 1;
    stopTick();
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
    // Stop no borra avance: queda para retomar.
    persist(chunkIndexRef.current, fractionRef.current);
  }, [persist, stopTick]);

  const speakFrom = useCallback(
    (startIndex: number) => {
      if (typeof window === "undefined" || !window.speechSynthesis) return;
      if (chunks.length === 0) return;

      const runId = ++runIdRef.current;
      window.speechSynthesis.cancel();
      stopTick();

      const voices =
        voicesRef.current.length > 0
          ? voicesRef.current
          : window.speechSynthesis.getVoices();
      const esVoice = voices.find((v) => v.lang.startsWith("es"));

      const speakChunk = (i: number) => {
        if (runId !== runIdRef.current) return;
        if (i >= chunks.length) {
          stopTick();
          clearLiteTtsProgress(progressKey);
          chunkIndexRef.current = 0;
          fractionRef.current = 0;
          setChunkIndex(0);
          setFractionInChunk(0);
          setIsPlaying(false);
          setIsPaused(false);
          return;
        }

        chunkIndexRef.current = i;
        fractionRef.current = 0;
        setChunkIndex(i);
        setFractionInChunk(0);
        persist(i, 0);
        setIsPlaying(true);
        setIsPaused(false);

        const utt = new SpeechSynthesisUtterance(chunks[i]);
        if (esVoice) {
          utt.voice = esVoice;
          utt.lang = esVoice.lang;
        }
        utt.onerror = () => {
          if (runId !== runIdRef.current) return;
          stopTick();
          persist(chunkIndexRef.current, fractionRef.current);
          setIsPlaying(false);
          setIsPaused(false);
        };
        utt.onend = () => {
          if (runId !== runIdRef.current) return;
          stopTick();
          speakChunk(i + 1);
        };

        startTick(chunks[i], i);
        window.speechSynthesis.speak(utt);
      };

      speakChunk(Math.max(0, Math.min(startIndex, chunks.length - 1)));
    },
    [chunks, persist, progressKey, startTick, stopTick],
  );

  const handlePlay = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
      setIsPaused(false);
      const text = chunks[chunkIndexRef.current] ?? "";
      if (text) startTick(text, chunkIndexRef.current);
      return;
    }

    const start =
      chunkIndexRef.current > 0 && chunkIndexRef.current < chunks.length
        ? chunkIndexRef.current
        : 0;
    speakFrom(start);
  }, [chunks, isPaused, speakFrom, startTick]);

  const handlePause = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.pause();
    stopTick();
    persist(chunkIndexRef.current, fractionRef.current);
    setIsPlaying(false);
    setIsPaused(true);
  }, [persist, stopTick]);

  // Cargar avance guardado al montar / al cambiar clave o texto.
  useEffect(() => {
    const saved = readLiteTtsProgress(progressKey, fingerprint);
    const idx =
      saved && saved.index >= 0 && saved.index < chunks.length ? saved.index : 0;
    chunkIndexRef.current = idx;
    fractionRef.current = 0;
    setChunkIndex(idx);
    setFractionInChunk(0);
  }, [progressKey, fingerprint, chunks.length]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    const loadVoices = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
    };
    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);

    const flush = () => {
      persist(chunkIndexRef.current, fractionRef.current);
    };
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", flush);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", flush);
      runIdRef.current += 1;
      stopTick();
      flush();
      window.speechSynthesis.cancel();
    };
  }, [persist, stopTick]);

  // Si cambia el contenido (otro ítem / texto distinto), cortar voz.
  useEffect(() => {
    runIdRef.current += 1;
    stopTick();
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
  }, [contenido, progressKey, stopTick]);

  const etiqueta = isPlaying
    ? "Reproduciendo…"
    : isPaused
      ? "En pausa"
      : chunkIndex > 0
        ? "Continuar lectura"
        : "Escuchar contenido";

  const progressPct = `${Math.round(progress * 1000) / 10}%`;

  return (
    <div className="flex flex-col gap-3">
      <div className="lite-tts-bar">
        <div className="lite-tts-card">
          <div className="lite-tts-card-main">
            <button
              type="button"
              onClick={handlePlay}
              disabled={isPlaying || !contenido.trim()}
              className="lite-tts-play"
              aria-label={isPaused || chunkIndex > 0 ? "Continuar" : "Escuchar contenido"}
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

          <div
            className="lite-tts-progress"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress * 100)}
            aria-label="Avance de lectura"
          >
            <div className="lite-tts-progress-track">
              <div
                className="lite-tts-progress-fill"
                style={{ width: progressPct }}
              />
            </div>
            <span className="lite-tts-progress-time">{estimatedLabel}</span>
          </div>
        </div>
      </div>

      <article className="lite-panel lite-prose p-5">
        <ReactMarkdown>{contenido}</ReactMarkdown>
      </article>
    </div>
  );
}
