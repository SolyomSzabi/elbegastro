import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { MapPin, Phone, Clock } from 'lucide-react';

const HOURS = [
  { day: 'sun', open: '12:00', close: '24:00' },
  { day: 'mon', open: '10:00', close: '24:00' },
  { day: 'tue', open: '10:00', close: '24:00' },
  { day: 'wed', open: '10:00', close: '24:00' },
  { day: 'thu', open: '10:00', close: '24:00' },
  { day: 'fri', open: '10:00', close: '01:00' },
  { day: 'sat', open: '10:00', close: '01:00' },
];

export default function ContactSection() {
  const { t } = useLanguage();

  return (
    <section id="contact" className="py-20 md:py-32 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto" data-testid="contact-section">
      <h2 className="text-4xl md:text-5xl font-semibold tracking-wide text-center mb-4 font-['Oswald',sans-serif]">
        {t('contact.title')}
      </h2>
      <div className="w-16 h-[2px] bg-[#C8572D] mx-auto mb-16" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        {/* Info */}
        <div className="space-y-10">
          {/* Address */}
          <div className="flex gap-4">
            <div className="w-12 h-12 flex items-center justify-center border border-[#C8572D] rounded-sm shrink-0">
              <MapPin size={20} className="text-[#C8572D]" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#E8DDD0] mb-1 font-['Oswald',sans-serif]">{t('contact.address')}</h3>
              <p className="text-[#8B7D6B] font-['Source_Sans_3',sans-serif]">380 Principala, 457085 Crasna</p>
            </div>
          </div>

          {/* Phone */}
          <div className="flex gap-4">
            <div className="w-12 h-12 flex items-center justify-center border border-[#C8572D] rounded-sm shrink-0">
              <Phone size={20} className="text-[#C8572D]" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#E8DDD0] mb-1 font-['Oswald',sans-serif]">{t('contact.phone')}</h3>
              <a href="tel:0316309962" className="text-[#C8572D] hover:text-[#E07050] transition-colors font-['Source_Sans_3',sans-serif]" data-testid="phone-link">
                031 630 9962
              </a>
            </div>
          </div>

          {/* Hours */}
          <div className="flex gap-4">
            <div className="w-12 h-12 flex items-center justify-center border border-[#C8572D] rounded-sm shrink-0">
              <Clock size={20} className="text-[#C8572D]" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#E8DDD0] mb-3 font-['Oswald',sans-serif]">{t('contact.hours')}</h3>
              <div className="space-y-1.5">
                {HOURS.map(h => (
                  <div key={h.day} className="flex justify-between gap-8 text-sm font-['Source_Sans_3',sans-serif]">
                    <span className="text-[#8B7D6B] w-24">{t(`hours.${h.day}`)}</span>
                    <span className="text-[#E8DDD0]">{h.open} - {h.close}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Google Maps */}
        <div className="rounded-sm overflow-hidden border border-[#332C22] h-[400px] lg:h-full min-h-[350px]" data-testid="google-map">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2715.5!2d22.8977!3d47.1681!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4748a1c7e0000001%3A0x1!2s380+Principala%2C+457085+Crasna!5e0!3m2!1sro!2sro!4v1700000000000!5m2!1sro!2sro"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="EL&BE Restaurant Location"
          />
        </div>
      </div>
    </section>
  );
}
