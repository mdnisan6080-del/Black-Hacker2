import React from 'react';
import { SUBJECTS } from '../constants';
import type { Subject, User } from '../types';
import ProgressBar from './ProgressBar';
import { LEVELS } from '../constants';

interface HomeScreenProps {
  user: User;
  onSelectSubject: (subject: Subject) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ user, onSelectSubject }) => {

  const nextLevel = LEVELS.find(l => l.minXp > user.xp) ?? LEVELS[LEVELS.length - 1];
  const currentLevelXp = user.level.minXp;
  const nextLevelXp = nextLevel.minXp;
  const xpInLevel = user.xp - currentLevelXp;
  const xpForNextLevel = nextLevelXp - currentLevelXp;

  return (
    <div className="min-h-screen bg-[#F0FFF4] text-[#065F46] p-4 sm:p-8 flex flex-col items-center">
      <header className="w-full max-w-4xl mb-8">
        <div className="flex justify-between items-center bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-lg border-2 border-emerald-200">
          <div>
            <h1 className="text-2xl sm:text-4xl font-black">Welcome back!</h1>
            <p className="text-emerald-700">Ready for a new challenge?</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black flex items-center gap-2">
                <span>{user.level.icon}</span>
                <span>{user.level.name}</span>
            </div>
            <div className="text-lg font-bold text-amber-500 flex items-center justify-end gap-1">
              <span>🔥</span>
              <span>{user.streak}</span>
            </div>
          </div>
        </div>
        <div className="mt-4 bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-lg border-2 border-emerald-200">
             <ProgressBar 
                label={`Level Progress`}
                value={xpInLevel} 
                max={xpForNextLevel > 0 ? xpForNextLevel : 100}
            />
        </div>
      </header>
      
      <main className="w-full max-w-4xl">
        <h2 className="text-3xl font-bold text-center mb-6">Choose a Subject</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          {SUBJECTS.map((subject) => (
            <button
              key={subject.name}
              onClick={() => onSelectSubject(subject)}
              className={`group p-6 rounded-2xl text-white font-bold text-left transform transition-all duration-300 hover:scale-105 hover:shadow-2xl ${subject.color}`}
            >
              <div className="text-5xl mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">{subject.icon}</div>
              <h3 className="text-3xl font-black mb-1">{subject.name}</h3>
              <p className="font-normal opacity-90">{subject.description}</p>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
};

export default HomeScreen;