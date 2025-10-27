
import React from 'react';
import { MascotState } from '../types';

interface QuizyMascotProps {
  state: MascotState;
  className?: string;
}

const QuizyMascot: React.FC<QuizyMascotProps> = ({ state, className = 'w-32 h-32' }) => {
  const getAnimationClass = () => {
    switch (state) {
      case MascotState.Cheering: return 'animate-bounce';
      case MascotState.Dancing: return 'animate-wiggle'; // Custom animation
      case MascotState.Encouraging: return 'animate-pulse';
      default: return '';
    }
  };

  const Eye = ({ cx, cy }: { cx: number; cy: number }) => (
    <g>
      <circle cx={cx} cy={cy} r="10" fill="white" />
      <circle cx={cx} cy={cy + 2} r="5" fill="black" />
    </g>
  );

  const Mouth = () => {
    switch (state) {
      case MascotState.Cheering:
      case MascotState.Dancing:
        return <path d="M 40 70 Q 50 85 60 70" stroke="white" strokeWidth="3" fill="none" />;
      case MascotState.Encouraging:
        return <path d="M 45 75 Q 50 70 55 75" stroke="white" strokeWidth="3" fill="none" />;
      default:
        return <line x1="45" y1="75" x2="55" y2="75" stroke="white" strokeWidth="3" />;
    }
  };

  return (
    <div className={`${className} ${getAnimationClass()}`}>
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <style>
                {`
                @keyframes wiggle {
                    0%, 100% { transform: rotate(-3deg); }
                    50% { transform: rotate(3deg); }
                }
                .animate-wiggle { animation: wiggle 1s ease-in-out infinite; }
                `}
            </style>
        </defs>
        <circle cx="50" cy="50" r="45" fill="#34D399" stroke="#10B981" strokeWidth="4" />
        <Eye cx={35} cy={45} />
        <Eye cx={65} cy={45} />
        <Mouth />
      </svg>
    </div>
  );
};

export default QuizyMascot;
