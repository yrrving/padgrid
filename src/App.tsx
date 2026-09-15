import React from 'react';
import { useStore } from './store/useStore';
import { HomeScreen } from './components/HomeScreen';
import { TopBar } from './components/TopBar';
import { PadGrid } from './components/PadGrid';
import { SideRail } from './components/SideRail';
import { GuideBanner } from './components/GuideBanner';
import { SmallScreenGate } from './components/SmallScreenGate';
import styles from './App.module.css';

// Grid + side rail + guided-tour arrows need this much room to lay out
// sensibly — below it, most phones in portrait; above it, landscape phones
// and up. See SmallScreenGate for why this is a hard gate rather than a
// squeeze-everything-in responsive layout.
const MIN_WIDTH = 700;

const App: React.FC = () => {
  const mode = useStore((s) => s.mode);

  return (
    <SmallScreenGate minWidth={MIN_WIDTH}>
      <div className={styles.app}>
        {mode === 'home' ? (
          <HomeScreen />
        ) : (
          <div className={styles.gridView}>
            <TopBar />
            <div className={styles.main}>
              <PadGrid />
              <SideRail />
            </div>
            <GuideBanner />
          </div>
        )}
      </div>
    </SmallScreenGate>
  );
};

export default App;
