'use client';

import Image from "next/image";
import { useState, useEffect, useRef } from 'react';
import Dashboard from './components/Dashboard';

export default function Home() {
  const [entered, setEntered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [trail, setTrail] = useState<any[]>([]);
  const [ethPosition, setEthPosition] = useState({ x: 50, y: 50 });
  const [currentLanguage, setCurrentLanguage] = useState(0);
  const [trailCounter, setTrailCounter] = useState(0);
  const animationRef = useRef<number>(0);

  const languages = [
    "Click the comet to enter",
    "Haz clic en el cometa para entrar",
    "Cliquez sur la comète pour entrer",
    "Clicca sulla cometa per entrare",
    "Klicken Sie auf den Kometen, um einzutreten",
    "Clique no cometa para entrar",
    "Нажмите на комету, чтобы войти",
    "点击彗星进入",
    "彗星をクリックして入る",
    "혜성을 클릭하여 들어가기"
  ];

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setMousePosition({ x, y });

      // Add trail points less frequently for longer, more spaced trail
      setTrailCounter(prev => {
        const newCounter = prev + 1;
        if (newCounter >= 3) { // Reduced from 6 to 3 for even smoother trail
          setTrail(prevTrail => {
            const newTrail = [...prevTrail, { x, y, id: Date.now() + Math.random(), color: getRandomColor() }];
            return newTrail.slice(-25); // Adjusted trail length for optimal flow
          });
          return 0;
        }
        return newCounter;
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const animate = () => {
      setEthPosition(prev => {
        let newX = prev.x + (mousePosition.x - prev.x) * 0.08;
        let newY = prev.y + (mousePosition.y - prev.y) * 0.08;

        // Buffered boundaries with gradual pull-back instead of hard limits
        const buffer = 8; // Buffer zone in percentage
        if (newX < buffer) newX = buffer + (newX - buffer) * 0.3; // Gradual pull-back
        if (newX > 100 - buffer) newX = 100 - buffer + (newX - (100 - buffer)) * 0.3;
        if (newY < buffer) newY = buffer + (newY - buffer) * 0.3;
        if (newY > 100 - buffer) newY = 100 - buffer + (newY - (100 - buffer)) * 0.3;

        return { x: newX, y: newY };
      });
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [mousePosition]);

  useEffect(() => {
    const languageInterval = setInterval(() => {
      setCurrentLanguage(prev => (prev + 1) % languages.length);
    }, 2000); // Change every 2 seconds

    return () => clearInterval(languageInterval);
  }, []);

  const getRandomColor = () => {
    const colors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  if (entered) {
    return <Dashboard />;
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      {/* Star field background */}
      <div className="absolute inset-0">
        {[...Array(300)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${Math.random() * 3 + 2}s`,
            }}
          />
        ))}
      </div>

      {/* Cosmic haze trail */}
      <div className="absolute inset-0 pointer-events-none">
        {trail.map((point, i) => (
          <div
            key={point.id}
            className="absolute rounded-full animate-cosmic-haze"
            style={{
              left: `${point.x}%`,
              top: `${point.y}%`,
              width: '60px', // Slightly smaller for better spacing
              height: '60px',
              background: `radial-gradient(circle, ${point.color}50 0%, ${point.color}25 40%, ${point.color}10 70%, transparent 100%)`,
              opacity: (i + 1) / trail.length * 0.9,
              transform: 'translate(-50%, -50%)',
              filter: 'blur(10px)',
              animationDelay: `${i * 0.15}s`, // Staggered animation for flowing effect
            }}
          />
        ))}
      </div>

      {/* Following ETH diamond */}
      <div
        className="absolute cursor-pointer transition-all duration-300 hover:scale-110 z-10"
        style={{
          left: `${ethPosition.x}%`,
          top: `${ethPosition.y}%`,
          transform: 'translate(-50%, -50%)',
        }}
        onClick={() => setEntered(true)}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 rounded-full blur-2xl opacity-60 animate-pulse"></div>
          <Image
            src="https://ethereum.org/_next/image/?url=%2F_next%2Fstatic%2Fmedia%2Fimpact_transparent.7420c423.png&w=828&q=75"
            alt="Ethereum Logo"
            width={120}
            height={120}
            className="relative z-10 opacity-90 hover:opacity-100 transition-opacity duration-300"
          />
          {/* Inner glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 rounded-full blur-lg opacity-40 animate-pulse"></div>
        </div>
      </div>

      <div className="text-center z-10 max-w-4xl mx-auto px-8">
        {/* Minimal title */}
        <h1 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight" style={{fontFamily: 'var(--font-orbitron)'}}>
          NexusTrade
        </h1>

        {/* Rotating language subtitle */}
        <p className="text-lg text-gray-400 mb-8 font-light transition-all duration-500 animate-pulse" style={{
          fontFamily: 'Arial Black, sans-serif',
          textShadow: '1px 1px 2px rgba(255,255,255,0.1)',
          letterSpacing: '1px'
        }}>
          {languages[currentLanguage]}
        </p>
      </div>
    </div>
  );
}
