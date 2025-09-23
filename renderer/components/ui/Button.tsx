import { ButtonHTMLAttributes } from "react";
import { cn } from "../utils/cn"; // 클래스 조합 유틸리티
import * as LucideIcons from "lucide-react";
import ActivityIndicator from "./ActivityIndicator";

type ButtonAppearanceTypes = 'contained' | 'outlined'
type ButtonModeTypes = 'primary' | 'success' | 'warning' | 'error'
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
  mode = 'primary',
  size = 'md',
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
      primary: 'bg-primary text-white hover:bg-primary/90',
      success: 'bg-success text-white hover:bg-success/90',
      warning: 'bg-warning text-white hover:bg-warning/90',
      error: 'bg-error text-white hover:bg-error/90'
    },
    outlined: {
      primary: 'border border-primary text-primary bg-transparent hover:bg-primary/10',
      success: 'border border-success text-success bg-transparent hover:bg-success/10',
      warning: 'border border-warning text-warning bg-transparent hover:bg-warning/10',
      error: 'border border-error text-error bg-transparent hover:bg-error/10'
    }
  }

  const selectedModeClass = modeClasses[appearance][mode]

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
        <ActivityIndicator.LegacySpinner width={'1em'} height={'1em'} className={children ? 'mr-2' : ''} />
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
      className={cn(baseClasses, sizeClasses[size], selectedModeClass, "flex items-center justify-center", className)}
      {...props}
    >
      {renderIcon()}
      {children}
    </button>
  )
}