import { cn } from "../utils/cn";
import { Check } from "lucide-react";

interface CheckBoxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function CheckBox({
  label,
  size = 'md',
  className,
  disabled,
  checked,
  ...props
}: CheckBoxProps) {

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const iconSizes = {
    sm: 12,
    md: 16,
    lg: 20
  };

  const labelSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <label className={cn(
      "inline-flex items-center cursor-pointer",
      disabled && "cursor-not-allowed opacity-50",
      className
    )}>
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          disabled={disabled}
          checked={checked}
          {...props}
        />
        <div className={cn(
          sizeClasses[size],
          "rounded border-2 transition-all duration-200 flex items-center justify-center",
          checked
            ? "bg-primary border-primary"
            : "border-gray-400 dark:border-gray-500 bg-transparent",
          !disabled && "hover:border-primary/75",
          disabled && "cursor-not-allowed"
        )}>
          {checked && (
            <Check
              size={iconSizes[size]}
              className="text-white"
              strokeWidth={3}
            />
          )}
        </div>
      </div>
      {label && (
        <span className={cn(
          "ml-2",
          labelSizeClasses[size],
          "select-none"
        )}>
          {label}
        </span>
      )}
    </label>
  );
}