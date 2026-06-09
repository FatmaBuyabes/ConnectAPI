'use client';

import { useEffect } from 'react';
import { useStore } from '@/store/useStore';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const language = useStore((s) => s.language);

  useEffect(() => {
    const html = document.documentElement;
    html.lang = language;
    html.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  return <>{children}</>;
}
