import React, { forwardRef } from "react";
import { cn } from "../utils/cn";

type TextInputSizeTypes = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type TextInputVariantTypes = 'contained' | 'outlined';

interface TextInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: TextInputSizeTypes;
  variant?: TextInputVariantTypes;
  error?: boolean;
  helperText?: string;
  label?: string;
}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({
    size = 'md',
    variant = 'contained',
    error = false,
    helperText,
    label,
    className,
    ...props
  }, ref) => {

    // 사이즈별 클래스 정의
    const sizeClasses = {
      xs: 'px-2 py-1 text-xs',
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
      xl: 'px-8 py-4 text-xl'
    };

    // 기본 클래스
    const baseClasses = "rounded font-medium transition-all duration-200 outline-none focus:ring-2";

    // 변형별 클래스
    const variantClasses = {
      contained: `
        bg-[--color-surface-light] dark:bg-[--color-surface-dark]
        text-[--color-text-light] dark:text-[--color-text-dark]
        border border-transparent
        focus:ring-blue-500/30 focus:border-blue-500
      `,
      outlined: `
        bg-transparent
        border border-[--color-border-light] dark:border-[--color-border-dark]
        text-[--color-text-light] dark:text-[--color-text-dark]
        focus:ring-blue-500/30 focus:border-blue-500
      `
    };

    // 에러 상태 클래스
    const errorClasses = error ? `
      border-red-500 dark:border-red-400
      focus:ring-red-500/30 focus:border-red-500
    ` : '';

    // disabled 상태 클래스
    const disabledClasses = `
      disabled:opacity-50 disabled:cursor-not-allowed
      disabled:bg-gray-100 dark:disabled:bg-gray-800
    `;

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-sm font-medium text-[--color-text-light] dark:text-[--color-text-dark]">
            {label}
          </label>
        )}

        <input
          ref={ref}
          className={cn(
            baseClasses,
            sizeClasses[size as TextInputSizeTypes],
            variantClasses[variant],
            errorClasses,
            disabledClasses,
            className
          )}
          {...props}
        />

        {helperText && (
          <span className={`text-xs ${error ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

TextInput.displayName = "TextInput";

export default TextInput;