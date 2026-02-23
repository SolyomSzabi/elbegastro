import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { MapPin, Phone } from 'lucide-react';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#130F0C] border-t border-[#332C22] py-12 px-6 md:px-12" data-testid="footer">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <img
              src="https://customer-assets.emergentagent.com/job_dine-digital-33/artifacts/ddrlmspr_WhatsApp%20Image%202026-02-22%20at%2021.57.27.jpeg"
              alt="EL&BE"
              className="h-14 w-auto mx-auto md:mx-0 rounded-sm"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-[#8B7D6B] font-['Source_Sans_3',sans-serif]">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-[#C8572D]" strokeWidth={1.5} />
              380 Principala, 457085 Crasna
            </div>
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-[#C8572D]" strokeWidth={1.5} />
              <a href="tel:0316309962" className="hover:text-[#C8572D] transition-colors">031 630 9962</a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#1E1915] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#5C5347] font-['Source_Sans_3',sans-serif]">
            &copy; {new Date().getFullYear()} EL&BE. {t('footer.rights')}.
          </p>
          <p className="text-xs text-[#C8572D] font-['Source_Sans_3',sans-serif]">
            {t('footer.lastOrder')}
          </p>
        </div>
      </div>
    </footer>
  );
}
