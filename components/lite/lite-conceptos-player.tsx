"use client";

import { Lightbulb, Pause, Play, Square } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Concepto } from "@/app/types/estudio";
import { useLiteTtsFollowScroll } from "@/app/hooks/useLiteTtsFollowScroll";
import { splitIntoChunks } from "@/lib/lite-tts-blocks";
import {
  clearLiteTtsProgress,
  estimateSpeechSeconds,
  formatSpeechDuration,
  liteTtsFingerprint,
  progressFromChars,
  readLiteTtsProgress,
  writeLiteTtsProgress,
} from "@/lib/lite-tts-progress";

type LiteConceptosPlayerProps = {
  conceptos: Concepto[];
  /** Clave local por ítem padre (kind+id). Obligatorio: nunca avance global. */
  progressKey: string;
};

function textoConcepto(c: Concepto): string {
  const titulo = c.titulo.trim();
  const desc = c.descripcion.trim();
  if (titulo && desc) return `${titulo}. ${desc}`;
  return titulo || desc;
}

/**
 * Mini-player de conceptos: marca el activo, lo centra y permite scrollear
 * para saltar al concepto del medio de la pantalla.
 */
export function LiteConceptosPlayer({
  conceptos,
  progressKey,
}: LiteConceptosPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activoId, setActivoId] = useState<number | null>(null);
  const [conceptoIndex, setConceptoIndex] = useState(0);
  const [fractionInConcepto, setFractionInConcepto] = useState(0);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const runIdRef = useRef(0);
  const indexRef = useRef(0);
  const chunkInConceptoRef = useRef(0);
  const fractionRef = useRef(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const itemElsRef = useRef<Array<HTMLElement | null>>([]);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const speakFromRef = useRef<(startIndex: number, startChunk?: number) => void>(
    () => {},
  );

  const hasActive = isPlaying || isPaused;
  const conceptosKey = useMemo(
    () => conceptos.map((c) => c.id).join(","),
    [conceptos],
  );

  const textos = useMemo(() => conceptos.map(textoConcepto), [conceptos]);
  const fingerprint = useMemo(
    () => liteTtsFingerprint(textos.join("\n")),
    [textos],
  );
  const estimatedLabel = useMemo(
    () => formatSpeechDuration(estimateSpeechSeconds(textos.join(" "))),
    [textos],
  );

  const progress = progressFromChars(
    textos,
    conceptoIndex,
    fractionInConcepto,
  );

  const stopTick = useCallback(() => {
    if (tickRef.current != null) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, []);

  const persist = useCallback(
    (index: number, chunkIndex: number, fraction = 0) => {
      if (conceptos.length === 0) return;
      if (index >= conceptos.length) {
        clearLiteTtsProgress(progressKey);
        return;
      }
      if (index <= 0 && chunkIndex <= 0) return;
      writeLiteTtsProgress(progressKey, {
        fingerprint,
        index,
        chunkIndex,
      });
      void fraction;
    },
    [conceptos.length, fingerprint, progressKey],
  );

  const startTick = useCallback(
    (
      chunkText: string,
      conceptoIdx: number,
      chunkIdx: number,
      chunksLen: number,
    ) => {
      stopTick();
      const chunkSec = Math.max(0.4, estimateSpeechSeconds(chunkText));
      const startedAt = Date.now();
      const baseFrac = chunksLen > 0 ? chunkIdx / chunksLen : 0;
      const span = chunksLen > 0 ? 1 / chunksLen : 1;
      tickRef.current = setInterval(() => {
        const local = Math.min(
          0.95,
          (Date.now() - startedAt) / (chunkSec * 1000),
        );
        const frac = Math.min(0.95, baseFrac + local * span);
        fractionRef.current = frac;
        setFractionInConcepto(frac);
        persist(conceptoIdx, chunkIdx, frac);
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
    setActivoId(null);
    persist(indexRef.current, chunkInConceptoRef.current, fractionRef.current);
  }, [persist, stopTick]);

  const speakFrom = useCallback(
    (startIndex: number, startChunk = 0) => {
      if (typeof window === "undefined" || !window.speechSynthesis) return;
      if (conceptos.length === 0) return;

      const runId = ++runIdRef.current;
      window.speechSynthesis.cancel();
      stopTick();

      const voices =
        voicesRef.current.length > 0
          ? voicesRef.current
          : window.speechSynthesis.getVoices();
      const esVoice = voices.find((v) => v.lang.startsWith("es"));

      const speakIndex = (i: number, fromChunk: number) => {
        if (runId !== runIdRef.current) return;
        if (i >= conceptos.length) {
          stopTick();
          clearLiteTtsProgress(progressKey);
          indexRef.current = 0;
          chunkInConceptoRef.current = 0;
          fractionRef.current = 0;
          setConceptoIndex(0);
          setFractionInConcepto(0);
          setIsPlaying(false);
          setIsPaused(false);
          setActivoId(null);
          return;
        }

        indexRef.current = i;
        const concepto = conceptos[i];
        setActivoId(concepto.id);
        setConceptoIndex(i);
        setIsPlaying(true);
        setIsPaused(false);

        const chunks = splitIntoChunks(textoConcepto(concepto));
        if (chunks.length === 0) {
          speakIndex(i + 1, 0);
          return;
        }

        const firstChunk = Math.max(0, Math.min(fromChunk, chunks.length - 1));

        const speakChunk = (chunkIdx: number) => {
          if (runId !== runIdRef.current) return;
          if (chunkIdx >= chunks.length) {
            speakIndex(i + 1, 0);
            return;
          }

          chunkInConceptoRef.current = chunkIdx;
          const baseFrac = chunkIdx / chunks.length;
          fractionRef.current = baseFrac;
          setFractionInConcepto(baseFrac);
          persist(i, chunkIdx, baseFrac);

          const utt = new SpeechSynthesisUtterance(chunks[chunkIdx]);
          if (esVoice) {
            utt.voice = esVoice;
            utt.lang = esVoice.lang;
          }
          utt.onerror = () => {
            if (runId !== runIdRef.current) return;
            stopTick();
            persist(
              indexRef.current,
              chunkInConceptoRef.current,
              fractionRef.current,
            );
            setIsPlaying(false);
            setIsPaused(false);
          };
          utt.onend = () => {
            if (runId !== runIdRef.current) return;
            stopTick();
            speakChunk(chunkIdx + 1);
          };

          startTick(chunks[chunkIdx], i, chunkIdx, chunks.length);
          window.speechSynthesis.speak(utt);
        };

        speakChunk(firstChunk);
      };

      speakIndex(
        Math.max(0, Math.min(startIndex, conceptos.length - 1)),
        startChunk,
      );
    },
    [conceptos, persist, progressKey, startTick, stopTick],
  );

  speakFromRef.current = speakFrom;

  const handleSeekConcepto = useCallback(
    (index: number) => {
      chunkInConceptoRef.current = 0;
      fractionRef.current = 0;
      setFractionInConcepto(0);
      speakFromRef.current(index, 0);
    },
    [],
  );

  const { focusIndex } = useLiteTtsFollowScroll({
    followEnabled: isPlaying,
    scrubEnabled: hasActive,
    activeIndex: conceptoIndex,
    itemCount: conceptos.length,
    getElements: () => itemElsRef.current,
    anchorRef: rootRef,
    onSeek: handleSeekConcepto,
  });

  const handlePlay = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
      setIsPaused(false);
      const c = conceptos[indexRef.current];
      if (c) {
        const chunks = splitIntoChunks(textoConcepto(c));
        const text = chunks[chunkInConceptoRef.current] ?? "";
        if (text) {
          startTick(
            text,
            indexRef.current,
            chunkInConceptoRef.current,
            chunks.length || 1,
          );
        }
      }
      return;
    }

    const start =
      indexRef.current > 0 && indexRef.current < conceptos.length
        ? indexRef.current
        : 0;
    const startChunk =
      start === indexRef.current ? chunkInConceptoRef.current : 0;
    speakFrom(start, startChunk);
  }, [conceptos, isPaused, speakFrom, startTick]);

  const handlePause = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.pause();
    stopTick();
    persist(indexRef.current, chunkInConceptoRef.current, fractionRef.current);
    setIsPlaying(false);
    setIsPaused(true);
  }, [persist, stopTick]);

  useEffect(() => {
    const saved = readLiteTtsProgress(progressKey, fingerprint);
    const idx =
      saved && saved.index >= 0 && saved.index < conceptos.length
        ? saved.index
        : 0;
    const chunkIdx =
      saved && typeof saved.chunkIndex === "number" && saved.chunkIndex > 0
        ? saved.chunkIndex
        : 0;
    indexRef.current = idx;
    chunkInConceptoRef.current = chunkIdx;
    fractionRef.current = 0;
    setConceptoIndex(idx);
    setFractionInConcepto(0);
    setActivoId(null);
  }, [progressKey, fingerprint, conceptos.length]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    const loadVoices = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
    };
    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);

    const flush = () => {
      persist(indexRef.current, chunkInConceptoRef.current, fractionRef.current);
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

  useEffect(() => {
    runIdRef.current += 1;
    stopTick();
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
    setActivoId(null);
  }, [conceptosKey, progressKey, stopTick]);

  const etiqueta = isPlaying
    ? focusIndex != null && focusIndex !== conceptoIndex
      ? "Elegí el concepto…"
      : activoId != null
        ? `Leyendo ${conceptos.findIndex((c) => c.id === activoId) + 1} de ${conceptos.length}`
        : "Reproduciendo…"
    : isPaused
      ? "En pausa"
      : conceptoIndex > 0
        ? "Continuar conceptos"
        : "Escuchar conceptos";

  const progressPct = `${Math.round(progress * 1000) / 10}%`;

  return (
    <div className="flex flex-col gap-3" ref={rootRef}>
      <div className="lite-tts-bar">
        <div className="lite-tts-card">
          <div className="lite-tts-card-main">
            <button
              type="button"
              onClick={handlePlay}
              disabled={isPlaying || conceptos.length === 0}
              className="lite-tts-play"
              aria-label={
                isPaused || conceptoIndex > 0 ? "Continuar" : "Escuchar conceptos"
              }
            >
              <Play
                className="h-[15px] w-[15px]"
                fill="currentColor"
                strokeWidth={0}
                aria-hidden
              />
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
                  {conceptos.length} en secuencia · scroll para saltar
                </p>
              ) : focusIndex != null ? (
                <p className="text-[11px] leading-tight text-[var(--lt-text-3)]">
                  Soltá para leer este concepto
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
              <Square
                className="h-[12px] w-[12px]"
                fill="currentColor"
                strokeWidth={0}
                aria-hidden
              />
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

      <ul className="space-y-2.5">
        {conceptos.map((concepto, i) => {
          const activo = concepto.id === activoId && hasActive;
          const focused = focusIndex === i && !activo;
          return (
            <li
              key={concepto.id}
              ref={(el) => {
                itemElsRef.current[i] = el;
              }}
              className="lite-panel lite-tts-block p-4 transition-[border-color,background] duration-150"
              data-tts-active={activo ? "true" : undefined}
              data-tts-focus={focused ? "true" : undefined}
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
