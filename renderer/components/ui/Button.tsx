import { cn } from "../utils/cn"; // 클래스 조합 유틸리티
import * as LucideIcons from "lucide-react";
import ActivityIndicator from "./ActivityIndicator";

type ButtonAppearanceTypes = 'contained' | 'outlined'
type ButtonModeTypes = 'primary' | 'success' | 'warning' | 'error' | 'info' | 'default'
type ButtonSizeTypes = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode | string;
  appearance?: ButtonAppearanceTypes;
  mode?: ButtonModeTypes;
  size?: ButtonSizeTypes;
  icon?: keyof typeof LucideIcons;
  loading?: boolean;
}

export default function Button({
  children,
  appearance = 'contained',
  mode = 'default',
  size = 'sm',
  icon,
  loading = false,
  className,
  ...props
}: ButtonProps) {

  // 사이즈별 클래스 정의
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',     // 0.75em
    sm: 'px-3 py-1.5 text-sm',   // 0.875em
    md: 'px-4 py-2 text-base',   // 1em
    lg: 'px-6 py-3 text-lg',     // 1.125em
    xl: 'px-8 py-4 text-xl'      // 1.25em
  }

  // 동적 클래스 생성
  const baseClasses = "rounded font-medium transition-all duration-200"

  const modeClasses = {
    contained: {
      primary: 'bg-primary hover:bg-primary/75',
      success: 'bg-success  hover:bg-success/75',
      warning: 'bg-warning hover:bg-warning/75',
      error: 'bg-error hover:bg-error/75',
      info: 'bg-info text-base hover:bg-info/75',
      default: 'text-slate-300 bg-slate-800 hover:bg-slate-700 dark:text-slate-900 dark:bg-slate-200 dark:hover:bg-slate-400',
    },
    outlined: {
      primary: 'border border-primary text-primary bg-transparent hover:bg-primary/25',
      success: 'border border-success text-success bg-transparent hover:bg-success/25',
      warning: 'border border-warning text-warning bg-transparent hover:bg-warning/25',
      error: 'border border-error text-error bg-transparent hover:bg-error/25',
      info: 'border border-info text-info bg-transparent hover:bg-info/25',
      default: 'border bg-transparent border-gray-700 hover:bg-slate-100 dark:border-gray-200 dark:hover:bg-gray-200/25',
    }
  }

  const disabledClasses = {
    contained: "disabled:bg-slate-300 disabled:text-slate-400 disabled:border-slate-300 dark:disabled:bg-slate-700 dark:disabled:text-slate-500 dark:disabled:border-slate-200 disabled:cursor-not-allowed",
    outlined: "disabled:border-gray-400 disabled:text-slate-400 dark:disabled:border-gray-600 dark:disabled:text-slate-600 disabled:bg-transparent disabled:cursor-not-allowed"
  }

  const selectedModeClass = modeClasses[appearance][mode]
  const selectedDisabledClass = disabledClasses[appearance]


  // 아이콘 크기 정의
  const iconSizes = {
    xs: 14,
    sm: 16,
    md: 18,
    lg: 20,
    xl: 22
  }

  // 아이콘 컴포넌트 렌더링
  const renderIcon = () => {

    if (loading) {
      return (
        <ActivityIndicator.LegacySpinner
          width={'1em'}
          height={'1em'}
          className={children ? 'mr-2' : ''}
          color="inherit"
        />
      )
    }

    if (!icon) return null

    const IconComponent = LucideIcons[icon] as React.ComponentType<any>
    if (!IconComponent) return null

    return (
      <IconComponent
        size={iconSizes[size]}
        className={children ? "mr-2" : ""}
      />
    )
  }

  return (
    <button
      className={cn(baseClasses, sizeClasses[size], selectedModeClass, selectedDisabledClass, "flex items-center justify-center", className)}
      {...props}
    >
      {renderIcon()}
      {children}
    </button>
  )
}