import React from 'react';
import { useStore } from '../store/useStore';
import { CATEGORIES, VARIANTS } from '../data/categories';
import { Pad } from './Pad';
import guide from '../styles/guide.module.css';
import styles from './PadGrid.module.css';

export const PadGrid: React.FC = () => {
  const activePads = useStore((s) => s.activePads);
  const pressPad = useStore((s) => s.pressPad);
  const tourStep = useStore((s) => s.tourStep);

  // Which columns are the tour's current target, vs. dimmed as a distraction.
  const targetCols: number[] | null =
    tourStep === 'press-pad' || tourStep === 'same-column'
      ? [0]
      : tourStep === 'other-column'
      ? CATEGORIES.map((_, i) => i).filter((i) => i !== 0)
      : null;
  const gridDimmed = tourStep === 'volumes' || tourStep === 'fx' || tourStep === 'stop-all';

  return (
    <div className={`${styles.gridWrap} ${gridDimmed ? guide.dim : ''}`}>
      <div className={styles.grid} style={{ gridTemplateColumns: `repeat(${CATEGORIES.length}, 1fr)` }}>
        {CATEGORIES.map((cat, col) => (
          <div key={cat.id} className={styles.column}>
            {VARIANTS.map((variantLabel, row) => (
              <Pad
                key={row}
                category={cat}
                variantLabel={variantLabel}
                playing={activePads[col] === row}
                dimmed={targetCols !== null && !targetCols.includes(col)}
                highlighted={targetCols !== null && targetCols.includes(col)}
                onPress={() => pressPad(col, row)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
