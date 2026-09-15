import React, { useEffect } from 'react';
import styles from './TryRealAppModal.module.css';

// "Nu har du provat principen — testa den riktiga appen." Nudge shown after
// the guided tour finishes, or opened any time via TopBar. Placeholder link
// below — fill in once we know the exact app / store URL Trainstation uses.
const REAL_APP_STORE_URL = ''; // TODO: exact App Store / Play Store link

interface TryRealAppModalProps {
  onClose: () => void;
}

export const TryRealAppModal: React.FC<TryRealAppModalProps> = ({ onClose }) => {
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
          Det här var en förenklad prototyp av principen — riktiga clip-launcher-appen
          har fler ljud, genrer och funktioner. Så här kommer du vidare:
        </p>

        <div className={styles.optionCard}>
          <div className={styles.optionHeader}>
            <span className={styles.optionIcon}>🏫</span>
            <span className={styles.optionTitle}>På en av Trainstations iPads</span>
          </div>
          <p className={styles.optionDesc}>
            Appen finns redan installerad — fråga en pedagog om att låna en iPad.
          </p>
        </div>

        <div className={styles.optionCard}>
          <div className={styles.optionHeader}>
            <span className={styles.optionIcon}>📱</span>
            <span className={styles.optionTitle}>På din egen enhet</span>
          </div>
          <p className={styles.optionDesc}>
            Ladda ner appen från App Store.
          </p>
          <div className={styles.optionActions}>
            {REAL_APP_STORE_URL ? (
              <a className={styles.actionBtn} href={REAL_APP_STORE_URL} target="_blank" rel="noopener noreferrer">
                📲 Öppna App Store
              </a>
            ) : (
              <span className={styles.linkPending}>Länk fylls i senare</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
