'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';

export default function SettingsPage() {
  const router = useRouter();
  const { language, setLanguage, playerName, setPlayerName, coins } = useStore();
  const isAr = language === 'ar';

  const [nameInput, setNameInput] = useState(playerName);
  const [saved, setSaved] = useState(false);

  const t = {
    title: isAr ? 'الإعدادات' : 'Settings',
    back: isAr ? '→' : '←',
    language: isAr ? 'اللغة' : 'Language',
    arabic: isAr ? 'العربية' : 'Arabic',
    english: isAr ? 'الإنجليزية' : 'English',
    name: isAr ? 'اسم اللاعب' : 'Player Name',
    save: isAr ? 'حفظ' : 'Save',
    saved: isAr ? 'تم الحفظ ✓' : 'Saved ✓',
    coins: isAr ? 'العملات' : 'Coins',
    about: isAr ? 'حول التطبيق' : 'About',
    aboutText: isAr
      ? 'لعبة مسابقة ثنائية اللغة (عربي / إنجليزي) تشمل 10 فئات و60 سؤالاً.'
      : 'A bilingual quiz game (Arabic / English) with 10 categories and 60 questions.',
    version: 'v1.0.0',
  };

  function handleSave() {
    if (nameInput.trim()) {
      setPlayerName(nameInput.trim());
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="min-h-screen bg-bg-light" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="hero-gradient text-white px-4 pt-12 pb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
          >
            {t.back}
          </button>
          <h1 className="text-xl font-bold">{t.title}</h1>
        </div>
      </div>

      <div className="px-4 pt-5 pb-8 space-y-4">
        {/* Language Card */}
        <div className="bg-white card-shadow rounded-3xl p-5">
          <h2 className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-4">
            {t.language}
          </h2>
          <div className="flex gap-3">
            <button
              onClick={() => setLanguage('ar')}
              className={`flex-1 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                language === 'ar'
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              🇸🇦 {t.arabic}
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`flex-1 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                language === 'en'
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              🇬🇧 {t.english}
            </button>
          </div>
        </div>

        {/* Player Name Card */}
        <div className="bg-white card-shadow rounded-3xl p-5">
          <h2 className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-4">
            {t.name}
          </h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder={playerName}
              maxLength={20}
              className="flex-1 border-2 border-gray-100 rounded-2xl px-4 py-3 text-gray-800 font-medium focus:outline-none focus:border-primary transition-all"
              dir={isAr ? 'rtl' : 'ltr'}
            />
            <button
              onClick={handleSave}
              className={`px-5 py-3 rounded-2xl font-bold text-sm transition-all ${
                saved
                  ? 'bg-success text-white'
                  : 'bg-primary text-white hover:bg-primary-dark'
              }`}
            >
              {saved ? t.saved : t.save}
            </button>
          </div>
        </div>

        {/* Coins Card */}
        <div className="bg-white card-shadow rounded-3xl p-5">
          <h2 className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-3">
            {t.coins}
          </h2>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-secondary/20 rounded-2xl flex items-center justify-center text-2xl">
              🪙
            </div>
            <div>
              <p className="text-3xl font-black text-gray-800">{coins}</p>
              <p className="text-gray-400 text-xs">{t.coins}</p>
            </div>
          </div>
        </div>

        {/* About Card */}
        <div className="bg-white card-shadow rounded-3xl p-5">
          <h2 className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-3">
            {t.about}
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">{t.aboutText}</p>
          <p className="text-gray-300 text-xs mt-2">{t.version}</p>
        </div>
      </div>
    </div>
  );
}
