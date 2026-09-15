import React from 'react';
import { useStore } from '../store/useStore';
import { CATEGORIES } from '../data/categories';
import type { FxId } from '../audio/fx';
import guide from '../styles/guide.module.css';
import styles from './SideRail.module.css';

// Real master-bus effects (audio/fx.ts) — applied to everything currently
// playing. Only one active at a time; pressing the active one again turns
// it off (see useStore.toggleFx).
const FX_LIST: { id: FxId; label: string }[] = [
  { id: 'stutter', label: 'Stutter' },
  { id: 'flanger', label: 'Flanger' },
  { id: 'gater', label: 'Gater' },
  { id: 'autofilter', label: 'Autofilter' },
  { id: 'delay', label: 'Delay' },
  { id: 'reverb', label: 'Reverb' },
];

export const SideRail: React.FC = () => {
  const sideView = useStore((s) => s.sideView);
  const setSideView = useStore((s) => s.setSideView);
  const volumes = useStore((s) => s.volumes);
  const setVolume = useStore((s) => s.setVolume);
  const tourStep = useStore((s) => s.tourStep);
  const activeFxId = useStore((s) => s.activeFxId);
  const toggleFx = useStore((s) => s.toggleFx);

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
              <button
                key={fx.id}
                className={`${styles.fxBtn} ${activeFxId === fx.id ? styles.fxBtnActive : ''}`}
                onClick={() => toggleFx(fx.id)}
              >
                {fx.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
