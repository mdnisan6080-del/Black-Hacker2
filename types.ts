
export interface Question {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface Subject {
  name: string;
  icon: string;
  color: string;
  description: string;
}

export interface Level {
  name: string;
  minXp: number;
  icon: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconPrompt: string;
  minRequirement: number; // e.g., min streak or min XP
}

export interface User {
  xp: number;
  level: Level;
  streak: number;
  correctAnswers: number;
  totalQuestions: number;
  unlockedBadges: string[]; // array of badge ids
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export type Screen = 'home' | 'quiz' | 'leaderboard';

export enum MascotState {
  Idle = 'idle',
  Cheering = 'cheering',
  Thinking = 'thinking',
  Encouraging = 'encouraging',
  Dancing = 'dancing',
}
