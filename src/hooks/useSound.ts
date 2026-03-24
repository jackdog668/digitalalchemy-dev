"use client";

import { useCallback, useRef } from "react";

/**
 * Sci-fi electric UI sound system using Web Audio API.
 * No audio files needed — sounds are synthesized from oscillators + filters.
 * Respects prefers-reduced-motion and browser autoplay policy.
 */

type SoundType = "hover" | "click" | "activate";

let audioCtx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  // Respect reduced motion preference
  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  if (prefersReduced) return null;

  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  // Resume if suspended (browser autoplay policy)
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

/** Quick electric "zing" — ~100ms, very quiet */
function playHover(ctx: AudioContext) {
  const now = ctx.currentTime;
  const gain = ctx.createGain();
  const osc = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();

  osc.type = "sine";
  osc.frequency.setValueAtTime(2400, now);
  osc.frequency.exponentialRampToValueAtTime(3800, now + 0.05);
  osc.frequency.exponentialRampToValueAtTime(1800, now + 0.1);

  filter.type = "highpass";
  filter.frequency.setValueAtTime(1200, now);

  gain.gain.setValueAtTime(0.04, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

  osc.connect(filter).connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.1);
}

/** Soft power-up "charge" — ~200ms */
function playClick(ctx: AudioContext) {
  const now = ctx.currentTime;
  const gain = ctx.createGain();
  const osc = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();

  // Primary tone: rising sweep
  osc.type = "sine";
  osc.frequency.setValueAtTime(400, now);
  osc.frequency.exponentialRampToValueAtTime(1200, now + 0.12);
  osc.frequency.exponentialRampToValueAtTime(800, now + 0.2);

  // Harmonic shimmer
  osc2.type = "triangle";
  osc2.frequency.setValueAtTime(800, now);
  osc2.frequency.exponentialRampToValueAtTime(2000, now + 0.1);

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(3000, now);
  filter.frequency.exponentialRampToValueAtTime(800, now + 0.2);

  gain.gain.setValueAtTime(0.06, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

  const mix = ctx.createGain();
  mix.gain.setValueAtTime(0.03, now);

  osc.connect(filter).connect(gain).connect(ctx.destination);
  osc2.connect(mix).connect(gain);

  osc.start(now);
  osc2.start(now);
  osc.stop(now + 0.2);
  osc2.stop(now + 0.2);
}

/** Full electric activation — ~300ms, richer harmonics */
function playActivate(ctx: AudioContext) {
  const now = ctx.currentTime;
  const gain = ctx.createGain();
  const osc = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const osc3 = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();

  // Base tone: power sweep up
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(200, now);
  osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);
  osc.frequency.exponentialRampToValueAtTime(400, now + 0.3);

  // Mid harmonic
  osc2.type = "sine";
  osc2.frequency.setValueAtTime(600, now);
  osc2.frequency.exponentialRampToValueAtTime(1400, now + 0.2);

  // High shimmer
  osc3.type = "sine";
  osc3.frequency.setValueAtTime(1800, now + 0.05);
  osc3.frequency.exponentialRampToValueAtTime(3200, now + 0.15);
  osc3.frequency.exponentialRampToValueAtTime(2400, now + 0.3);

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(4000, now);
  filter.frequency.exponentialRampToValueAtTime(600, now + 0.3);
  filter.Q.setValueAtTime(2, now);

  gain.gain.setValueAtTime(0.07, now);
  gain.gain.linearRampToValueAtTime(0.09, now + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

  const mix2 = ctx.createGain();
  mix2.gain.setValueAtTime(0.04, now);
  const mix3 = ctx.createGain();
  mix3.gain.setValueAtTime(0.02, now);

  osc.connect(filter).connect(gain).connect(ctx.destination);
  osc2.connect(mix2).connect(gain);
  osc3.connect(mix3).connect(gain);

  osc.start(now);
  osc2.start(now);
  osc3.start(now + 0.05);
  osc.stop(now + 0.3);
  osc2.stop(now + 0.3);
  osc3.stop(now + 0.3);
}

const players: Record<SoundType, (ctx: AudioContext) => void> = {
  hover: playHover,
  click: playClick,
  activate: playActivate,
};

export function useSound() {
  // Throttle hover sounds so they don't stack
  const lastHover = useRef(0);

  const play = useCallback((type: SoundType) => {
    const ctx = getContext();
    if (!ctx) return;

    // Throttle hover to max 1 per 150ms
    if (type === "hover") {
      const now = Date.now();
      if (now - lastHover.current < 150) return;
      lastHover.current = now;
    }

    players[type](ctx);
  }, []);

  return { play };
}
