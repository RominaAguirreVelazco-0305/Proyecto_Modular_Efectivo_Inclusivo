import React from 'react';
import { audioFeedback } from '../utils/audioFeedback';

interface AccessibleButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  className?: string;
  ariaLabel?: string;
  ariaDescription?: string;
}

export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  onClick,
  children,
  disabled = false,
  variant = 'primary',
  className = '',
  ariaLabel,
  ariaDescription
}) => {
  const handleClick = () => {
    audioFeedback.playClick();
    onClick();
  };

  const baseClasses = 'font-bold py-6 px-8 rounded-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-offset-2 text-xl min-h-[80px] shadow-lg hover:shadow-xl transform hover:-translate-y-1';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white focus:ring-blue-500 shadow-blue-200',
    secondary: 'bg-gradient-to-r from-gray-600 to-slate-600 hover:from-gray-700 hover:to-slate-700 text-white focus:ring-gray-500',
    danger: 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white focus:ring-red-500'
  };

  const disabledClasses = 'opacity-50 cursor-not-allowed transform-none hover:shadow-lg';

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${disabled ? disabledClasses : ''} ${className}`}
      aria-label={ariaLabel}
      aria-describedby={ariaDescription ? `${ariaDescription}-desc` : undefined}
    >
      {children}
      {ariaDescription && (
        <span id={`${ariaDescription}-desc`} className="sr-only">
          {ariaDescription}
        </span>
      )}
    </button>
  );
};