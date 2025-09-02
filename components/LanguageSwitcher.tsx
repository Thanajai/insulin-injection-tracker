import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from './LanguageProvider';
import { LanguageIcon, ChevronDownIcon } from './icons';

type LanguageCode = 'en' | 'es' | 'fr' | 'de' | 'hi';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  const languages: Record<LanguageCode, string> = {
      en: 'English',
      es: 'Español',
      fr: 'Français',
      de: 'Deutsch',
      hi: 'हिन्दी'
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);
  
  const handleSelect = (lang: LanguageCode) => {
    setLanguage(lang);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 flex items-center space-x-1 text-zinc-400 hover:bg-zinc-700/50 rounded-full transition-colors duration-300"
        aria-label="Change language"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <LanguageIcon className="w-6 h-6" />
        <span className="text-sm font-semibold uppercase">{language}</span>
        <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div 
            className="absolute right-0 mt-2 w-36 bg-zinc-800/80 backdrop-blur-lg border border-zinc-700/50 rounded-md shadow-lg py-1 z-50 animate-fade-in-down"
            role="menu"
        >
          {Object.entries(languages).map(([code, name]) => (
            <button
              key={code}
              onClick={() => handleSelect(code as LanguageCode)}
              className={`w-full text-left px-4 py-2 text-sm ${
                language === code
                  ? 'bg-blue-500 text-white'
                  : 'text-zinc-200 hover:bg-zinc-700'
              }`}
              role="menuitem"
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};