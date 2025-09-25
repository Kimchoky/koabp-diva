import React, { createContext, useContext, ReactNode } from 'react';

interface RadioContextType {
  value: string | number;
  onChange: (value: string | number) => void;
  name: string;
}

const RadioContext = createContext<RadioContextType | undefined>(undefined);

interface RadioGroupProps {
  value: string | number;
  onChange: (value: string | number) => void;
  name: string;
  children: ReactNode;
  className?: string;
  vertical?: boolean;
  gap?: number;
}

interface RadioItemProps {
  value: string | number;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
  outlined?: boolean;
}

const RadioGroup = ({ value, onChange, name, children, className = "", vertical = false, gap = 2 }: RadioGroupProps) => {
  return (
    <RadioContext.Provider value={{ value, onChange, name }}>
      <div className={`flex ${vertical ? 'flex-col' : 'flex-row'} gap-${gap} ${className}`}>
        {children}
      </div>
    </RadioContext.Provider>
  );
};

const RadioItem = ({ value, children, disabled = false, outlined = false, className = "" }: RadioItemProps) => {
  const context = useContext(RadioContext);

  if (!context) {
    throw new Error('RadioItem must be used within RadioGroup');
  }

  const { value: selectedValue, onChange, name } = context;
  const isSelected = selectedValue === value;

  const handleClick = () => {
    if (!disabled) {
      onChange(value);
    }
  };

  return (
    <label
      className={`
        inline-flex items-center gap-2 cursor-pointer
        py-2 transition-all duration-200 ${outlined ? 'rounded outline outline-gray-600 px-2' : ''}
        ${isSelected
          ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-300'
          : 'border-[--color-border-light] dark:border-[--color-border-dark] hover:border-blue-300 dark:hover:border-blue-600'
        }
        ${disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
        }
        ${className}
      `}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={isSelected}
        onChange={() => handleClick()}
        disabled={disabled}
        className="sr-only"
      />
      <div
        className={`
          w-4 h-4 rounded-full border-2 flex items-center justify-center
          transition-all duration-200
          ${isSelected
            ? 'border-blue-500 bg-blue-500'
            : 'border-gray-300 dark:border-gray-600'
          }
        `}
      >
        {isSelected && (
          <div className="w-2 h-2 bg-white rounded-full"></div>
        )}
      </div>
      <span className="text-sm font-medium select-none">
        {children}
      </span>
    </label>
  );
};

// Compound component pattern
const Radio = Object.assign(RadioGroup, {
  Group: RadioGroup,
  Item: RadioItem,
});

export default Radio;