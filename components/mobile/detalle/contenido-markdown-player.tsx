"use client";

import ReactMarkdown from "react-markdown";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

type ContenidoMarkdownPlayerProps = {
  contenido: string;
};

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

const markdownComponents = {
  h1: ({ children }: { children?: ReactNode }) => (
    <h1 className="mb-4 mt-6 text-2xl font-extrabold leading-tight text-[var(--td-ink)] first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }: { children?: ReactNode }) => (
    <h2 className="mb-3 mt-5 text-xl font-bold leading-snug text-[var(--td-ink)] first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }: { children?: ReactNode }) => (
    <h3 className="mb-2 mt-4 text-lg font-bold leading-snug text-[var(--td-ink)] first:mt-0">
      {children}
    </h3>
  ),
  p: ({ children }: { children?: ReactNode }) => (
    <p className="mb-3 text-[15px] leading-relaxed text-[var(--td-ink-soft)] last:mb-0">
      {children}
    </p>
  ),
  ul: ({ children }: { children?: ReactNode }) => (
    <ul className="mb-3 list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed text-[var(--td-ink-soft)]">
      {children}
    </ul>
  ),
  ol: ({ children }: { children?: ReactNode }) => (
    <ol className="mb-3 list-decimal space-y-1.5 pl-5 text-[15px] leading-relaxed text-[var(--td-ink-soft)]">
      {children}
    </ol>
  ),
  li: ({ children }: { children?: ReactNode }) => (
    <li className="pl-0.5">{children}</li>
  ),
  code: ({
    inline,
    children,
  }: {
    inline?: boolean;
    children?: ReactNode;
  }) =>
    inline ? (
      <code className="rounded bg-[var(--td-line-soft)] px-1.5 py-0.5 font-mono text-[13px] text-[var(--td-ink)]">
        {children}
      </code>
    ) : (
      <code className="block overflow-x-auto rounded-xl bg-[var(--td-line-soft)] p-3 font-mono text-[13px] leading-relaxed text-[var(--td-ink)]">
        {children}
      </code>
    ),
  pre: ({ children }: { children?: ReactNode }) => (
    <pre className="mb-3 last:mb-0">{children}</pre>
  ),
  blockquote: ({ children }: { children?: ReactNode }) => (
    <blockquote className="mb-3 border-l-4 border-[var(--td-line)] pl-4 text-[15px] italic leading-relaxed text-[var(--td-ink-soft)]">
      {children}
    </blockquote>
  ),
  a: ({
    href,
    children,
  }: {
    href?: string;
    children?: ReactNode;
  }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-semibold text-[var(--td-navy)] underline underline-offset-2"
    >
      {children}
    </a>
  ),
};

export function ContenidoMarkdownPlayer({ contenido }: ContenidoMarkdownPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const speakTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasActiveSynthesis = isPlaying || isPaused;

  const handlePlay = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
      setIsPaused(false);
      return;
    }

    window.speechSynthesis.cancel();
    if (speakTimerRef.current) clearTimeout(speakTimerRef.current);

    const utterance = new SpeechSynthesisUtterance(stripMarkdown(contenido));
    utterance.lang = "es";

    // Seleccionar voz explícita — requerido en Android Chrome donde las voces
    // se cargan de forma asíncrona y speak() falla silenciosamente sin voice set
    const voices = voicesRef.current.length > 0
      ? voicesRef.current
      : window.speechSynthesis.getVoices();
    const esVoice = voices.find(v => v.lang.startsWith("es")) ?? voices[0];
    if (esVoice) utterance.voice = esVoice;

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };
    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    setIsPlaying(true);
    setIsPaused(false);
    // Delay entre cancel() y speak() — workaround para bug de Android Chrome
    // donde speak() inmediato tras cancel() se descarta silenciosamente
    speakTimerRef.current = setTimeout(() => {
      speakTimerRef.current = null;
      window.speechSynthesis.speak(utterance);
    }, 50);
  }, [contenido, isPaused]);

  const handlePause = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.pause();
    setIsPlaying(false);
    setIsPaused(true);
  }, []);

  const handleStop = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    if (speakTimerRef.current) {
      clearTimeout(speakTimerRef.current);
      speakTimerRef.current = null;
    }
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    // Pre-cargar voces para Android Chrome (se cargan de forma asíncrona)
    const loadVoices = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
    };
    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
      if (speakTimerRef.current) clearTimeout(speakTimerRef.current);
      window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <div className="relative flex flex-col">
      <article className="pb-20">
        <ReactMarkdown components={markdownComponents}>{contenido}</ReactMarkdown>
      </article>

      <div className="sticky bottom-0 -mx-1 mt-2 border-t border-[var(--td-line)] bg-[var(--td-zone)] px-1 py-3">
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={handlePlay}
            disabled={isPlaying}
            className="inline-flex min-w-[7.5rem] items-center justify-center gap-1.5 rounded-xl border border-[var(--td-line)] bg-[var(--td-card)] px-4 py-2.5 text-sm font-bold text-[var(--td-ink)] transition-[colors,transform] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ▶ Reproducir
          </button>
          <button
            type="button"
            onClick={handlePause}
            disabled={!isPlaying}
            className="inline-flex min-w-[7.5rem] items-center justify-center gap-1.5 rounded-xl border border-[var(--td-line)] bg-[var(--td-card)] px-4 py-2.5 text-sm font-bold text-[var(--td-ink)] transition-[colors,transform] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ⏸ Pausar
          </button>
          <button
            type="button"
            onClick={handleStop}
            disabled={!hasActiveSynthesis}
            className="inline-flex min-w-[7.5rem] items-center justify-center gap-1.5 rounded-xl border border-[var(--td-line)] bg-[var(--td-card)] px-4 py-2.5 text-sm font-bold text-[var(--td-ink)] transition-[colors,transform] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ⏹ Detener
          </button>
        </div>
      </div>
    </div>
  );
}
