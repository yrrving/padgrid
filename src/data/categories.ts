import type { Category } from '../models/types';

export const CATEGORIES: Category[] = [
  { id: 'drums', label: 'Drums', color: 'var(--cat-drums)', icon: '🥁' },
  { id: 'percussion', label: 'Percussion', color: 'var(--cat-percussion)', icon: '🪘' },
  { id: 'bass', label: 'Bass', color: 'var(--cat-bass)', icon: '🎸' },
  { id: 'melodic', label: 'Melodic', color: 'var(--cat-melodic)', icon: '🎹' },
  { id: 'vocal', label: 'Vocal', color: 'var(--cat-vocal)', icon: '🎤' },
  { id: 'fx', label: 'FX', color: 'var(--cat-fx)', icon: '✨' },
];

// Row labels — the "style variant" a besökare picks between within a
// column, same role as the reference app's Bring/Grace/Plural/Mint/… rows.
export const VARIANTS = ['Mjuk', 'Skarp', 'Varm', 'Ljus'];
