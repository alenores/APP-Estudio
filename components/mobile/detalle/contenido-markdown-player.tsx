"use client";

import ReactMarkdown from "react-markdown";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

type ContenidoMarkdownPlayerProps = {
  contenido: string;
};

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
        text.lastIndexOf("\n", end)
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

  const hasActiveSynthesis = isPlaying || isPaused;

  const handlePlay = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
      setIsPaused(false);
      return;
    }

    const voices = voicesRef.current.length > 0
      ? voicesRef.current
      : window.speechSynthesis.getVoices();
    const esVoice = voices.find(v => v.lang.startsWith("es"));

    // Chrome Android falla con synthesis-failed para textos largos.
    // Solución: dividir en chunks y encolarlos como utterances separadas.
    const chunks = splitIntoChunks(stripMarkdown(contenido));

    chunks.forEach((chunk, i) => {
      const utt = new SpeechSynthesisUtterance(chunk);
      if (esVoice) {
        utt.voice = esVoice;
        utt.lang = esVoice.lang;
      }
      utt.onerror = () => {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
        setIsPaused(false);
      };
      if (i === chunks.length - 1) {
        utt.onend = () => {
          setIsPlaying(false);
          setIsPaused(false);
        };
      }
      window.speechSynthesis.speak(utt);
    });

    setIsPlaying(true);
    setIsPaused(false);
  }, [contenido, isPaused]);

  const handlePause = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.pause();
    setIsPlaying(false);
    setIsPaused(true);
  }, []);

  const handleStop = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
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
      window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <div className="relative flex flex-col">
      {/* Mini-player sticky — visible al abrir Contenido y durante el scroll */}
      <div className="sticky top-[72px] z-[9] -mx-1 mb-4 bg-[var(--td-zone)] px-1 pb-3 pt-1">
        <div className="flex items-center gap-3 rounded-2xl border border-[var(--td-line)] bg-[var(--td-card)] px-3 py-2.5 shadow-[var(--td-shadow)]">
          {/* Botón play circular — acento principal */}
          <button
            type="button"
            onClick={handlePlay}
            disabled={isPlaying}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--td-navy)] text-white shadow-sm transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-35"
          >
            <span className="text-base leading-none">▶</span>
          </button>

          {/* Etiqueta de estado */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold leading-snug text-[var(--td-ink)]">
              {isPlaying ? "Reproduciendo…" : isPaused ? "En pausa" : "Escuchar contenido"}
            </p>
            {isPaused && (
              <p className="text-[11px] leading-tight text-[var(--td-ink-soft)]">
                Toca ▶ para continuar
              </p>
            )}
          </div>

          {/* Pausar */}
          <button
            type="button"
            onClick={handlePause}
            disabled={!isPlaying}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--td-line)] text-[var(--td-ink-soft)] transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-25"
          >
            <span className="text-sm leading-none">⏸</span>
          </button>

          {/* Detener */}
          <button
            type="button"
            onClick={handleStop}
            disabled={!hasActiveSynthesis}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--td-line)] text-[var(--td-ink-soft)] transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-25"
          >
            <span className="text-sm leading-none">⏹</span>
          </button>
        </div>
      </div>

      <article>
        <ReactMarkdown components={markdownComponents}>{contenido}</ReactMarkdown>
      </article>
    </div>
  );
}
