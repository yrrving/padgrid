import React from 'react';
import { useStore } from '../store/useStore';
import styles from './HomeScreen.module.css';

export const HomeScreen: React.FC = () => {
  const enterGrid = useStore((s) => s.enterGrid);

  return (
    <div className={styles.wrap}>
      <div className={styles.hero}>
        <div className={styles.logo}>🎛️ PadGrid</div>
        <p className={styles.tagline}>
          Prototyp — clip-launcher-gränssnitt för musik, byggt för att testa hur en
          guidad handledning kan fungera i den här typen av verktyg.
        </p>
      </div>

      <div className={styles.choices}>
        <div className={styles.card}>
          <h2>🧭 Guidad genomgång</h2>
          <p>
            Vi visar dig steg för steg hur rutnätet funkar: tryck på en pad, byt inom
            samma spår, lägg ett spår ovanpå ett annat, och var volym/FX finns.
          </p>
          <button className={styles.primaryBtn} onClick={() => enterGrid(true)}>
            Starta guidad genomgång ▶️
          </button>
        </div>

        <div className={styles.card}>
          <h2>🎚️ Utforska fritt</h2>
          <p>
            Hoppa rakt in i rutnätet utan guidning. Bra om du redan vet hur ett
            clip-launcher-gränssnitt funkar.
          </p>
          <button className={styles.secondaryBtn} onClick={() => enterGrid(false)}>
            Öppna rutnätet ▶️
          </button>
        </div>
      </div>
    </div>
  );
};
