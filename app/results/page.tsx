'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { arabicQuestions, englishQuestions } from '@/data/questions';

function getGrade(accuracy: number): { grade: string; color: string; label: string } {
  if (accuracy >= 95) return { grade: 'S', color: '#6C63FF', label: 'Legendary' };
  if (accuracy >= 80) return { grade: 'A', color: '#27AE60', label: 'Excellent' };
  if (accuracy >= 65) return { grade: 'B', color: '#1A6B5A', label: 'Good' };
  if (accuracy >= 50) return { grade: 'C', color: '#F39C12', label: 'Average' };
  return { grade: 'D', color: '#E74C3C', label: 'Keep Practicing' };
}

function getGradeAr(accuracy: number): string {
  if (accuracy >= 95) return 'أسطوري';
  if (accuracy >= 80) return 'ممتاز';
  if (accuracy >= 65) return 'جيد';
  if (accuracy >= 50) return 'مقبول';
  return 'تحتاج تدريباً';
}

export default function ResultsPage() {
  const router = useRouter();
  const { language, quizState, resetQuiz, startQuiz } = useStore();
  const isAr = language === 'ar';

  const { questions, score, currentIndex, coinsEarned, xp, mode, categoryId } = quizState;

  // Count correct answers: compare answered questions
  // We track score per question. Estimate correct count from score
  const totalQuestions = questions.length;

  useEffect(() => {
    if (totalQuestions === 0) {
      router.replace('/');
    }
  }, [totalQuestions, router]);

  if (totalQuestions === 0) return null;

  // Estimate correct answers from base score (10 pts per correct at diff 1)
  // Better: derive from max possible score
  const maxScore = questions.reduce((acc, q) => acc + 10 + q.difficulty * 5, 0);
  const rawAccuracy = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  const accuracy = Math.min(100, rawAccuracy);
  const { grade, color: gradeColor, label } = getGrade(accuracy);

  const t = {
    title: isAr ? 'النتائج' : 'Results',
    yourScore: isAr ? 'نقاطك' : 'Your Score',
    accuracy: isAr ? 'الدقة' : 'Accuracy',
    earned: isAr ? 'المكتسب' : 'Earned',
    coins: isAr ? 'عملة' : 'Coins',
    xp: 'XP',
    playAgain: isAr ? 'العب مرة أخرى' : 'Play Again',
    home: isAr ? 'الرئيسية' : 'Home',
    gradeLabel: isAr ? getGradeAr(accuracy) : label,
    outOf: isAr ? 'من' : 'of',
  };

  function handlePlayAgain() {
    const allQ = isAr ? arabicQuestions : englishQuestions;
    let pool = categoryId ? allQ.filter((q) => q.categoryId === categoryId) : allQ;
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, totalQuestions);
    startQuiz(shuffled, mode, categoryId ?? null);
    router.push('/quiz');
  }

  function handleHome() {
    resetQuiz();
    router.push('/');
  }

  return (
    <div className="min-h-screen bg-bg-light flex flex-col items-center justify-start pt-12 px-4 pb-8" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Grade circle */}
      <div className="relative mb-6">
        <div
          className="w-28 h-28 rounded-full flex items-center justify-center text-white shadow-2xl"
          style={{ backgroundColor: gradeColor }}
        >
          <div className="text-center">
            <div className="text-4xl font-black leading-none">{grade}</div>
          </div>
        </div>
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white rounded-full px-3 py-1 shadow-md">
          <span className="text-xs font-bold" style={{ color: gradeColor }}>{t.gradeLabel}</span>
        </div>
      </div>

      {/* Title */}
      <h1 className="text-2xl font-black text-gray-800 mb-1 text-center">{t.title}</h1>

      {/* Score card */}
      <div className="bg-white card-shadow rounded-3xl p-6 w-full mt-4 space-y-5">
        {/* Main score */}
        <div className="text-center">
          <p className="text-gray-400 text-sm">{t.yourScore}</p>
          <p className="text-5xl font-black text-gray-800 mt-1">{score}</p>
        </div>

        <div className="h-px bg-gray-100" />

        {/* Accuracy */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600 text-sm font-medium">{t.accuracy}</span>
            <span className="font-bold text-gray-800">{accuracy}%</span>
          </div>
          <div className="bg-gray-100 rounded-full h-3">
            <div
              className="h-3 rounded-full transition-all duration-1000"
              style={{ width: `${accuracy}%`, backgroundColor: gradeColor }}
            />
          </div>
        </div>

        <div className="h-px bg-gray-100" />

        {/* Coins + XP earned */}
        <div className="flex gap-4">
          <div className="flex-1 bg-secondary/10 rounded-2xl p-3 text-center">
            <p className="text-2xl font-black text-secondary">🪙 +{coinsEarned}</p>
            <p className="text-xs text-gray-500 mt-1">{t.coins}</p>
          </div>
          <div className="flex-1 bg-accent/10 rounded-2xl p-3 text-center">
            <p className="text-2xl font-black text-accent">⚡ +{xp}</p>
            <p className="text-xs text-gray-500 mt-1">{t.xp}</p>
          </div>
        </div>

        {/* XP bar */}
        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>XP Progress</span>
            <span>{xp} / 500</span>
          </div>
          <div className="bg-gray-100 rounded-full h-2.5">
            <div
              className="xp-bar h-2.5 rounded-full"
              style={{ width: `${Math.min(100, (xp / 500) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="w-full mt-5 space-y-3">
        <button
          onClick={handlePlayAgain}
          className="w-full bg-primary text-white font-bold py-4 rounded-2xl hover:bg-primary-dark transition-all active:scale-[0.98]"
        >
          {t.playAgain}
        </button>
        <button
          onClick={handleHome}
          className="w-full bg-white text-primary font-bold py-4 rounded-2xl border-2 border-primary/20 hover:border-primary/50 transition-all active:scale-[0.98]"
        >
          {t.home}
        </button>
      </div>
    </div>
  );
}
