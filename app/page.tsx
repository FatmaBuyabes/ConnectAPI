'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { categories, gameModes } from '@/data/categories';
import { arabicQuestions, englishQuestions } from '@/data/questions';
import { getGeographyQuestions } from '@/lib/countries';

export default function HomePage() {
  const router = useRouter();
  const { language, setLanguage, coins, playerName, startQuiz } = useStore();
  const [loadingCat, setLoadingCat] = useState<number | null>(null);

  const isAr = language === 'ar';

  const t = {
    greeting: isAr ? `مرحباً، ${playerName}!` : `Hello, ${playerName}!`,
    subtitle: isAr ? 'اختبر معلوماتك اليوم' : 'Test your knowledge today',
    gameModes: isAr ? 'أوضاع اللعب' : 'Game Modes',
    categories: isAr ? 'الفئات' : 'Categories',
    viewAll: isAr ? 'عرض الكل' : 'View All',
    coins: isAr ? 'عملة' : 'coins',
    settings: isAr ? 'الإعدادات' : 'Settings',
    loading: isAr ? 'جارٍ التحميل...' : 'Loading...',
  };

  function handleModeSelect(modeId: string) {
    const questions = isAr ? arabicQuestions : englishQuestions;
    const shuffled = [...questions].sort(() => Math.random() - 0.5).slice(0, 10);
    startQuiz(shuffled, modeId as 'classic' | 'timed' | 'daily' | 'survival');
    router.push('/quiz');
  }

  async function handleCategorySelect(catId: number, locked: boolean) {
    if (locked || loadingCat !== null) return;

    // Category 5 = Geography → fetch live questions from REST Countries API
    if (catId === 5) {
      setLoadingCat(5);
      try {
        const questions = await getGeographyQuestions(language, 10);
        startQuiz(questions, 'classic', catId);
        router.push('/quiz');
      } catch {
        // Fallback to static questions if API fails
        const questions = isAr ? arabicQuestions : englishQuestions;
        const filtered = questions.filter((q) => q.categoryId === catId);
        startQuiz([...filtered].sort(() => Math.random() - 0.5), 'classic', catId);
        router.push('/quiz');
      } finally {
        setLoadingCat(null);
      }
      return;
    }

    const questions = isAr ? arabicQuestions : englishQuestions;
    const filtered = questions.filter((q) => q.categoryId === catId);
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    startQuiz(shuffled, 'classic', catId);
    router.push('/quiz');
  }

  const quickCats = categories.slice(0, 5);

  return (
    <div className="min-h-screen bg-bg-light pb-8" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Hero Banner */}
      <div className="hero-gradient text-white px-5 pt-12 pb-8 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        {/* Top row */}
        <div className="flex items-center justify-between mb-6 relative z-10">
          {/* Language toggle */}
          <div className="flex items-center gap-1 bg-white/20 rounded-full p-1">
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 rounded-full text-sm font-semibold transition-all ${
                language === 'en' ? 'bg-white text-primary' : 'text-white'
              }`}
            >
              🇬🇧 EN
            </button>
            <button
              onClick={() => setLanguage('ar')}
              className={`px-3 py-1 rounded-full text-sm font-semibold transition-all ${
                language === 'ar' ? 'bg-white text-primary' : 'text-white'
              }`}
            >
              🇸🇦 AR
            </button>
          </div>

          {/* Coins pill + Settings */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-secondary/90 text-white px-3 py-1.5 rounded-full shadow-md">
              <span className="text-base">🪙</span>
              <span className="font-bold text-sm">{coins}</span>
            </div>
            <button
              onClick={() => router.push('/settings')}
              className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
            >
              <span className="text-base">⚙️</span>
            </button>
          </div>
        </div>

        {/* Greeting */}
        <div className="relative z-10">
          <h1 className="text-2xl font-bold mb-1">{t.greeting}</h1>
          <p className="text-white/80 text-sm">{t.subtitle}</p>
        </div>
      </div>

      <div className="px-4 mt-6 space-y-6">
        {/* Game Modes */}
        <section>
          <h2 className="text-gray-700 font-bold text-base mb-3">{t.gameModes}</h2>
          <div className="grid grid-cols-2 gap-3">
            {gameModes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => handleModeSelect(mode.id)}
                className="card-shadow bg-white rounded-2xl p-4 text-start hover:scale-[1.02] transition-all active:scale-[0.98]"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3"
                  style={{ backgroundColor: `${mode.color}20` }}
                >
                  {mode.icon}
                </div>
                <p className="font-bold text-gray-800 text-sm leading-tight">
                  {isAr ? mode.nameAr : mode.nameEn}
                </p>
                <p className="text-gray-400 text-xs mt-1 leading-snug">
                  {isAr ? mode.descAr : mode.descEn}
                </p>
                <div
                  className="mt-2 h-1 rounded-full w-8"
                  style={{ backgroundColor: mode.color }}
                />
              </button>
            ))}
          </div>
        </section>

        {/* Quick Categories Strip */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-gray-700 font-bold text-base">{t.categories}</h2>
            <button
              onClick={() => router.push('/categories')}
              className="text-primary text-sm font-semibold hover:underline"
            >
              {t.viewAll}
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {quickCats.map((cat) => {
              const isLoading = loadingCat === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id, cat.locked)}
                  disabled={isLoading}
                  className="flex-none flex flex-col items-center gap-1.5 bg-white card-shadow rounded-2xl px-4 py-3 hover:scale-[1.03] transition-all disabled:opacity-70"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    style={{ backgroundColor: `${cat.color}20` }}
                  >
                    {isLoading ? '⏳' : cat.icon}
                  </div>
                  <span className="text-xs font-semibold text-gray-700 whitespace-nowrap max-w-[72px] text-center leading-tight">
                    {isLoading ? t.loading : (isAr ? cat.nameAr : cat.nameEn)}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
