import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { MapPin, Phone } from 'lucide-react';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#0A0A0B] border-t border-[#2E2E30] py-12 px-6 md:px-12" data-testid="footer">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <span className="text-2xl font-bold font-['Cinzel',serif] tracking-wider">
              <span className="text-[#EDEDED]">EL</span>
              <span className="text-[#D4AF37]">&</span>
              <span className="text-[#EDEDED]">BE</span>
            </span>
            <p className="text-[#555] text-xs tracking-widest uppercase mt-1 font-['Manrope',sans-serif]">
              Restaurant &middot; Bar &middot; Grill &middot; Take Away
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-[#A1A1AA] font-['Manrope',sans-serif]">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-[#D4AF37]" strokeWidth={1.5} />
              380 Principala, 457085 Crasna
            </div>
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-[#D4AF37]" strokeWidth={1.5} />
              <a href="tel:0316309962" className="hover:text-[#D4AF37] transition-colors">031 630 9962</a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#1A1A1C] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#555] font-['Manrope',sans-serif]">
            &copy; {new Date().getFullYear()} EL&BE. {t('footer.rights')}.
          </p>
          <p className="text-xs text-[#D4AF37] font-['Manrope',sans-serif]">
            {t('footer.lastOrder')}
          </p>
        </div>
      </div>
    </footer>
  );
}
