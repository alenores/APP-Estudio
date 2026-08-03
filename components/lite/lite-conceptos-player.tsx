"use client";

import { Lightbulb, Pause, Play, Square } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Concepto } from "@/app/types/estudio";

type LiteConceptosPlayerProps = {
  conceptos: Concepto[];
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

function textoConcepto(c: Concepto): string {
  const titulo = c.titulo.trim();
  const desc = c.descripcion.trim();
  if (titulo && desc) return `${titulo}. ${desc}`;
  return titulo || desc;
}

/**
 * Mini-player de conceptos en lite: lee título + descripción uno detrás de otro
 * (misma idea que el play de contenido Markdown en clases).
 */
export function LiteConceptosPlayer({ conceptos }: LiteConceptosPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activoId, setActivoId] = useState<number | null>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const runIdRef = useRef(0);
  const indexRef = useRef(0);

  const hasActive = isPlaying || isPaused;
  const conceptosKey = useMemo(
    () => conceptos.map((c) => c.id).join(","),
    [conceptos],
  );

  const stopAll = useCallback(() => {
    runIdRef.current += 1;
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
    setActivoId(null);
    indexRef.current = 0;
  }, []);

  const speakFrom = useCallback(
    (startIndex: number) => {
      if (typeof window === "undefined" || !window.speechSynthesis) return;
      if (conceptos.length === 0) return;

      const runId = ++runIdRef.current;
      window.speechSynthesis.cancel();

      const voices =
        voicesRef.current.length > 0
          ? voicesRef.current
          : window.speechSynthesis.getVoices();
      const esVoice = voices.find((v) => v.lang.startsWith("es"));

      const speakIndex = (i: number) => {
        if (runId !== runIdRef.current) return;
        if (i >= conceptos.length) {
          setIsPlaying(false);
          setIsPaused(false);
          setActivoId(null);
          indexRef.current = 0;
          return;
        }

        indexRef.current = i;
        const concepto = conceptos[i];
        setActivoId(concepto.id);
        setIsPlaying(true);
        setIsPaused(false);

        const chunks = splitIntoChunks(textoConcepto(concepto));
        if (chunks.length === 0) {
          speakIndex(i + 1);
          return;
        }

        chunks.forEach((chunk, chunkIdx) => {
          const utt = new SpeechSynthesisUtterance(chunk);
          if (esVoice) {
            utt.voice = esVoice;
            utt.lang = esVoice.lang;
          }
          utt.onerror = () => {
            if (runId !== runIdRef.current) return;
            stopAll();
          };
          if (chunkIdx === chunks.length - 1) {
            utt.onend = () => {
              if (runId !== runIdRef.current) return;
              speakIndex(i + 1);
            };
          }
          window.speechSynthesis.speak(utt);
        });
      };

      speakIndex(startIndex);
    },
    [conceptos, stopAll],
  );

  const handlePlay = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
      setIsPaused(false);
      return;
    }

    speakFrom(0);
  }, [isPaused, speakFrom]);

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

  // Si cambia el listado (otro ítem), cortar reproducción.
  useEffect(() => {
    stopAll();
  }, [conceptosKey, stopAll]);

  const etiqueta = isPlaying
    ? activoId != null
      ? `Leyendo ${conceptos.findIndex((c) => c.id === activoId) + 1} de ${conceptos.length}`
      : "Reproduciendo…"
    : isPaused
      ? "En pausa"
      : "Escuchar conceptos";

  return (
    <div className="flex flex-col gap-3">
      <div className="lite-tts-bar">
        <div className="lite-tts-card">
          <button
            type="button"
            onClick={handlePlay}
            disabled={isPlaying || conceptos.length === 0}
            className="lite-tts-play"
            aria-label={isPaused ? "Continuar" : "Escuchar conceptos"}
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
                {conceptos.length} en secuencia
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

      <ul className="space-y-2.5">
        {conceptos.map((concepto, i) => {
          const activo = concepto.id === activoId;
          return (
            <li
              key={concepto.id}
              className="lite-panel p-4 transition-[border-color,background] duration-150"
              data-tts-active={activo ? "true" : undefined}
              style={
                activo
                  ? {
                      borderColor: "color-mix(in srgb, var(--lt-accent) 45%, var(--lt-line))",
                      background:
                        "color-mix(in srgb, var(--lt-accent) 8%, var(--lt-surface))",
                    }
                  : undefined
              }
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-[22px] w-[22px] flex-none items-center justify-center">
                  {activo && isPlaying ? (
                    <span
                      className="lite-tts-pulse h-2 w-2 rounded-full bg-[var(--lt-accent)]"
                      aria-hidden
                    />
                  ) : (
                    <Lightbulb
                      className="h-[17px] w-[17px] text-[var(--lt-accent)]"
                      strokeWidth={2}
                      aria-hidden
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[11px] font-semibold tabular-nums text-[var(--lt-text-3)]">
                      {i + 1}
                    </span>
                    <p className="lite-title">{concepto.titulo}</p>
                  </div>
                  <p className="mt-1.5 whitespace-pre-line text-[14px] leading-relaxed text-[var(--lt-text-2)]">
                    {concepto.descripcion}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
