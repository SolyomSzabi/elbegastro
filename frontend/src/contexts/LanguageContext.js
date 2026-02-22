import React, { createContext, useContext, useState } from 'react';
import translations from './translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('ro');

  const t = (path) => {
    const keys = path.split('.');
    let result = translations[language];
    for (const key of keys) {
      result = result?.[key];
    }
    return result || path;
  };

  const getItemName = (item) => item[`name_${language}`] || item.name_ro;
  const getItemDesc = (item) => item[`description_${language}`] || item.description_ro;
  const getCategoryName = (cat) => cat[`name_${language}`] || cat.name_ro;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, getItemName, getItemDesc, getCategoryName }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
