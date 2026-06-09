'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Question } from '@/data/questions';

export type Language = 'en' | 'ar';
export type GameMode = 'classic' | 'timed' | 'daily' | 'survival';

interface QuizState {
  questions: Question[];
  currentIndex: number;
  score: number;
  streak: number;
  lives: number;
  selectedAnswer: string | null;
  isRevealed: boolean;
  timeRemaining: number;
  mode: GameMode;
  categoryId: number | null;
  isComplete: boolean;
  xp: number;
  coinsEarned: number;
}

interface AppState {
  // Persistent
  language: Language;
  playerName: string;
  coins: number;

  // Quiz session
  quizState: QuizState;

  // Actions
  setLanguage: (lang: Language) => void;
  setPlayerName: (name: string) => void;
  addCoins: (amount: number) => void;

  startQuiz: (questions: Question[], mode: GameMode, categoryId?: number | null) => void;
  selectAnswer: (answer: string) => void;
  nextQuestion: () => void;
  resetQuiz: () => void;
  tickTimer: () => void;
}

const defaultQuizState: QuizState = {
  questions: [],
  currentIndex: 0,
  score: 0,
  streak: 0,
  lives: 3,
  selectedAnswer: null,
  isRevealed: false,
  timeRemaining: 60,
  mode: 'classic',
  categoryId: null,
  isComplete: false,
  xp: 0,
  coinsEarned: 0,
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      language: 'en',
      playerName: 'Player',
      coins: 0,
      quizState: defaultQuizState,

      setLanguage: (lang) => set({ language: lang }),
      setPlayerName: (name) => set({ playerName: name }),
      addCoins: (amount) => set((s) => ({ coins: s.coins + amount })),

      startQuiz: (questions, mode, categoryId = null) =>
        set({
          quizState: {
            ...defaultQuizState,
            questions,
            mode,
            categoryId,
            timeRemaining: mode === 'timed' ? 60 : 30,
            lives: mode === 'survival' ? 1 : 3,
          },
        }),

      selectAnswer: (answer) => {
        const { quizState } = get();
        if (quizState.isRevealed) return;
        const currentQ = quizState.questions[quizState.currentIndex];
        const isCorrect = answer === currentQ.correct;
        const newStreak = isCorrect ? quizState.streak + 1 : 0;
        const scoreGain = isCorrect
          ? 10 + (quizState.streak >= 2 ? 5 : 0) + currentQ.difficulty * 5
          : 0;
        const coinsGain = isCorrect ? currentQ.difficulty * 2 : 0;
        const xpGain = isCorrect ? currentQ.difficulty * 10 : 0;
        const newLives = !isCorrect && quizState.mode === 'survival' ? 0 : quizState.lives;

        set({
          quizState: {
            ...quizState,
            selectedAnswer: answer,
            isRevealed: true,
            score: quizState.score + scoreGain,
            streak: newStreak,
            lives: newLives,
            coinsEarned: quizState.coinsEarned + coinsGain,
            xp: quizState.xp + xpGain,
            // Survival mode ends immediately on wrong answer
            isComplete: quizState.mode === 'survival' && !isCorrect,
          },
        });
      },

      nextQuestion: () => {
        const { quizState } = get();
        const nextIndex = quizState.currentIndex + 1;
        const isLastQuestion = nextIndex >= quizState.questions.length;
        const isSurvivalDead = quizState.mode === 'survival' && quizState.lives === 0;

        if (isLastQuestion || isSurvivalDead) {
          // Add earned coins to total
          set((s) => ({
            coins: s.coins + quizState.coinsEarned,
            quizState: {
              ...quizState,
              isComplete: true,
              currentIndex: nextIndex,
            },
          }));
        } else {
          set({
            quizState: {
              ...quizState,
              currentIndex: nextIndex,
              selectedAnswer: null,
              isRevealed: false,
              timeRemaining:
                quizState.mode === 'timed' ? quizState.timeRemaining : 30,
            },
          });
        }
      },

      resetQuiz: () =>
        set({ quizState: defaultQuizState }),

      tickTimer: () => {
        const { quizState } = get();
        if (!quizState.isRevealed && quizState.timeRemaining > 0) {
          set({
            quizState: {
              ...quizState,
              timeRemaining: quizState.timeRemaining - 1,
            },
          });
        } else if (quizState.timeRemaining === 0 && !quizState.isRevealed) {
          // Time's up — auto-reveal as wrong
          set({
            quizState: {
              ...quizState,
              selectedAnswer: '__timeout__',
              isRevealed: true,
              streak: 0,
            },
          });
        }
      },
    }),
    {
      name: 'quiz-app-storage',
      partialize: (state) => ({
        language: state.language,
        playerName: state.playerName,
        coins: state.coins,
      }),
    }
  )
);
