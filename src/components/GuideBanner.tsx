import React from 'react';
import { useStore } from '../store/useStore';
import type { TourStep } from '../models/types';
import guide from '../styles/guide.module.css';

const COPY: Record<TourStep, string> = {
  'press-pad': '👆 Tryck på en pad i första kolumnen för att spela den',
  'same-column': 'Snyggt! Tryck på en annan pad i samma kolumn — den första tystnar automatiskt',
  'other-column': 'Bra! Nu trycker du på en pad i en ANNAN kolumn — den lägger sig ovanpå, i takt',
  volumes: 'Så där låter ett par spår ihop. Tryck på "Volymer" härintill för att se volymreglagen',
  fx: 'Tryck på "FX" för att se effekterna',
  'stop-all': 'Sista steget — tryck på stopp-knappen för att tysta allt',
  done: '🎉 Nu kan du grunderna! Testa fritt här, eller kolla in den riktiga appen.',
};

export const GuideBanner: React.FC = () => {
  const tourStep = useStore((s) => s.tourStep);
  const skipTour = useStore((s) => s.skipTour);

  if (!tourStep) return null;
  const isDone = tourStep === 'done';

  return (
    <div className={`${guide.banner} ${isDone ? guide.bannerDone : ''}`}>
      <span>{COPY[tourStep]}</span>
      <button className={guide.bannerSkip} onClick={skipTour}>
        {isDone ? 'Stäng' : 'Hoppa över'}
      </button>
    </div>
  );
};
