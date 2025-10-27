import React, { useState, useEffect, useCallback } from 'react';
import { generateQuizQuestions } from '../services/geminiService';
import type { Question, Subject, User } from '../types';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import QuizyMascot from './QuizyMascot';
import { MascotState } from '../types';

interface QuizScreenProps {
  subject: Subject;
  user: User;
  onQuizEnd: (score: number, xpGained: number, streak: number) => void;
  onBack: () => void;
}

const QuizScreen: React.FC<QuizScreenProps> = ({ subject, user, onQuizEnd, onBack }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [mascotState, setMascotState] = useState<MascotState>(MascotState.Idle);

  const { play, isPlaying } = useAudioPlayer();

  const loadQuestions = useCallback(async () => {
    setIsLoading(true);
    setMascotState(MascotState.Thinking);
    const fetchedQuestions = await generateQuizQuestions(subject.name);
    setQuestions(fetchedQuestions);
    setIsLoading(false);
    setMascotState(MascotState.Idle);
    if (fetchedQuestions.length > 0) {
      play(`First question: ${fetchedQuestions[0].question}`);
    }
  }, [subject.name, play]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const handleAnswerSelect = (index: number) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(index);
    const correct = index === questions[currentQuestionIndex].correctAnswerIndex;
    setIsCorrect(correct);

    if (correct) {
      setScore(s => s + 1);
      setMascotState(MascotState.Cheering);
      play("Correct!");
    } else {
      setMascotState(MascotState.Encouraging);
      play("Not quite, try the next one!");
    }
  };
  
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(i => i + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
        setMascotState(MascotState.Idle);
        play(questions[currentQuestionIndex + 1].question);
    } else {
      const xpGained = score * 10 * (user.streak + score >= 10 ? 1.5 : 1);
      const newStreak = isCorrect ? user.streak + score : 0;
      onQuizEnd(score, Math.round(xpGained), newStreak);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-[#F0FFF4] text-[#065F46]">
        <QuizyMascot state={MascotState.Thinking} className="w-48 h-48"/>
        <h2 className="text-2xl font-bold mt-4 animate-pulse">Generating your quiz...</h2>
        <p>Quizy is thinking hard!</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return <div className="flex justify-center items-center min-h-screen">Failed to load questions.</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];

  const getButtonClass = (index: number) => {
    if (selectedAnswer === null) {
      return 'bg-white hover:bg-emerald-50 transform hover:-translate-y-1 transition-transform';
    }
    if (index === currentQuestion.correctAnswerIndex) {
      return 'bg-green-300 border-green-500 animate-tada';
    }
    if (index === selectedAnswer) {
      return 'bg-red-300 border-red-500 animate-shake';
    }
    return 'bg-white opacity-60 cursor-not-allowed';
  };

  return (
    <div className="min-h-screen bg-[#F0FFF4] text-[#065F46] p-4 flex flex-col justify-between">
       <style>{`
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
        .animate-shake { animation: shake 0.82s cubic-bezier(.36,.07,.19,.97) both; }

        @keyframes tada {
          from { transform: scale3d(1, 1, 1); }
          10%, 20% { transform: scale3d(.9, .9, .9) rotate3d(0, 0, 1, -3deg); }
          30%, 50%, 70%, 90% { transform: scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, 3deg); }
          40%, 60%, 80% { transform: scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, -3deg); }
          to { transform: scale3d(1, 1, 1); }
        }
        .animate-tada { animation: tada 1s ease; }
      `}</style>
      <div>
        <header className="flex justify-between items-center mb-4">
          <button onClick={onBack} className="text-2xl font-bold text-gray-400 hover:text-gray-600">✕</button>
          <div className="w-full mx-4">
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-[#34D399] h-4 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className="text-lg font-bold text-amber-500 flex items-center gap-1">
              <span>🔥</span>
              <span>{user.streak + (score > currentQuestionIndex && isCorrect ? 1 : 0)}</span>
            </div>
        </header>
        <div className="text-center my-6">
          <h2 className="text-2xl sm:text-3xl font-bold">{currentQuestion.question}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              disabled={selectedAnswer !== null}
              className={`p-4 w-full rounded-xl border-b-4 text-lg font-bold transition-all duration-200 ${getButtonClass(index)} ${selectedAnswer === null ? 'border-gray-200' : ''}`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <footer className={`fixed bottom-0 left-0 right-0 p-4 transition-transform duration-500 ease-[cubic-bezier(0.18,0.89,0.32,1.28)] ${selectedAnswer !== null ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className={`p-6 rounded-t-3xl ${isCorrect ? 'bg-emerald-100' : 'bg-red-100'}`}>
          <div className="flex items-center gap-4">
            <QuizyMascot state={mascotState} className="w-16 h-16"/>
            <div>
              <h3 className={`text-xl font-bold ${isCorrect ? 'text-emerald-800' : 'text-red-800'}`}>{isCorrect ? 'Great job!' : 'Good try!'}</h3>
              <p className="text-gray-600">{currentQuestion.explanation}</p>
            </div>
          </div>
          <button
            onClick={handleNextQuestion}
            className={`w-full mt-4 p-4 rounded-xl text-white font-bold text-xl border-b-4 ${isCorrect ? 'bg-emerald-500 border-emerald-700' : 'bg-red-500 border-red-700'}`}
          >
            {currentQuestionIndex < questions.length - 1 ? 'Next' : 'Finish Quiz'}
          </button>
        </div>
      </footer>
    </div>
  );
};

export default QuizScreen;