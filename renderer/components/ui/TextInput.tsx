import React, {forwardRef, useState} from "react";
import { cn } from "../utils/cn";
import {LucideEye, LucideEyeOff} from "lucide-react";

type TextInputSizeTypes = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type TextInputVariantTypes = 'contained' | 'outlined';

interface TextInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: TextInputSizeTypes;
  variant?: TextInputVariantTypes;
  error?: boolean;
  helperText?: string;
  label?: string;
  isPassword?: boolean;
}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({
    size = 'md',
    variant = 'outlined',
    error = false,
    helperText,
    label,
    isPassword = false,
    className,
    ...props
  }, ref) => {

    const [passwordVisible, setPasswordVisible] = useState(false);

    // 사이즈별 클래스 정의
    const sizeClasses = {
      xs: 'px-2 py-1 text-xs',
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
      xl: 'px-8 py-4 text-xl'
    };

    // 기본 클래스
    const baseClasses = "rounded font-medium transition-all duration-200 outline-none focus:ring-2 w-full";

    // 변형별 클래스
    const variantClasses = {
      contained: `
        bg-surface-light dark:bg-surface-dark
        text-text-light dark:text-text-dark
        border border-transparent
        focus:ring-blue-500/30 focus:border-blue-500
      `,
      outlined: `
        bg-transparent
        border border-border-light dark:border-border-dark
        text-text-light dark:text-text-dark
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

    const {type, placeholder, ...restProps} = props;
    return (
      <div className="flex flex-col gap-1 relative">
        {label && (
          <label className="text-sm font-medium text-text-light dark:text-text-dark">
            {label}
          </label>
        )}

        <div className="relative">
          <input
            ref={ref}
            className={cn(
              baseClasses,
              sizeClasses[size as TextInputSizeTypes],
              variantClasses[variant],
              errorClasses,
              disabledClasses,
              "pr-10",
              className,
            )}
            type={isPassword && !passwordVisible ? "password" : type || 'text'}
            placeholder={isPassword ? "비밀번호" : placeholder}
            {...restProps}
          />
          { isPassword && (
            passwordVisible ? (
              <LucideEye className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                         onClick={()=>setPasswordVisible(false)}/>
            ) : (
              <LucideEyeOff className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5"
                            onClick={()=>setPasswordVisible(true)}/>
            )

          )}
        </div>

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