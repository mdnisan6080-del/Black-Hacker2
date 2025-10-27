import React from 'react';

interface ProgressBarProps {
  value: number;
  max: number;
  label: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value, max, label }) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-bold text-[#065F46]">{label}</span>
        <span className="text-sm font-bold text-emerald-700">{`${value} / ${max} XP`}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden border-2 border-gray-300">
        <div
          className="bg-gradient-to-r from-[#34D399] to-[#10B981] h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;