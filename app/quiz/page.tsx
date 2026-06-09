'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';

export default function QuizPage() {
  const router = useRouter();
  const {
    language,
    quizState,
    selectAnswer,
    nextQuestion,
    resetQuiz,
    tickTimer,
  } = useStore();

  const isAr = language === 'ar';
  const {
    questions,
    currentIndex,
    score,
    streak,
    lives,
    selectedAnswer,
    isRevealed,
    timeRemaining,
    mode,
    isComplete,
  } = quizState;

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Redirect if no questions loaded
  useEffect(() => {
    if (questions.length === 0) {
      router.replace('/');
    }
  }, [questions.length, router]);

  // Redirect to results when complete
  useEffect(() => {
    if (isComplete) {
      router.push('/results');
    }
  }, [isComplete, router]);

  // Timer tick
  useEffect(() => {
    if (isRevealed || isComplete || questions.length === 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      tickTimer();
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRevealed, isComplete, currentIndex, questions.length, tickTimer]);

  if (questions.length === 0) return null;
  if (currentIndex >= questions.length) return null;

  const currentQ = questions[currentIndex];
  const total = questions.length;
  const progress = ((currentIndex) / total) * 100;

  const t = {
    question: isAr ? 'سؤال' : 'Question',
    of: isAr ? 'من' : 'of',
    score: isAr ? 'النقاط' : 'Score',
    streak: isAr ? 'سلسلة' : 'Streak',
    next: isAr ? 'التالي' : 'Next',
    quit: isAr ? 'إنهاء' : 'Quit',
    correct: isAr ? '✓ صحيح!' : '✓ Correct!',
    wrong: isAr ? '✗ خطأ' : '✗ Wrong',
    timeUp: isAr ? 'انتهى الوقت!' : "Time's Up!",
    lives: isAr ? 'الأرواح' : 'Lives',
  };

  const timerMax = mode === 'timed' ? 60 : 30;
  const timerPct = (timeRemaining / timerMax) * 100;
  const timerLow = timeRemaining <= 5;

  function getOptionStyle(opt: string) {
    if (!isRevealed) {
      return 'bg-white border-2 border-gray-100 text-gray-800 hover:border-primary hover:bg-primary/5';
    }
    if (opt === currentQ.correct) {
      return 'bg-success/10 border-2 border-success text-success font-semibold';
    }
    if (opt === selectedAnswer && selectedAnswer !== currentQ.correct) {
      return 'bg-error/10 border-2 border-error text-error font-semibold';
    }
    return 'bg-white border-2 border-gray-100 text-gray-400 opacity-60';
  }

  const feedbackLabel =
    !isRevealed
      ? null
      : selectedAnswer === '__timeout__'
      ? t.timeUp
      : selectedAnswer === currentQ.correct
      ? t.correct
      : t.wrong;

  const feedbackColor =
    selectedAnswer === currentQ.correct ? 'text-success' : 'text-error';

  const diffStars = Array.from({ length: 3 }, (_, i) => i < currentQ.difficulty);

  return (
    <div className="min-h-screen bg-bg-light flex flex-col" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="hero-gradient text-white px-4 pt-10 pb-5">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => { resetQuiz(); router.push('/'); }}
            className="w-8 h-8 flex items-center justify-center bg-white/20 rounded-full hover:bg-white/30 transition-all text-sm"
          >
            {isAr ? '→' : '←'}
          </button>

          <div className="flex items-center gap-4">
            {/* Score */}
            <div className="text-center">
              <p className="text-white/70 text-xs">{t.score}</p>
              <p className="font-bold text-base">{score}</p>
            </div>
            {/* Streak */}
            {streak > 1 && (
              <div className="text-center">
                <p className="text-white/70 text-xs">{t.streak}</p>
                <p className="font-bold text-base text-secondary">🔥{streak}</p>
              </div>
            )}
            {/* Lives (survival) */}
            {mode === 'survival' && (
              <div className="text-center">
                <p className="text-white/70 text-xs">{t.lives}</p>
                <p className="font-bold text-base">{'❤️'.repeat(lives)}</p>
              </div>
            )}
          </div>

          {/* Timer */}
          <div
            className={`w-11 h-11 rounded-full border-2 flex items-center justify-center font-bold text-sm
              ${timerLow ? 'border-error bg-error/20 timer-low' : 'border-white/40 bg-white/10'}`}
          >
            {timeRemaining}
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-white/20 rounded-full h-1.5">
            <div
              className="bg-secondary h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-white/70 text-xs whitespace-nowrap">
            {currentIndex + 1}/{total}
          </span>
        </div>

        {/* Timer bar (timed mode) */}
        {mode === 'timed' && (
          <div className="mt-2 bg-white/20 rounded-full h-1">
            <div
              className={`h-1 rounded-full transition-all duration-1000 ${timerLow ? 'bg-error' : 'bg-secondary'}`}
              style={{ width: `${timerPct}%` }}
            />
          </div>
        )}
      </div>

      {/* Question Card */}
      <div className="flex-1 px-4 pt-5 pb-6 space-y-4">
        <div className="bg-white card-shadow rounded-3xl p-5 animate-fade-in-up">
          {/* Difficulty + category indicator */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-1">
              {diffStars.map((filled, i) => (
                <span key={i} className={`text-sm ${filled ? 'text-secondary' : 'text-gray-200'}`}>
                  ★
                </span>
              ))}
            </div>
            <span className="text-xs text-gray-400 font-medium">
              {t.question} {currentIndex + 1} {t.of} {total}
            </span>
          </div>

          <h2 className="text-gray-800 font-bold text-lg leading-relaxed">
            {currentQ.question}
          </h2>

          {/* Feedback */}
          {isRevealed && feedbackLabel && (
            <div className={`mt-3 font-bold text-base ${feedbackColor} animate-fade-in-up`}>
              {feedbackLabel}
            </div>
          )}
        </div>

        {/* Options */}
        <div className="space-y-3">
          {currentQ.options.map((opt, idx) => (
            <button
              key={`${currentIndex}-${idx}`}
              disabled={isRevealed}
              onClick={() => selectAnswer(opt)}
              className={`option-btn w-full text-start px-4 py-4 rounded-2xl text-sm font-medium leading-snug ${getOptionStyle(opt)}`}
            >
              <span className="inline-flex items-start gap-3">
                <span
                  className="mt-0.5 w-6 h-6 rounded-full border-2 border-current flex-shrink-0 flex items-center justify-center text-xs font-bold"
                >
                  {String.fromCharCode(65 + idx)}
                </span>
                <span>{opt}</span>
              </span>
            </button>
          ))}
        </div>

        {/* Next button */}
        {isRevealed && (
          <button
            onClick={nextQuestion}
            className="w-full bg-primary text-white font-bold py-4 rounded-2xl hover:bg-primary-dark transition-all active:scale-[0.98] animate-fade-in-up mt-2"
          >
            {currentIndex >= total - 1
              ? (isAr ? 'عرض النتائج' : 'Show Results')
              : (isAr ? 'السؤال التالي ←' : 'Next Question →')}
          </button>
        )}
      </div>
    </div>
  );
}
