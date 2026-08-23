import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export const ScrollToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 250) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isVisible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Volver arriba"
      title="Volver al inicio de la página"
      className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40 p-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-glow-emerald hover:shadow-lg transition-all duration-200 active:scale-95 animate-fade-in flex items-center justify-center cursor-pointer border border-emerald-400/40"
    >
      <ArrowUp size={20} strokeWidth={2.5} />
    </button>
  );
};
