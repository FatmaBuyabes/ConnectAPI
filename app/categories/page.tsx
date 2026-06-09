'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { categories } from '@/data/categories';
import { arabicQuestions, englishQuestions } from '@/data/questions';
import { getGeographyQuestions } from '@/lib/countries';

export default function CategoriesPage() {
  const router = useRouter();
  const { language, coins, startQuiz } = useStore();
  const [loadingCat, setLoadingCat] = useState<number | null>(null);
  const isAr = language === 'ar';

  const t = {
    title: isAr ? 'الفئات' : 'Categories',
    locked: isAr ? 'مقفل' : 'Locked',
    unlock: isAr ? 'فتح' : 'Unlock',
    coinsNeeded: isAr ? 'عملة' : 'coins',
    yourCoins: isAr ? 'عملاتك' : 'Your coins',
    back: isAr ? '→' : '←',
    loading: isAr ? 'جارٍ التحميل...' : 'Loading…',
    liveTag: isAr ? '🌐 مباشر' : '🌐 Live',
  };

  async function handleCategory(catId: number, locked: boolean) {
    if (locked || loadingCat !== null) return;

    // Geography (catId 5) → live API questions
    if (catId === 5) {
      setLoadingCat(5);
      try {
        const questions = await getGeographyQuestions(language, 10);
        startQuiz(questions, 'classic', catId);
        router.push('/quiz');
      } catch {
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

  return (
    <div className="min-h-screen bg-bg-light" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="hero-gradient text-white px-4 pt-12 pb-6">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
          >
            {t.back}
          </button>
          <h1 className="text-xl font-bold">{t.title}</h1>
        </div>
        {/* Coins display */}
        <div className="flex items-center gap-2 bg-white/15 rounded-2xl px-4 py-2 w-fit">
          <span className="text-xl">🪙</span>
          <span className="font-bold">{coins}</span>
          <span className="text-white/70 text-sm">{t.yourCoins}</span>
        </div>
      </div>

      {/* Grid */}
      <div className="px-4 pt-5 pb-8">
        <div className="grid grid-cols-2 gap-3">
          {categories.map((cat) => {
            const canAfford = coins >= cat.unlockCost;
            const isGeo = cat.id === 5;
            const isLoading = loadingCat === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategory(cat.id, cat.locked)}
                disabled={cat.locked || isLoading}
                className={`relative bg-white card-shadow rounded-3xl p-4 text-start transition-all
                  ${cat.locked ? 'opacity-70' : 'hover:scale-[1.02] active:scale-[0.98]'}
                  ${isLoading ? 'opacity-80 cursor-wait' : ''}`}
              >
                {/* Lock badge */}
                {cat.locked && (
                  <div className="absolute top-3 right-3 bg-gray-200 rounded-full w-6 h-6 flex items-center justify-center">
                    <span className="text-xs">🔒</span>
                  </div>
                )}

                {/* Live badge for Geography */}
                {isGeo && !cat.locked && (
                  <div className="absolute top-3 right-3 bg-green-100 text-green-700 rounded-full px-2 py-0.5 text-[10px] font-bold">
                    {t.liveTag}
                  </div>
                )}

                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-3"
                  style={{ backgroundColor: `${cat.color}20` }}
                >
                  {isLoading ? (
                    <span className="animate-spin text-xl">⏳</span>
                  ) : (
                    cat.icon
                  )}
                </div>

                {/* Name */}
                <p className="font-bold text-gray-800 text-sm leading-tight">
                  {isLoading ? t.loading : (isAr ? cat.nameAr : cat.nameEn)}
                </p>

                {/* Lock cost / live label / color bar */}
                {cat.locked ? (
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-xs">🪙</span>
                    <span className={`text-xs font-semibold ${canAfford ? 'text-secondary' : 'text-gray-400'}`}>
                      {cat.unlockCost} {t.coinsNeeded}
                    </span>
                  </div>
                ) : isGeo ? (
                  <p className="text-[10px] text-green-600 font-medium mt-1">
                    {isAr ? 'أسئلة حية من API' : 'Live questions via API'}
                  </p>
                ) : (
                  <div className="mt-2 h-1 rounded-full w-8" style={{ backgroundColor: cat.color }} />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
