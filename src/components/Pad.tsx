import React from 'react';
import type { Category } from '../models/types';
import guide from '../styles/guide.module.css';
import styles from './PadGrid.module.css';

interface PadProps {
  category: Category;
  variantLabel: string;
  playing: boolean;
  dimmed: boolean;
  highlighted: boolean;
  onPress: () => void;
}

export const Pad: React.FC<PadProps> = ({ category, variantLabel, playing, dimmed, highlighted, onPress }) => {
  return (
    <button
      className={[
        styles.pad,
        playing ? styles.padPlaying : '',
        dimmed ? guide.dim : '',
        highlighted ? guide.targetHighlight : '',
      ].join(' ')}
      style={{ '--pad-color': category.color } as React.CSSProperties}
      onClick={onPress}
    >
      <span className={styles.padIcon}>{category.icon}</span>
      <span className={styles.padLabel}>{category.label}</span>
      <span className={styles.padVariant}>{variantLabel}</span>
    </button>
  );
};
