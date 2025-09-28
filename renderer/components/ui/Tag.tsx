import React, { ReactNode } from 'react';

interface TagProps {
  children: ReactNode;
  variant?: 'primary' | 'success' | 'error' | 'warning' | 'info' | 'custom';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  className?: string;
  animate?: boolean;
}

const Tag = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  animate = false
}: TagProps) => {
  const baseClasses = 'inline-flex items-center gap-1 rounded font-medium transition-all';

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const variantClasses = {
    primary: 'bg-[#3954E0FF] text-gray-300',
    success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    error: 'bg-red-600 text-red-200',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    custom: ''
  };

  const animateClass = animate ? 'animate-pulse' : '';

  return (
    <span
      className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${animateClass}
        justify-center
        ${className}
      `.trim()}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};

export default Tag;