import React from 'react';
import { cn } from '../utils/cn';

// Prop 값과 Tailwind 클래스를 매핑
const justifyContentMap = {
  'flex-start': 'justify-start',
  'flex-end': 'justify-end',
  center: 'justify-center',
  'space-between': 'justify-between',
  'space-around': 'justify-around',
  'space-evenly': 'justify-evenly',
};

const alignItemsMap = {
  'flex-start': 'items-start',
  'flex-end': 'items-end',
  center: 'items-center',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
};

const appearanceMap = {
  default: '',
  surface: 'stack-surface rounded-lg shadow-sm p-4',
  outlined: 'stack-outlined rounded-lg p-4',
};

// 내부적으로 사용될 기본 Stack 컴포넌트의 Props
interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  direction: 'row' | 'column';
  justifyContent?: keyof typeof justifyContentMap;
  alignItems?: keyof typeof alignItemsMap;
  appearance?: keyof typeof appearanceMap;
  gap?: number; // gap 프로퍼티 추가
  children?: React.ReactNode;
  className?: string;
}

/**
 * 모든 스택의 기반이 되는 내부 컴포넌트
 */
const Stack: React.FC<StackProps> = ({
  direction,
  justifyContent = 'flex-start',
  alignItems = 'stretch',
  appearance = 'default',
  gap,
  children,
  className,
  ...props
}) => {
  const directionClass = direction === 'row' ? 'flex-row' : 'flex-col';

  const classes = cn(
    'flex',
    directionClass,
    justifyContentMap[justifyContent],
    alignItemsMap[alignItems],
    appearanceMap[appearance],
    className
  );

  // gap 스타일을 인라인 스타일로 적용
  const style = gap ? { gap: `${gap}px`, ...props.style } : props.style;

  return (
    <div className={classes} {...props} style={style}>
      {children}
    </div>
  );
};

// 외부에 노출될 VStack, HStack을 위한 Props. direction은 제외.
interface StackLayoutProps extends Omit<StackProps, 'direction'> {}

/**
 * 수직 정렬을 위한 컨테이너 컴포넌트 (flex-direction: column)
 */
export const VStack: React.FC<StackLayoutProps> = (props) => {
  return <Stack direction="column" {...props} />;
};

/**
 * 수평 정렬을 위한 컨테이너 컴포넌트 (flex-direction: row)
 */
export const HStack: React.FC<StackLayoutProps> = (props) => {
  return <Stack direction="row" {...props} />;
};
