import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, X } from 'lucide-react';

interface HelpTooltipProps {
  text: string;
  id?: string;
  title?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({
  text,
  id,
  title,
  position = 'top',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fecha tooltip ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex items-center align-middle ${className}`}
    >
      <button
        type="button"
        id={id}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        aria-label={title || 'Ajuda contextual'}
        aria-expanded={isOpen}
        className="p-1 rounded-full text-slate-400 hover:text-teal-700 hover:bg-teal-50 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500/40"
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <div
          role="tooltip"
          className={`absolute z-50 w-60 sm:w-64 p-3 bg-slate-900 text-white rounded-xl shadow-lg border border-slate-700 text-xs font-normal leading-relaxed ${positionClasses[position]} animate-in fade-in zoom-in-95 duration-150`}
        >
          <div className="flex items-start justify-between gap-1.5 mb-1">
            {title && (
              <span className="font-semibold text-teal-300 text-[11px] uppercase tracking-wider">
                {title}
              </span>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              className="ml-auto text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <p className="text-slate-200 text-[11px] leading-snug">{text}</p>
        </div>
      )}
    </div>
  );
};
