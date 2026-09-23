import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  inverted?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showSubtitle = true,
  inverted = false,
  className = '',
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const titleSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl sm:text-4xl',
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <div
        className={`${iconSizes[size]} rounded-xl flex items-center justify-center relative shadow-sm shrink-0 ${
          inverted
            ? 'bg-white text-teal-900 shadow-teal-950/20'
            : 'bg-gradient-to-br from-teal-800 to-cyan-950 text-white shadow-teal-900/10'
        }`}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-3/5 h-3/5"
        >
          {/* Subtle geometric nursing cross with pulse node */}
          <path
            d="M13 5C13 4.44772 13.4477 4 14 4H18C18.5523 4 19 4.44772 19 5V13H27C27.5523 13 28 13.4477 28 14V18C28 18.5523 27.5523 19 27 19H19V27C19 27.5523 18.5523 28 18 28H14C13.4477 28 13 27.5523 13 27V19H5C4.44772 19 4 18.5523 4 18V14C4 13.4477 4.44772 13 5 13H13V5Z"
            fill="currentColor"
            fillOpacity="0.3"
          />
          <path
            d="M8 16H12L14 11L18 21L20 16H24"
            stroke={inverted ? '#0f766e' : '#2dd4bf'}
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center tracking-tight">
          <span
            className={`font-bold font-sans ${titleSizes[size]} ${
              inverted ? 'text-white' : 'text-slate-900'
            }`}
          >
            Evolui
          </span>
          <span
            className={`font-semibold font-sans ${titleSizes[size]} ${
              inverted ? 'text-teal-300' : 'text-teal-700'
            }`}
          >
            Enf
          </span>
        </div>
        {showSubtitle && (
          <span
            className={`text-xs font-medium tracking-wide ${
              inverted ? 'text-teal-100/80' : 'text-slate-500'
            }`}
          >
            Documentação de Enfermagem
          </span>
        )}
      </div>
    </div>
  );
};
