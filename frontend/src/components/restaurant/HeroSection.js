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
      {/* Background Image - the actual bar photo */}
      <div className="absolute inset-0">
        <img
          src="https://customer-assets.emergentagent.com/job_dine-digital-33/artifacts/oo75we82_122281002_4006772759339254_3041328646381777357_n-big.jpg"
          alt="EL&BE Restaurant Bar"
          className="w-full h-full object-cover"
        />
        {/* Warm dark overlay */}
        <div className="absolute inset-0 bg-[#1A1714]/60" />
        {/* Bottom gradient for content readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1714] via-transparent to-[#1A1714]/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        {/* Logo with backdrop */}
        <div className="mb-8 opacity-0 animate-fade-in-up animate-delay-100" style={{ animationFillMode: 'forwards' }}>
          <div className="inline-flex items-center justify-center bg-[#E8DDD0] rounded-full shadow-2xl shadow-black/50 overflow-hidden w-44 h-44 sm:w-56 sm:h-56 md:w-64 md:h-64">
            <img
              src="https://customer-assets.emergentagent.com/job_dine-digital-33/artifacts/0jj26jng_WhatsApp_Image_2026-02-22_at_21.57.27-removebg-preview.png"
              alt="EL&BE Logo"
              className="w-[85%] h-[85%] object-contain"
              data-testid="hero-logo"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="w-24 h-[2px] bg-[#C8572D] mx-auto mb-6 opacity-0 animate-fade-in-up animate-delay-200" style={{ animationFillMode: 'forwards' }} />

        <p className="text-[#E8DDD0] text-base md:text-lg font-['Source_Sans_3',sans-serif] tracking-wide mb-10 opacity-0 animate-fade-in-up animate-delay-300 max-w-md mx-auto drop-shadow-lg" style={{ animationFillMode: 'forwards' }} data-testid="hero-tagline">
          {t('hero.tagline')}
        </p>

        <button
          onClick={scrollToMenu}
          className="bg-[#C8572D] text-white px-10 py-4 rounded-sm uppercase tracking-[0.25em] font-bold text-sm hover:bg-[#A84523] transition-all duration-300 shadow-lg hover:shadow-[#C8572D]/30 hover:-translate-y-1 opacity-0 animate-fade-in-up font-['Oswald',sans-serif]"
          style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}
          data-testid="hero-cta-btn"
        >
          {t('hero.cta')}
        </button>
      </div>

      {/* Scroll indicator */}
      <button onClick={scrollToMenu} className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[#C8572D] animate-bounce" data-testid="scroll-indicator">
        <ChevronDown size={32} strokeWidth={1} />
      </button>
    </section>
  );
}
