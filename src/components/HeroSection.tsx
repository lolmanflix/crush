import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
export const HeroSection = () => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Animation values
  const minScale = 0.18; // scale to match header size
  const maxScroll = 180; // px after which it's fully transformed
  const progress = Math.min(scrollY / maxScroll, 1);
  const scale = 1 - (1 - minScale) * progress;
  const translateY = progress * -120; // move up as it shrinks
  const opacity = 1 - progress * 1.2;

  return <section className="relative w-full h-screen">
      <div className="absolute inset-0">
        <img src="/WhatsApp Image 2025-07-18 at 8.48.30 PM.jpeg" alt="Ra3 Hero" className="w-full h-full object-cover" />
      </div>
      <div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col items-center justify-center text-white p-4">
        {/* Animated Brand Name */}
        <h1
          className="font-serif font-bold tracking-widest text-center mb-8 select-none pointer-events-none"
          style={{
            fontSize: '12vw',
            transform: `scale(${scale}) translateY(${translateY}px)`,
            opacity: opacity < 0 ? 0 : opacity,
            transition: 'transform 0.3s cubic-bezier(.4,0,.2,1), opacity 0.3s cubic-bezier(.4,0,.2,1)',
            letterSpacing: '0.2em',
            position: 'relative',
            zIndex: 10
          }}
        >
          Ra3
        </h1>
        <h2 className="text-5xl md:text-7xl font-bold tracking-wider text-center mb-6">
          SPRING COLLECTION
        </h2>
        <p className="text-xl md:text-2xl mb-8 text-center max-w-2xl">
          Discover the new season's most refined pieces for men and kids
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button className="bg-white text-black px-8 py-3 font-medium hover:bg-gray-100 transition" onClick={() => navigate('/men')}>
            SHOP MEN
          </button>
          <button className="bg-white text-black px-8 py-3 font-medium hover:bg-gray-100 transition" onClick={() => navigate('/kids')}>
            SHOP KIDS
          </button>
        </div>
      </div>
    </section>;
};