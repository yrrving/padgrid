import { create } from 'zustand';
import type { SideView, TourStep } from '../models/types';
import { CATEGORIES } from '../data/categories';
import * as audio from '../audio/audioEngine';
import type { FxId } from '../audio/fx';

interface Store {
  mode: 'home' | 'grid';
  // activePads[col] = row currently playing in that column, or null
  activePads: (number | null)[];
  sideView: SideView;
  tourStep: TourStep | null; // null = no guided tour running
  volumes: number[];
  activeFxId: FxId | null;

  enterGrid: (withTour: boolean) => void;
  goHome: () => void;
  pressPad: (col: number, row: number) => void;
  setSideView: (v: SideView) => void;
  setVolume: (col: number, v: number) => void;
  toggleFx: (id: FxId) => void;
  stopAll: () => void;
  skipTour: () => void;
}

const COL_COUNT = CATEGORIES.length;

export const useStore = create<Store>((set, get) => ({
  mode: 'home',
  activePads: Array(COL_COUNT).fill(null),
  // Starts on 'fx' (not 'volumes') so the tour's "tryck på Volymer" step
  // always produces a real, visible panel switch instead of clicking a tab
  // that already looks selected.
  sideView: 'fx',
  tourStep: null,
  volumes: Array(COL_COUNT).fill(0.8),
  activeFxId: null,

  enterGrid: (withTour) => {
    audio.setActiveFx(null);
    set({
      mode: 'grid',
      activePads: Array(COL_COUNT).fill(null),
      tourStep: withTour ? 'press-pad' : null,
      sideView: 'fx',
      activeFxId: null,
    });
  },

  goHome: () => {
    audio.stopAll();
    audio.setActiveFx(null);
    set({ mode: 'home', activePads: Array(COL_COUNT).fill(null), tourStep: null, activeFxId: null });
  },

  pressPad: (col, row) => {
    const { activePads, tourStep } = get();
    const wasRow = activePads[col];
    const next = [...activePads];

    if (wasRow === row) {
      audio.stopColumn(col);
      next[col] = null;
    } else {
      audio.playPad(col, CATEGORIES[col].id, row);
      next[col] = row;
    }
    set({ activePads: next });

    // ── Guided tour: each step advances the moment its target action
    // happens — unlike TrainCells' Super handlett läge (which needs an
    // explicit "Klar, gå vidare" because drawing has no natural end), every
    // action here is a single, instant press, so there's always a clean,
    // unambiguous moment to advance on.
    if (tourStep === 'press-pad' && col === 0 && next[col] !== null) {
      set({ tourStep: 'same-column' });
    } else if (tourStep === 'same-column' && col === 0 && wasRow !== null && next[col] !== null) {
      set({ tourStep: 'other-column' });
    } else if (tourStep === 'other-column' && col !== 0 && next[col] !== null) {
      set({ tourStep: 'volumes' });
    }
  },

  setSideView: (v) => {
    const { tourStep } = get();
    set({ sideView: v });
    if (tourStep === 'volumes' && v === 'volumes') set({ tourStep: 'fx' });
    else if (tourStep === 'fx' && v === 'fx') set({ tourStep: 'stop-all' });
  },

  toggleFx: (id) => {
    const current = get().activeFxId;
    const next = current === id ? null : id;
    audio.setActiveFx(next);
    set({ activeFxId: next });
  },

  setVolume: (col, v) => {
    audio.setColumnVolume(col, v);
    const volumes = [...get().volumes];
    volumes[col] = v;
    set({ volumes });
  },

  stopAll: () => {
    audio.stopAll();
    const { tourStep } = get();
    set({ activePads: Array(COL_COUNT).fill(null) });
    if (tourStep === 'stop-all') set({ tourStep: 'done' });
  },

  skipTour: () => set({ tourStep: null }),
}));
