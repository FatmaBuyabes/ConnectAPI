export interface Category {
  id: number;
  nameAr: string;
  nameEn: string;
  icon: string;
  color: string;
  locked: boolean;
  unlockCost: number;
}

export const categories: Category[] = [
  { id: 1, nameAr: 'المعلومات العامة', nameEn: 'General Knowledge', icon: '🌍', color: '#6C63FF', locked: false, unlockCost: 0 },
  { id: 2, nameAr: 'العلوم', nameEn: 'Science', icon: '🔬', color: '#00BFA5', locked: false, unlockCost: 0 },
  { id: 3, nameAr: 'التكنولوجيا', nameEn: 'Technology', icon: '💻', color: '#2196F3', locked: false, unlockCost: 0 },
  { id: 4, nameAr: 'التاريخ', nameEn: 'History', icon: '📜', color: '#FF7043', locked: false, unlockCost: 0 },
  { id: 5, nameAr: 'الجغرافيا', nameEn: 'Geography', icon: '🗺️', color: '#43A047', locked: false, unlockCost: 0 },
  { id: 6, nameAr: 'الرياضة', nameEn: 'Sports', icon: '⚽', color: '#FB8C00', locked: true, unlockCost: 100 },
  { id: 7, nameAr: 'الأعمال والاقتصاد', nameEn: 'Business', icon: '💼', color: '#8D6E63', locked: true, unlockCost: 100 },
  { id: 8, nameAr: 'الفنون والثقافة', nameEn: 'Arts & Culture', icon: '🎨', color: '#E91E63', locked: true, unlockCost: 150 },
  { id: 9, nameAr: 'الحضارة الإسلامية', nameEn: 'Islamic Civilization', icon: '🕌', color: '#009688', locked: true, unlockCost: 150 },
  { id: 10, nameAr: 'اللغة العربية', nameEn: 'Arabic Language', icon: '📖', color: '#9C27B0', locked: true, unlockCost: 200 },
];

export const gameModes = [
  { id: 'classic', nameAr: 'الكلاسيكي', nameEn: 'Classic', icon: '🏛️', descAr: 'صعوبة تدريجية', descEn: 'Progressive difficulty', color: '#1A6B5A' },
  { id: 'timed', nameAr: 'التحدي الزمني', nameEn: 'Timed Challenge', icon: '⚡', descAr: 'أجب على أكبر عدد في دقيقة', descEn: 'As many as you can in 1 min', color: '#6C63FF' },
  { id: 'daily', nameAr: 'المسابقة اليومية', nameEn: 'Daily Quiz', icon: '📅', descAr: 'أسئلة جديدة كل يوم', descEn: 'Fresh daily questions', color: '#D4A017' },
  { id: 'survival', nameAr: 'البقاء للأقوى', nameEn: 'Survival', icon: '💀', descAr: 'خطأ واحد ينهي اللعبة', descEn: 'One wrong answer ends it', color: '#E74C3C' },
];
