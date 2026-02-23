import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, Globe } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const LANGS = [
  { code: 'ro', label: 'Română', flag: '🇷🇴' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'hu', label: 'Magyar', flag: '🇭🇺' },
];

export default function Navbar() {
  const { totalItems } = useCart();
  const { language, setLanguage, t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const scrollToSection = (id) => {
    setMobileOpen(false);
    if (window.location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1A1714]/95 backdrop-blur-md border-b border-[#332C22]" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <Link to="/" className="flex items-center group" data-testid="navbar-logo">
          <div className="h-10 w-10 md:h-12 md:w-12 rounded-full overflow-hidden border-2 border-[#332C22]">
            <img src="https://customer-assets.emergentagent.com/job_dine-digital-33/artifacts/ddrlmspr_WhatsApp%20Image%202026-02-22%20at%2021.57.27.jpeg" alt="EL&BE" className="w-full h-full object-cover" />
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <button onClick={() => scrollToSection('menu')} className="text-sm tracking-[0.2em] uppercase text-[#8B7D6B] hover:text-[#C8572D] transition-colors font-['Oswald',sans-serif] font-light" data-testid="nav-menu-btn">
            {t('nav.menu')}
          </button>
          <button onClick={() => scrollToSection('contact')} className="text-sm tracking-[0.2em] uppercase text-[#8B7D6B] hover:text-[#C8572D] transition-colors font-['Oswald',sans-serif] font-light" data-testid="nav-contact-btn">
            {t('nav.contact')}
          </button>

          {/* Language Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 text-sm text-[#8B7D6B] hover:text-[#C8572D] transition-colors" data-testid="language-switcher">
              <Globe size={16} strokeWidth={1.5} />
              <span className="uppercase font-['Oswald',sans-serif]">{language}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#252019] border-[#332C22]" data-testid="language-dropdown">
              {LANGS.map(l => (
                <DropdownMenuItem key={l.code} onClick={() => setLanguage(l.code)} className={`cursor-pointer ${language === l.code ? 'text-[#C8572D]' : 'text-[#E8DDD0]'}`} data-testid={`lang-${l.code}`}>
                  <span className="mr-2">{l.flag}</span> {l.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Cart */}
          <Link to="/checkout" className="relative flex items-center gap-2 bg-[#C8572D] text-white px-5 py-2.5 rounded-sm text-sm font-bold uppercase tracking-[0.15em] hover:bg-[#A84523] transition-all font-['Oswald',sans-serif]" data-testid="cart-button">
            <ShoppingCart size={16} strokeWidth={2} />
            {t('nav.cart')}
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#E8DDD0] text-[#1A1714] text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold" data-testid="cart-count">
                {totalItems}
              </span>
            )}
          </Link>
        </div>

        {/* Mobile Nav */}
        <div className="flex md:hidden items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger className="text-[#8B7D6B]" data-testid="mobile-language-switcher">
              <Globe size={20} strokeWidth={1.5} />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#252019] border-[#332C22]">
              {LANGS.map(l => (
                <DropdownMenuItem key={l.code} onClick={() => setLanguage(l.code)} className={`cursor-pointer ${language === l.code ? 'text-[#C8572D]' : 'text-[#E8DDD0]'}`}>
                  <span className="mr-2">{l.flag}</span> {l.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Link to="/checkout" className="relative" data-testid="mobile-cart-button">
            <ShoppingCart size={22} className="text-[#C8572D]" strokeWidth={1.5} />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#E8DDD0] text-[#1A1714] text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
                {totalItems}
              </span>
            )}
          </Link>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button className="text-[#E8DDD0]" data-testid="mobile-menu-toggle">
                {mobileOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-[#1A1714] border-[#332C22] w-72 pt-16">
              <div className="flex flex-col gap-6">
                <button onClick={() => scrollToSection('menu')} className="text-lg tracking-[0.2em] uppercase text-[#8B7D6B] hover:text-[#C8572D] transition-colors text-left font-['Oswald',sans-serif]" data-testid="mobile-nav-menu">
                  {t('nav.menu')}
                </button>
                <button onClick={() => scrollToSection('contact')} className="text-lg tracking-[0.2em] uppercase text-[#8B7D6B] hover:text-[#C8572D] transition-colors text-left font-['Oswald',sans-serif]" data-testid="mobile-nav-contact">
                  {t('nav.contact')}
                </button>
                <Link to="/checkout" onClick={() => setMobileOpen(false)} className="text-lg tracking-[0.2em] uppercase text-[#C8572D] text-left font-['Oswald',sans-serif]" data-testid="mobile-nav-cart">
                  {t('nav.cart')} ({totalItems})
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
