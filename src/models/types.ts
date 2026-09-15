// ─── PadGrid — prototype ────────────────────────────────────────────────────
// A local-only prototype exploring the Launchpad/clip-launcher interaction
// model (columns = tracks, rows = variations, one playing clip per column at
// a time) as a substrate for prototyping GUIDED ONBOARDING — same goal as
// TrainCells' "Super handlett läge", different domain (music instead of game
// building). Not a faithful recreation of any specific commercial app.

export type CategoryId = 'drums' | 'percussion' | 'bass' | 'melodic' | 'vocal' | 'fx';

export interface Category {
  id: CategoryId;
  label: string;
  color: string; // CSS var name, e.g. 'var(--cat-drums)'
  icon: string; // emoji, matches the pad-icon convention used elsewhere
}

export const ROW_COUNT = 4;
export const COL_COUNT = 6;

// One clip per grid cell. `variant` is the row's style name, shown as the
// pad's second line (mirrors the reference app's two-line pad labels).
export interface Pad {
  col: number; // 0..COL_COUNT-1, indexes into CATEGORIES
  row: number; // 0..ROW_COUNT-1, indexes into VARIANTS
}

export type PadKey = `${number}-${number}`;
export const padKey = (col: number, row: number): PadKey => `${col}-${row}`;

// Right-rail view — swaps what's shown below the grid, same idea as the
// reference app's Filters / Volumes / FX toggle.
export type SideView = 'volumes' | 'fx';

// ── Guided tour ──────────────────────────────────────────────────────────
// Deliberately linear, same shape as TrainCells' `superFlow`: one step at a
// time, an explicit "Klar, gå vidare" the besökare presses when THEY feel
// ready — no auto-detection of "have they understood this yet".
export type TourStep =
  | 'press-pad'       // press any pad in column 0 — hear it play
  | 'same-column'     // press another pad in the SAME column — first one stops
  | 'other-column'    // press a pad in a DIFFERENT column — layers on top
  | 'volumes'         // point at the Volumes rail button
  | 'fx'              // point at the FX rail button
  | 'stop-all'        // point at the stop-all transport button
  | 'done';

export interface TourState {
  step: TourStep;
}
