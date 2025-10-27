
import type { Subject, Level, Badge } from './types';

export const SUBJECTS: Subject[] = [
  { name: 'Science', icon: '🧬', color: 'bg-blue-400', description: 'Explore the wonders of the natural world.' },
  { name: 'Math', icon: '🧮', color: 'bg-green-400', description: 'Challenge your numerical and logical skills.' },
  { name: 'History', icon: '📜', color: 'bg-yellow-500', description: 'Travel back in time and uncover the past.' },
  { name: 'General Knowledge', icon: '🌍', color: 'bg-purple-400', description: 'Test your knowledge on a wide range of topics.' },
];

export const LEVELS: Level[] = [
  { name: 'Beginner', minXp: 0, icon: '🔰' },
  { name: 'Learner', minXp: 100, icon: '🧠' },
  { name: 'Skilled', minXp: 300, icon: '💪' },
  { name: 'Pro', minXp: 600, icon: '🚀' },
  { name: 'Master', minXp: 1000, icon: '👑' },
];

export const BADGES: Badge[] = [
    { id: 'streak-master', name: 'Streak Master', description: '10+ correct answers in a row', iconPrompt: 'A cute, vibrant cartoon icon of a fiery trophy for a "Streak Master" achievement, digital art style, on a clean white background.', minRequirement: 10 },
    { id: 'knowledge-king', name: 'Knowledge King', description: '500+ XP earned', iconPrompt: 'A cute, vibrant cartoon icon of a sparkling diamond brain for a "Knowledge King" achievement, digital art style, on a clean white background.', minRequirement: 500 },
];
