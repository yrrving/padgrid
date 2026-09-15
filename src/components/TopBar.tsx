import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { TryRealAppModal } from './TryRealAppModal';
import guide from '../styles/guide.module.css';
import styles from './TopBar.module.css';

export const TopBar: React.FC = () => {
  const goHome = useStore((s) => s.goHome);
  const stopAll = useStore((s) => s.stopAll);
  const tourStep = useStore((s) => s.tourStep);
  const [showRealApp, setShowRealApp] = useState(false);

  // Nudge toward the real app the moment the guided tour finishes — never
  // forced (the button below is always there too, for free-mode explorers).
  useEffect(() => {
    if (tourStep === 'done') setShowRealApp(true);
  }, [tourStep]);

  return (
    <div className={styles.bar}>
      <button className={styles.homeBtn} onClick={goHome} title="Till startsidan">
        🏠 Hem
      </button>
      <div className={styles.title}>🎛️ Cosy Prototype Loop</div>

      <div className={guide.anchorWrap}>
        {tourStep === 'stop-all' && (
          <div className={guide.pointerArrowAnchorAbove}>
            <div className={`${guide.pointerArrow} ${guide.pointerArrowCompact}`}>
              <span className={`${guide.pointerArrowIcon} ${guide.pointerArrowIconCompact}`}>⬇️</span>
              <span>Stoppa allt</span>
            </div>
          </div>
        )}
        <button
          className={[
            styles.stopBtn,
            tourStep === 'stop-all' ? guide.targetHighlight : '',
            tourStep && tourStep !== 'stop-all' && tourStep !== 'done' ? guide.dim : '',
          ].join(' ')}
          onClick={stopAll}
        >
          ⏹ Stoppa allt
        </button>
      </div>

      <button className={styles.realAppBtn} onClick={() => setShowRealApp(true)}>
        🚀 Riktiga appen
      </button>

      {showRealApp && <TryRealAppModal onClose={() => setShowRealApp(false)} />}
    </div>
  );
};
