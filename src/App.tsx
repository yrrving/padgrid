import React from 'react';
import { useStore } from './store/useStore';
import { HomeScreen } from './components/HomeScreen';
import { TopBar } from './components/TopBar';
import { PadGrid } from './components/PadGrid';
import { SideRail } from './components/SideRail';
import { GuideBanner } from './components/GuideBanner';
import styles from './App.module.css';

const App: React.FC = () => {
  const mode = useStore((s) => s.mode);

  return (
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
  );
};

export default App;
