import React from 'react';
import HeroSection from '@/components/restaurant/HeroSection';
import MenuSection from '@/components/restaurant/MenuSection';
import ContactSection from '@/components/restaurant/ContactSection';

export default function HomePage() {
  return (
    <main data-testid="home-page">
      <HeroSection />
      <MenuSection />
      <ContactSection />
    </main>
  );
}
