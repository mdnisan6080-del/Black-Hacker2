
import React, { useState, useCallback, useEffect } from 'react';
import HomeScreen from './components/HomeScreen';
import QuizScreen from './components/QuizScreen';
import Chatbot from './components/Chatbot';
import RewardModal from './components/RewardModal';
import { LEVELS, BADGES } from './constants';
import type { Screen, Subject, User, Level, Badge } from './types';

const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('home');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [unlockedBadge, setUnlockedBadge] = useState<Badge | null>(null);

  const [user, setUser] = useState<User>(() => {
    const savedUser = localStorage.getItem('quizUser');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      const currentLevel = LEVELS.slice().reverse().find(l => parsedUser.xp >= l.minXp) || LEVELS[0];
      return {...parsedUser, level: currentLevel };
    }
    return {
      xp: 0,
      level: LEVELS[0],
      streak: 0,
      correctAnswers: 0,
      totalQuestions: 0,
      unlockedBadges: [],
    };
  });

  useEffect(() => {
    localStorage.setItem('quizUser', JSON.stringify(user));
  }, [user]);

  const checkUnlocks = useCallback((updatedUser: User) => {
    for (const badge of BADGES) {
      if (!updatedUser.unlockedBadges.includes(badge.id)) {
        let conditionMet = false;
        if(badge.id === 'streak-master') {
            conditionMet = updatedUser.streak >= badge.minRequirement;
        } else if (badge.id === 'knowledge-king') {
            conditionMet = updatedUser.xp >= badge.minRequirement;
        }
        
        if (conditionMet) {
          setUnlockedBadge(badge);
          setUser(prev => ({
            ...prev,
            unlockedBadges: [...prev.unlockedBadges, badge.id],
          }));
          // Stop after first new badge to show one modal at a time
          break; 
        }
      }
    }
  }, []);

  const handleSelectSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    setScreen('quiz');
  };

  const handleQuizEnd = (score: number, xpGained: number, finalStreak: number) => {
    setUser(prevUser => {
      const newXp = prevUser.xp + xpGained;
      const newLevel = LEVELS.slice().reverse().find(l => newXp >= l.minXp) || prevUser.level;

      const updatedUser = {
        ...prevUser,
        xp: newXp,
        level: newLevel,
        streak: finalStreak,
        correctAnswers: prevUser.correctAnswers + score,
        totalQuestions: prevUser.totalQuestions + (selectedSubject ? 5 : 0),
      };
      checkUnlocks(updatedUser);
      return updatedUser;
    });
    setScreen('home');
  };

  const renderScreen = () => {
    switch (screen) {
      case 'quiz':
        return selectedSubject && (
          <QuizScreen 
            subject={selectedSubject} 
            user={user}
            onQuizEnd={handleQuizEnd}
            onBack={() => setScreen('home')}
          />
        );
      case 'home':
      default:
        return <HomeScreen user={user} onSelectSubject={handleSelectSubject} />;
    }
  };

  return (
    <div className="App">
      {renderScreen()}
      <Chatbot />
      {unlockedBadge && <RewardModal badge={unlockedBadge} onClose={() => setUnlockedBadge(null)} />}
    </div>
  );
};

export default App;
