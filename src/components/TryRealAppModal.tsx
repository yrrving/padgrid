import React, { useEffect, useState } from 'react';
import styles from './TryRealAppModal.module.css';

// "Nu har du provat principen — testa den riktiga appen." Nudge shown after
// the guided tour finishes, or opened any time via TopBar.
//
// Real app confirmed (2026-09-15): "Launchpad - Music & Beat Maker" by
// Novation/Focusrite — matches the reference screenshots exactly (grid
// loop-launcher, DJ effects, beat-locked transport, soundpacks).
const REAL_APP_STORE_URL = 'https://apps.apple.com/us/app/launchpad-music-beat-maker/id584362474';

interface TryRealAppModalProps {
  onClose: () => void;
}

type Choice = null | 'ios' | 'ipad';

export const TryRealAppModal: React.FC<TryRealAppModalProps> = ({ onClose }) => {
  const [choice, setChoice] = useState<Choice>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>🚀 Redo för den riktiga appen?</h2>
          <button className={styles.close} onClick={onClose} aria-label="Stäng" title="Stäng">✕</button>
        </div>
        <p className={styles.intro}>
          Det här var en förenklad prototyp av principen — riktiga Launchpad har fler ljud,
          genrer och funktioner. Hur vill du fortsätta?
        </p>

        <div className={styles.choiceRow}>
          <button
            className={`${styles.choiceBtn} ${choice === 'ios' ? styles.choiceBtnActive : ''}`}
            onClick={() => setChoice('ios')}
          >
            <span className={styles.choiceIcon}>📲</span>
            Ladda ner på min egen enhet
          </button>
          <button
            className={`${styles.choiceBtn} ${choice === 'ipad' ? styles.choiceBtnActive : ''}`}
            onClick={() => setChoice('ipad')}
          >
            <span className={styles.choiceIcon}>🏫</span>
            Använd en Trainstation-iPad
          </button>
        </div>

        {choice === 'ios' && (
          <div className={styles.result}>
            <p className={styles.resultText}>
              Launchpad – Music &amp; Beat Maker finns på App Store, av Novation.
            </p>
            <a
              className={styles.actionBtn}
              href={REAL_APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              📲 Öppna App Store
            </a>
          </div>
        )}

        {choice === 'ipad' && (
          <div className={styles.result}>
            <p className={styles.resultText}>
              Be en pedagog om att låna en iPad med Launchpad installerat.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
