
import React, { useState, useEffect } from 'react';
import type { Badge } from '../types';
import { generateRewardImage } from '../services/geminiService';
import QuizyMascot from './QuizyMascot';
import { MascotState } from '../types';

const Confetti: React.FC = () => {
  const confettiPieces = Array.from({ length: 50 }).map((_, index) => {
    // FIX: Cast style object to React.CSSProperties to allow custom CSS properties for the animation.
    const style = {
      '--x-end': `${Math.random() * 400 - 200}px`,
      '--y-end': `${Math.random() * 200 + 150}px`,
      '--rotation-end': `${Math.random() * 1080}deg`,
      '--duration': `${Math.random() * 1 + 1.5}s`,
      '--delay': `${Math.random() * 0.2}s`,
      backgroundColor: ['#34D399', '#10B981', '#FBBF24', '#F87171', '#60A5FA'][Math.floor(Math.random() * 5)],
      animation: 'confetti-burst var(--duration) var(--delay) ease-out forwards'
    } as React.CSSProperties;
    return <div key={index} className="confetti-piece" style={style} />;
  });

  return <div className="absolute top-1/4 left-1/2 w-0 h-0 pointer-events-none z-20">{confettiPieces}</div>;
};


interface RewardModalProps {
  badge: Badge;
  onClose: () => void;
}

const RewardModal: React.FC<RewardModalProps> = ({ badge, onClose }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateImage = async () => {
      setIsLoading(true);
      const url = await generateRewardImage(badge.iconPrompt);
      setImageUrl(url);
      setIsLoading(false);
    };
    generateImage();
  }, [badge]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-gradient-to-br from-emerald-400 to-green-500 p-8 rounded-3xl shadow-2xl text-white max-w-sm w-full text-center transform transition-all scale-95 animate-scale-in relative overflow-hidden">
        <Confetti />
        <div className="relative z-10">
            <h2 className="text-3xl font-black mb-2">Badge Unlocked!</h2>
            <div className="flex justify-center my-4">
                <QuizyMascot state={MascotState.Dancing} className="w-28 h-28"/>
            </div>
            <div className="bg-white/30 rounded-2xl p-4 my-4 flex justify-center items-center h-48">
            {isLoading ? (
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white"></div>
            ) : imageUrl ? (
                <img src={imageUrl} alt={badge.name} className="max-h-full max-w-full rounded-lg" />
            ) : (
                <p className="text-emerald-900">Couldn't generate image.</p>
            )}
            </div>
            <h3 className="text-2xl font-bold">{badge.name}</h3>
            <p className="text-lg opacity-90 mb-6">{badge.description}</p>
            <button
            onClick={onClose}
            className="bg-white text-emerald-600 font-bold py-3 px-8 rounded-full text-lg hover:bg-emerald-50 transition-colors duration-300"
            >
            Awesome!
            </button>
        </div>
      </div>
       <style>{`
        @keyframes scale-in {
            from { transform: scale(0.8); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in { animation: scale-in 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28) forwards; }
        
        @keyframes confetti-burst {
          from {
            transform: translate(-50%, -50%) rotate(0) scale(1);
            opacity: 1;
          }
          to {
            transform: translate(var(--x-end), var(--y-end)) rotate(var(--rotation-end)) scale(0);
            opacity: 0;
          }
        }
        .confetti-piece {
          position: absolute;
          width: 8px;
          height: 16px;
          opacity: 0;
        }
        `}</style>
    </div>
  );
};

export default RewardModal;
