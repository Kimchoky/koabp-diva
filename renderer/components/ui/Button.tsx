import { ButtonHTMLAttributes } from "react";
import { cn } from "../utils/cn"; // 클래스 조합 유틸리티

type ButtonAppearanceTypes = 'contained' | 'outlined'
type ButtonModeTypes = 'primary' | 'success' | 'warning' | 'error'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode | string;
  appearance?: ButtonAppearanceTypes;
  mode?: ButtonModeTypes;
}

export default function Button({
  children,
  appearance = 'contained',
  mode = 'primary',
  className,
  ...props
}: ButtonProps) {

  // 동적 클래스 생성
  const baseClasses = "px-4 py-2 rounded font-medium transition-all duration-200"

  const modeClasses = appearance === 'contained'
    ? `bg-${mode} text-white hover:bg-${mode}/90`
    : `border border-${mode} text-${mode} bg-transparent hover:bg-${mode}/10`

  return (
    <button
      className={cn(baseClasses, modeClasses, className)}
      {...props}
    >
      {children}
    </button>
  )
}