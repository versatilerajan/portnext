'use client';
import { useEffect, useState } from 'react';
import CubeGrid from '@/components/CubeGrid';
import Navigation from '@/components/Navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import Spline from '@splinetool/react-spline';
import AboutSection from '@/components/AboutSection';
import SecondPage from '@/components/Secondpage';
export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [splineLoaded, setSplineLoaded] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000/2);
    return () => clearTimeout(timer);
  }, []);

  const handleSplineLoad = () => {
    setSplineLoaded(true);
  };
  return (
    <>
      {isLoading && <LoadingSpinner />}
      
      <div className="background-orbs">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>
      <CubeGrid />
      <div className="container">
        <Navigation />
        <main className="main-content">
          <div className="spacer"></div>
          <div className="content-wrapper">
            <div className="left-content">
              <h1 className="title">Rajan a Versatile Self Taught Programmer</h1>
              <div className="tags">
                <a href="https://gitcred.vercel.app" target="_blank" rel="noopener noreferrer">AI</a>
                <a href="https://gitcred.vercel.app" target="_blank" rel="noopener noreferrer">Model Training</a>
                <a href="https://gitcred.vercel.app" target="_blank" rel="noopener noreferrer">WEB3</a>
                <a href="https://gitcred.vercel.app" target="_blank" rel="noopener noreferrer">Cloud Computing</a>
                <a href="https://gitcred.vercel.app" target="_blank" rel="noopener noreferrer">App Development</a>
              </div>
            </div>
            {/* First Spline */}
            <div className="spline-container">
              {!splineLoaded && <LoadingSpinner />}
              <Spline
                scene="https://prod.spline.design/W1yTq5S8u6xyyUI7/scene.splinecode"
                onLoad={handleSplineLoad}
              />
            </div>
          </div>
          <SecondPage />
          <AboutSection />
        </main>
      </div>
    </>
  );
}
