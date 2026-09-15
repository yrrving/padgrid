import React from 'react';
import { useStore } from '../store/useStore';
import { CATEGORIES } from '../data/categories';
import guide from '../styles/guide.module.css';
import styles from './SideRail.module.css';

// FX pads are visual-only in this prototype (no real DSP wired up) — the
// point here is the guided-tour interaction, not a working effects chain.
// A real version would apply these to the currently selected pad(s).
const FX_LIST = ['Stutter', 'Flanger', 'Gater', 'Autofilter', 'Delay', 'Reverb'];

export const SideRail: React.FC = () => {
  const sideView = useStore((s) => s.sideView);
  const setSideView = useStore((s) => s.setSideView);
  const volumes = useStore((s) => s.volumes);
  const setVolume = useStore((s) => s.setVolume);
  const tourStep = useStore((s) => s.tourStep);

  return (
    <div className={styles.rail}>
      <div className={styles.tabs}>
        <div className={guide.anchorWrap}>
          {tourStep === 'volumes' && (
            <div className={guide.pointerArrowAnchorAbove}>
              <div className={`${guide.pointerArrow} ${guide.pointerArrowCompact}`}>
                <span className={`${guide.pointerArrowIcon} ${guide.pointerArrowIconCompact}`}>⬇️</span>
                <span>Volymer</span>
              </div>
            </div>
          )}
          <button
            className={[
              styles.tabBtn,
              sideView === 'volumes' ? styles.tabActive : '',
              tourStep === 'volumes' ? guide.targetHighlight : '',
              tourStep === 'fx' || tourStep === 'stop-all' ? guide.dim : '',
            ].join(' ')}
            onClick={() => setSideView('volumes')}
          >
            🎚️
            <span>Volymer</span>
          </button>
        </div>

        <div className={guide.anchorWrap}>
          {tourStep === 'fx' && (
            <div className={guide.pointerArrowAnchorAbove}>
              <div className={`${guide.pointerArrow} ${guide.pointerArrowCompact}`}>
                <span className={`${guide.pointerArrowIcon} ${guide.pointerArrowIconCompact}`}>⬇️</span>
                <span>FX</span>
              </div>
            </div>
          )}
          <button
            className={[
              styles.tabBtn,
              sideView === 'fx' ? styles.tabActive : '',
              tourStep === 'fx' ? guide.targetHighlight : '',
              tourStep === 'volumes' || tourStep === 'stop-all' ? guide.dim : '',
            ].join(' ')}
            onClick={() => setSideView('fx')}
          >
            ✨
            <span>FX</span>
          </button>
        </div>
      </div>

      <div className={styles.panel}>
        {sideView === 'volumes' ? (
          <div className={styles.volumeRow}>
            {CATEGORIES.map((cat, col) => (
              <div key={cat.id} className={styles.volumeCol}>
                <input
                  type="range"
                  className={styles.volumeSlider}
                  style={{ '--pad-color': cat.color } as React.CSSProperties}
                  min={0}
                  max={1}
                  step={0.01}
                  value={volumes[col]}
                  onChange={(e) => setVolume(col, Number(e.target.value))}
                />
                <span className={styles.volumeIcon}>{cat.icon}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.fxGrid}>
            {FX_LIST.map((fx) => (
              <button key={fx} className={styles.fxBtn}>
                {fx}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
