import React, { createContext, useContext, ReactNode } from 'react';

interface RoundedRadioContextType {
  value: string | number | boolean | null;
  onChange: (value: string | number | boolean) => void;
  name: string;
}

const RoundedRadioContext = createContext<RoundedRadioContextType | undefined>(undefined);

interface RoundedRadioGroupProps {
  value: string | number | boolean | null;
  onChange: (value: string | number | boolean) => void;
  name: string;
  children: ReactNode;
  className?: string;
}

interface RoundedRadioItemProps {
  value: string | number | boolean;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
}

const RoundedRadioGroup = ({
  value,
  onChange,
  name,
  children,
  className = ""
}: RoundedRadioGroupProps) => {
  return (
    <RoundedRadioContext.Provider value={{ value, onChange, name }}>
      <div className={`flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden ${className}`}>
        {children}
      </div>
    </RoundedRadioContext.Provider>
  );
};

const RoundedRadioItem = ({
  value,
  children,
  disabled = false,
  className = ""
}: RoundedRadioItemProps) => {
  const context = useContext(RoundedRadioContext);

  if (!context) {
    throw new Error('RoundedRadioItem must be used within RoundedRadioGroup');
  }

  const { value: selectedValue, onChange, name } = context;
  const isSelected = selectedValue === value;

  const handleClick = () => {
    if (!disabled) {
      onChange(value);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={disabled}
        className={`px-4 py-1 transition-colors disabled:bg-gray-500/25 disabled:cursor-not-allowed flex-1 ${
          isSelected
            ? 'bg-primary text-white'
            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
        } ${className}`}
      >
        <input
          type="radio"
          name={name}
          value={value?.toString()}
          checked={isSelected}
          onChange={() => handleClick()}
          disabled={disabled}
          className="sr-only"
        />
        {children}
      </button>
      <div className="w-px bg-gray-300 dark:bg-gray-600 last:hidden"></div>
    </>
  );
};

// Compound component pattern
const RoundedRadio = Object.assign(RoundedRadioGroup, {
  Group: RoundedRadioGroup,
  Item: RoundedRadioItem,
});

export default RoundedRadio;