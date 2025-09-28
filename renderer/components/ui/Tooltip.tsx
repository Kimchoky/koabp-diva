import React, { useState, useRef, ReactNode } from 'react';
import { cn } from '../utils/cn';

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';

interface TooltipProps {
  content: string | ReactNode;
  position?: TooltipPosition;
  children: ReactNode;
  className?: string;
  delay?: number;
}

export default function Tooltip({
  content,
  position = 'bottom',
  children,
  className,
  delay = 500
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
    topLeft: 'bottom-full left-0 mb-2',
    topRight: 'bottom-full right-0 mb-2',
    bottomLeft: 'top-full left-0 mt-2',
    bottomRight: 'top-full right-0 mt-2'
  };

  const arrowClasses = {
    top: 'top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-800 dark:border-t-gray-200',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-gray-800 dark:border-b-gray-200',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-t-4 border-b-4 border-l-4 border-t-transparent border-b-transparent border-l-gray-800 dark:border-l-gray-200',
    right: 'right-full top-1/2 transform -translate-y-1/2 border-t-4 border-b-4 border-r-4 border-t-transparent border-b-transparent border-r-gray-800 dark:border-r-gray-200',
    topLeft: 'top-full left-3 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-800 dark:border-t-gray-200',
    topRight: 'top-full right-3 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-800 dark:border-t-gray-200',
    bottomLeft: 'bottom-full left-3 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-gray-800 dark:border-b-gray-200',
    bottomRight: 'bottom-full right-3 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-gray-800 dark:border-b-gray-200'
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      {children}
      {isVisible && (
        <div
          className={cn(
            'absolute z-50 px-3 py-2 text-sm text-white bg-gray-800 dark:text-gray-900 dark:bg-gray-200 rounded shadow-lg whitespace-nowrap',
            positionClasses[position],
            className
          )}
        >
          {content}
          <div
            className={cn(
              'absolute w-0 h-0',
              arrowClasses[position]
            )}
          />
        </div>
      )}
    </div>
  );
}