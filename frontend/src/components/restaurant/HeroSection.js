import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ChevronDown } from 'lucide-react';

export default function HeroSection() {
  const { t } = useLanguage();

  const scrollToMenu = () => {
    document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden" data-testid="hero-section">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://images.pexels.com/photos/19343364/pexels-photo-19343364.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
          alt="EL&BE Restaurant"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <p className="text-[#D4AF37] text-sm md:text-base tracking-[0.3em] uppercase mb-6 opacity-0 animate-fade-in-up animate-delay-100" style={{ animationFillMode: 'forwards' }} data-testid="hero-subtitle">
          {t('hero.subtitle')}
        </p>
        <h1 className="text-6xl sm:text-7xl lg:text-9xl font-bold tracking-tight mb-4 opacity-0 animate-fade-in-up animate-delay-200" style={{ animationFillMode: 'forwards' }}>
          <span className="text-[#EDEDED]">EL</span>
          <span className="gold-text">&</span>
          <span className="text-[#EDEDED]">BE</span>
        </h1>
        <p className="text-[#A1A1AA] text-base md:text-lg font-['Manrope',sans-serif] tracking-wide mb-12 opacity-0 animate-fade-in-up animate-delay-300" style={{ animationFillMode: 'forwards' }} data-testid="hero-tagline">
          {t('hero.tagline')}
        </p>
        <button
          onClick={scrollToMenu}
          className="bg-[#D4AF37] text-black px-10 py-4 rounded-sm uppercase tracking-[0.2em] font-bold text-sm hover:bg-[#C5A059] transition-all duration-300 shadow-[0_4px_14px_0_rgba(212,175,55,0.39)] hover:shadow-[0_6px_20px_rgba(212,175,55,0.23)] hover:-translate-y-1 opacity-0 animate-fade-in-up"
          style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}
          data-testid="hero-cta-btn"
        >
          {t('hero.cta')}
        </button>
      </div>

      {/* Scroll indicator */}
      <button onClick={scrollToMenu} className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[#D4AF37] animate-bounce" data-testid="scroll-indicator">
        <ChevronDown size={32} strokeWidth={1} />
      </button>
    </section>
  );
}
