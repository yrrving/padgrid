import React from 'react';
import { useViewportWidth } from '../hooks/useViewportWidth';
import styles from './SmallScreenGate.module.css';

// The grid + side rail + guided-tour pointer arrows are laid out for a
// reasonably wide viewport — on a narrow portrait phone the arrows end up
// pointing at the wrong things (Nirre's feedback, 2026-09-15). Rather than
// rebuild the whole layout to be portrait-safe, this blocks narrow
// viewports with the same "you need a bigger screen" pattern ByteBox's own
// tools already use, and explicitly suggests landscape as the fast way
// past it — most phones in landscape are wide enough to pass through.
export const SmallScreenGate: React.FC<{ children: React.ReactNode; minWidth: number }> = ({
  children,
  minWidth,
}) => {
  const width = useViewportWidth();

  if (width >= minWidth) return <>{children}</>;

  return (
    <div className={styles.gate}>
      <div className={styles.icon}>↔️</div>
      <h1 className={styles.title}>PadGrid behöver mer plats</h1>
      <p className={styles.body}>
        Rutnätet och guidningen är byggda för en bredare skärm. Vrid telefonen till liggande
        läge, eller öppna PadGrid på en surfplatta eller dator.
      </p>
    </div>
  );
};
