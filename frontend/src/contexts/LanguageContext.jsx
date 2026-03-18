import { createContext, useContext, useState, useEffect } from "react";
import { translations, SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, getTranslation } from "../config/i18n";

const LanguageContext = createContext(null);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  // Get saved language from localStorage or browser preference
  const getInitialLanguage = () => {
    const saved = localStorage.getItem("taric_language");
    if (saved && SUPPORTED_LANGUAGES.find(l => l.code === saved)) {
      return saved;
    }
    
    // Try to detect browser language
    const browserLang = navigator.language.split("-")[0];
    if (SUPPORTED_LANGUAGES.find(l => l.code === browserLang)) {
      return browserLang;
    }
    
    return DEFAULT_LANGUAGE;
  };

  const [language, setLanguageState] = useState(getInitialLanguage);

  // Set language and save to localStorage
  const setLanguage = (lang) => {
    if (SUPPORTED_LANGUAGES.find(l => l.code === lang)) {
      setLanguageState(lang);
      localStorage.setItem("taric_language", lang);
    }
  };

  // Get translation helper - t("dashboard.title") => "Dashboard"
  const t = (path) => {
    return getTranslation(language, path);
  };

  // Get current language info
  const currentLanguage = SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];

  const value = {
    language,
    setLanguage,
    t,
    currentLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES,
    translations: translations[language] || translations[DEFAULT_LANGUAGE],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageProvider;
