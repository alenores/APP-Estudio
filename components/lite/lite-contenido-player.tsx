"use client";

import { Pause, Play, Square } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLiteTtsFollowScroll } from "@/app/hooks/useLiteTtsFollowScroll";
import { splitMarkdownIntoTtsBlocks } from "@/lib/lite-tts-blocks";
import {
  clearLiteTtsProgress,
  estimateSpeechSeconds,
  formatSpeechDuration,
  liteTtsFingerprint,
  progressFromChars,
  readLiteTtsProgress,
  writeLiteTtsProgress,
} from "@/lib/lite-tts-progress";
import { normalizarEstado, type EstadoSeguimiento } from "@/lib/estado-ui";
import type { LiteEntityRef } from "@/lib/academico-lite-read";

type LiteContenidoPlayerProps = {
  contenido: string;
  /** Clave local por ítem (kind+id). Obligatorio: nunca avance global. */
  progressKey: string;
  /** Nombre del ítem, para el título en Media Session (notificación/lock screen). */
  titulo?: string;
  estadoActual?: EstadoSeguimiento | null;
  /** Alta automática de estado (único registro que permite lite, ADR 012 §6). */
  onEstadoAuto?: (estado: EstadoSeguimiento) => void;
  /** Ítem siguiente dentro del mismo padre, para encadenar solo al terminar. */
  siguienteItem?: LiteEntityRef | null;
  onAvanzarSiguiente?: (siguiente: LiteEntityRef) => void;
  /** Arranque automático al llegar encadenado desde el ítem anterior. */
  autoPlay?: boolean;
};

/**
 * Reproductor TTS + markdown por bloques: marca el bloque activo, lo centra
 * y permite scrollear para saltar al bloque del medio de la pantalla.
 */
export function LiteContenidoPlayer({
  contenido,
  progressKey,
  titulo,
  estadoActual,
  onEstadoAuto,
  siguienteItem,
  onAvanzarSiguiente,
  autoPlay = false,
}: LiteContenidoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [blockIndex, setBlockIndex] = useState(0);
  const [fractionInBlock, setFractionInBlock] = useState(0);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const runIdRef = useRef(0);
  const blockIndexRef = useRef(0);
  const chunkInBlockRef = useRef(0);
  const fractionRef = useRef(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const blockElsRef = useRef<Array<HTMLElement | null>>([]);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const speakFromRef = useRef<(startBlock: number, startChunk?: number) => void>(
    () => {},
  );

  const blocks = useMemo(
    () => splitMarkdownIntoTtsBlocks(contenido),
    [contenido],
  );
  const plains = useMemo(() => blocks.map((b) => b.plain), [blocks]);
  const fingerprint = useMemo(
    () => liteTtsFingerprint(plains.join("\n")),
    [plains],
  );
  const estimatedLabel = useMemo(
    () => formatSpeechDuration(estimateSpeechSeconds(plains.join(" "))),
    [plains],
  );

  const hasActive = isPlaying || isPaused;
  const progress = progressFromChars(plains, blockIndex, fractionInBlock);

  const stopTick = useCallback(() => {
    if (tickRef.current != null) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, []);

  const persist = useCallback(
    (index: number, chunkIndex: number, fraction = 0) => {
      if (blocks.length === 0) return;
      if (index >= blocks.length) {
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
    [blocks.length, fingerprint, progressKey],
  );

  const startTick = useCallback(
    (
      chunkText: string,
      blockIdx: number,
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
        setFractionInBlock(frac);
        persist(blockIdx, chunkIdx, frac);
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
    persist(blockIndexRef.current, chunkInBlockRef.current, fractionRef.current);
  }, [persist, stopTick]);

  const speakFrom = useCallback(
    (startBlock: number, startChunk = 0) => {
      if (typeof window === "undefined" || !window.speechSynthesis) return;
      if (blocks.length === 0) return;

      const runId = ++runIdRef.current;
      window.speechSynthesis.cancel();
      stopTick();

      const voices =
        voicesRef.current.length > 0
          ? voicesRef.current
          : window.speechSynthesis.getVoices();
      const esVoice = voices.find((v) => v.lang.startsWith("es"));

      const speakBlock = (i: number, fromChunk: number) => {
        if (runId !== runIdRef.current) return;
        if (i >= blocks.length) {
          stopTick();
          clearLiteTtsProgress(progressKey);
          blockIndexRef.current = 0;
          chunkInBlockRef.current = 0;
          fractionRef.current = 0;
          setBlockIndex(0);
          setFractionInBlock(0);
          setIsPlaying(false);
          setIsPaused(false);
          if (normalizarEstado(estadoActual ?? null) !== "terminado") {
            onEstadoAuto?.("terminado");
          }
          if (siguienteItem) {
            onAvanzarSiguiente?.(siguienteItem);
          }
          return;
        }

        blockIndexRef.current = i;
        setBlockIndex(i);
        setIsPlaying(true);
        setIsPaused(false);

        const chunks = blocks[i].chunks;
        if (chunks.length === 0) {
          speakBlock(i + 1, 0);
          return;
        }

        const first = Math.max(0, Math.min(fromChunk, chunks.length - 1));

        const speakChunk = (chunkIdx: number) => {
          if (runId !== runIdRef.current) return;
          if (chunkIdx >= chunks.length) {
            speakBlock(i + 1, 0);
            return;
          }

          chunkInBlockRef.current = chunkIdx;
          const baseFrac = chunkIdx / chunks.length;
          fractionRef.current = baseFrac;
          setFractionInBlock(baseFrac);
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
              blockIndexRef.current,
              chunkInBlockRef.current,
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

        speakChunk(first);
      };

      speakBlock(Math.max(0, Math.min(startBlock, blocks.length - 1)), startChunk);
    },
    [
      blocks,
      persist,
      progressKey,
      startTick,
      stopTick,
      estadoActual,
      onEstadoAuto,
      siguienteItem,
      onAvanzarSiguiente,
    ],
  );

  speakFromRef.current = speakFrom;

  const handleSeekBlock = useCallback((index: number) => {
    chunkInBlockRef.current = 0;
    fractionRef.current = 0;
    setFractionInBlock(0);
    speakFromRef.current(index, 0);
  }, []);

  const { focusIndex } = useLiteTtsFollowScroll({
    followEnabled: isPlaying,
    scrubEnabled: hasActive,
    activeIndex: blockIndex,
    itemCount: blocks.length,
    getElements: () => blockElsRef.current,
    anchorRef: rootRef,
    onSeek: handleSeekBlock,
  });

  const handlePlay = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
      setIsPaused(false);
      const chunks = blocks[blockIndexRef.current]?.chunks ?? [];
      const text = chunks[chunkInBlockRef.current] ?? "";
      if (text) {
        startTick(
          text,
          blockIndexRef.current,
          chunkInBlockRef.current,
          chunks.length || 1,
        );
      }
      return;
    }

    if (normalizarEstado(estadoActual ?? null) === "sin empezar" || estadoActual == null) {
      onEstadoAuto?.("en curso");
    }

    const start =
      blockIndexRef.current > 0 && blockIndexRef.current < blocks.length
        ? blockIndexRef.current
        : 0;
    const startChunk =
      start === blockIndexRef.current ? chunkInBlockRef.current : 0;
    speakFrom(start, startChunk);
  }, [blocks, isPaused, speakFrom, startTick, estadoActual, onEstadoAuto]);

  const handlePause = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.pause();
    stopTick();
    persist(blockIndexRef.current, chunkInBlockRef.current, fractionRef.current);
    setIsPlaying(false);
    setIsPaused(true);
  }, [persist, stopTick]);

  // Wake Lock: mientras se lee, evita que el celular bloquee la pantalla solo
  // (Android corta la síntesis de voz al bloquear). Se libera al pausar/parar/
  // terminar, y se re-pide si el documento vuelve a estar visible.
  useEffect(() => {
    if (typeof navigator === "undefined" || !("wakeLock" in navigator)) return;

    let cancelled = false;

    const requestWakeLock = async () => {
      try {
        const sentinel = await navigator.wakeLock.request("screen");
        if (cancelled) {
          void sentinel.release();
          return;
        }
        wakeLockRef.current = sentinel;
      } catch {
        // Batería baja, permiso denegado, documento no visible: seguimos sin lock.
      }
    };

    if (isPlaying) {
      void requestWakeLock();
    }

    const onVisibilityChange = () => {
      if (isPlaying && document.visibilityState === "visible" && !wakeLockRef.current) {
        void requestWakeLock();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (wakeLockRef.current) {
        void wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    };
  }, [isPlaying]);

  // Media Session: controles desde la notificación / pantalla de bloqueo.
  useEffect(() => {
    if (typeof window === "undefined" || !("mediaSession" in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: titulo ?? "Clase",
      artist: "APP Estudio",
    });
    navigator.mediaSession.setActionHandler("play", handlePlay);
    navigator.mediaSession.setActionHandler("pause", handlePause);
    navigator.mediaSession.setActionHandler("stop", stopAll);
    return () => {
      navigator.mediaSession.setActionHandler("play", null);
      navigator.mediaSession.setActionHandler("pause", null);
      navigator.mediaSession.setActionHandler("stop", null);
    };
  }, [titulo, handlePlay, handlePause, stopAll]);

  useEffect(() => {
    if (typeof window === "undefined" || !("mediaSession" in navigator)) return;
    navigator.mediaSession.playbackState = isPlaying
      ? "playing"
      : isPaused
        ? "paused"
        : "none";
  }, [isPlaying, isPaused]);

  useEffect(() => {
    const saved = readLiteTtsProgress(progressKey, fingerprint);
    const idx =
      saved && saved.index >= 0 && saved.index < blocks.length ? saved.index : 0;
    const chunkIdx =
      saved && typeof saved.chunkIndex === "number" && saved.chunkIndex > 0
        ? saved.chunkIndex
        : 0;
    blockIndexRef.current = idx;
    chunkInBlockRef.current = chunkIdx;
    fractionRef.current = 0;
    setBlockIndex(idx);
    setFractionInBlock(0);
  }, [progressKey, fingerprint, blocks.length]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    const loadVoices = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
    };
    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);

    const flush = () => {
      persist(
        blockIndexRef.current,
        chunkInBlockRef.current,
        fractionRef.current,
      );
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
  }, [contenido, progressKey, stopTick]);

  // Arranque automático al llegar encadenado desde el ítem anterior. Va al
  // final a propósito: tiene que correr después del efecto de arriba (que
  // cancela cualquier síntesis en curso también al montar), si no lo cancela
  // apenas arranca.
  const autoPlayTriggeredRef = useRef(false);
  useEffect(() => {
    if (!autoPlay || autoPlayTriggeredRef.current) return;
    autoPlayTriggeredRef.current = true;
    handlePlay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay]);

  const etiqueta = isPlaying
    ? focusIndex != null && focusIndex !== blockIndex
      ? "Elegí el bloque…"
      : "Reproduciendo…"
    : isPaused
      ? "En pausa"
      : blockIndex > 0
        ? "Continuar lectura"
        : "Escuchar contenido";

  const progressPct = `${Math.round(progress * 1000) / 10}%`;

  return (
    <div className="flex flex-col gap-3" ref={rootRef}>
      <div className="lite-tts-bar">
        <div className="lite-tts-card">
          <div className="lite-tts-card-main">
            <button
              type="button"
              onClick={handlePlay}
              disabled={isPlaying || !contenido.trim()}
              className="lite-tts-play"
              aria-label={
                isPaused || blockIndex > 0 ? "Continuar" : "Escuchar contenido"
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
                  Lectura en voz alta · scroll para saltar
                </p>
              ) : focusIndex != null ? (
                <p className="text-[11px] leading-tight text-[var(--lt-text-3)]">
                  Soltá para leer este bloque
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

      <article className="lite-panel lite-prose p-5">
        {blocks.map((block, i) => {
          const playing = i === blockIndex && hasActive;
          const focused = focusIndex === i;
          return (
            <div
              key={i}
              ref={(el) => {
                blockElsRef.current[i] = el;
              }}
              className="lite-tts-block"
              data-tts-active={playing ? "true" : undefined}
              data-tts-focus={focused && !playing ? "true" : undefined}
            >
              <ReactMarkdown>{block.md}</ReactMarkdown>
            </div>
          );
        })}
      </article>
    </div>
  );
}
