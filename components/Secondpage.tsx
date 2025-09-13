'use client';

import { useState } from 'react';
import Spline from '@splinetool/react-spline';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function SecondPage() {
  const [splineLoaded, setSplineLoaded] = useState(false);

  const handleSplineLoad = () => {
    setSplineLoaded(true);
  };

  return (
    <div className="second-page-section">
      {/* Second Spline */}
      <div className="second-spline-container">
        {!splineLoaded && <LoadingSpinner />}
        <Spline
          scene="https://prod.spline.design/Y1rsFhfGwHJVeoEu/scene.splinecode"
          onLoad={handleSplineLoad}
        />
      </div>
      
      {/* Content below the Spline */}
      <div className="second-page-content">
        <p className="description">
          Crafting Awesome Stories and Killer Designs To Make Brand Stand Out
        </p>
        <div className="cta-buttons">
          <a href="#contact" className="cta-btn primary">Contact Us</a>
          <a href="#connect" className="cta-btn secondary">Connect me</a>
        </div>
      </div>
    </div>
  );
}