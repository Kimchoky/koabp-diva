import {useEffect, useRef, useState} from "react";

interface IndicatorProps {
  width?: number | string;
  height?: number | string;
  className?: string;
}

const Squares = ({ width = ActivityIndicator.defaultSize.width, height =ActivityIndicator.defaultSize.height}) => {

  const fill = `rgb(0, 155, 176)`
  const fillPoint = `rgb(255, 153, 51)`

  const positions = [
    {x: -3, y: -3}, // top-left
    {x: 34, y: -3}, // top
    {x: 71, y: -3}, // top-right
    {x: 71, y: 34}, // right
    {x: 71, y: 71}, // bottom-right
    {x: 34, y: 71}, // bottom
    {x: -3, y: 71}, // bottom-left
    {x: -3, y: 34}, // left
  ]

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % positions.length);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" width={width} height={height}>
      <g data-idx="1">
        {positions.map((position, i) => (
          <rect
            key={i}
            fill={i === currentIndex ? fillPoint : fill}
            height="32"
            width="32"
            x={position.x}
            y={position.y}
          />
        ))}
      </g>
    </svg>
  )

}

const colorMap = {
  primary: 'rgb(1, 183, 207)',
  success: 'rgb(16, 185, 129)',
  warning: 'rgb(245, 158, 11)',
  error: 'rgb(239, 68, 68)',
};

type ColorChoice = keyof typeof colorMap | 'inherit';

interface LegacySpinnerProps {
  width?: number | string;
  height?: number | string;
  className?: string;
  color?: ColorChoice;
}

const LegacySpinner = ({
  width = ActivityIndicator.defaultSize.width,
  height = ActivityIndicator.defaultSize.height,
  className,
  color = 'primary'
}: LegacySpinnerProps) => {
  const strokeWidth = 8;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const selectedColor = color === 'inherit' ? 'currentColor' : colorMap[color as keyof typeof colorMap];

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid"
      width={width}
      height={height}
      className={className}
    >
      <defs>
        <linearGradient id="spinner-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={selectedColor} stopOpacity="1" />
          <stop offset="25%" stopColor={selectedColor} stopOpacity="0.8" />
          <stop offset="50%" stopColor={selectedColor} stopOpacity="0.4" />
          <stop offset="75%" stopColor={selectedColor} stopOpacity="0.2" />
          <stop offset="100%" stopColor={selectedColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke="url(#spinner-gradient)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
        style={{
          transformOrigin: '50% 50%',
          animation: 'spin 1s linear infinite'
        }}
      />
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </svg>
  );
}

type ColorPalette = 'cyan' | 'red' | 'orange' | 'yellow' | 'purple' | 'green';

interface TextGradientProps {
  children: string;
  delay?: number;
  className?: string;
  speed?: number;
  palette?: ColorPalette;
}

const TextGradient = ({
  children,
  delay = 300,
  className,
  speed = 1,
  palette = 'cyan'
}: TextGradientProps) => {
  if (typeof children !== 'string') {
    throw new Error('children must be a string');
  }

  const items: string[] = children.split('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 다크모드 감지 (CSS 클래스 기반)
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    checkDarkMode();

    // MutationObserver로 dark 클래스 변화 감지
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  const colorPalettes = {
    cyan: {
      light: [
        '#374151',  // 어두운 회색 (진한 색상)
        '#0f766e',  // 진한 청록
        '#0891b2',  // 중간 청록
        '#06b6d4',  // 밝은 청록
        '#94a3b8',  // 연한 회색 (기본색)
      ],
      dark: [
        '#e2e8f0',  // 밝은 회색 (진한 색상)
        '#22d3ee',  // 밝은 청록
        '#0891b2',  // 중간 청록
        '#0f766e',  // 진한 청록
        '#64748b',  // 중간 회색 (기본색)
      ]
    },
    red: {
      light: [
        '#374151',  // 어두운 회색
        '#991b1b',  // 진한 빨강
        '#dc2626',  // 중간 빨강
        '#ef4444',  // 밝은 빨강
        '#94a3b8',  // 연한 회색
      ],
      dark: [
        '#e2e8f0',  // 밝은 회색
        '#f87171',  // 밝은 빨강
        '#ef4444',  // 중간 빨강
        '#dc2626',  // 진한 빨강
        '#64748b',  // 중간 회색
      ]
    },
    orange: {
      light: [
        '#374151',  // 어두운 회색
        '#c2410c',  // 진한 주황
        '#ea580c',  // 중간 주황
        '#f97316',  // 밝은 주황
        '#94a3b8',  // 연한 회색
      ],
      dark: [
        '#e2e8f0',  // 밝은 회색
        '#fb923c',  // 밝은 주황
        '#f97316',  // 중간 주황
        '#ea580c',  // 진한 주황
        '#64748b',  // 중간 회색
      ]
    },
    yellow: {
      light: [
        '#374151',  // 어두운 회색
        '#a16207',  // 진한 노랑
        '#ca8a04',  // 중간 노랑
        '#eab308',  // 밝은 노랑
        '#94a3b8',  // 연한 회색
      ],
      dark: [
        '#e2e8f0',  // 밝은 회색
        '#facc15',  // 밝은 노랑
        '#eab308',  // 중간 노랑
        '#ca8a04',  // 진한 노랑
        '#64748b',  // 중간 회색
      ]
    },
    purple: {
      light: [
        '#374151',  // 어두운 회색
        '#7c2d12',  // 진한 보라
        '#9333ea',  // 중간 보라
        '#a855f7',  // 밝은 보라
        '#94a3b8',  // 연한 회색
      ],
      dark: [
        '#e2e8f0',  // 밝은 회색
        '#c084fc',  // 밝은 보라
        '#a855f7',  // 중간 보라
        '#9333ea',  // 진한 보라
        '#64748b',  // 중간 회색
      ]
    },
    green: {
      light: [
        '#374151',  // 어두운 회색
        '#166534',  // 진한 초록
        '#16a34a',  // 중간 초록
        '#22c55e',  // 밝은 초록
        '#94a3b8',  // 연한 회색
      ],
      dark: [
        '#e2e8f0',  // 밝은 회색
        '#4ade80',  // 밝은 초록
        '#22c55e',  // 중간 초록
        '#16a34a',  // 진한 초록
        '#64748b',  // 중간 회색
      ]
    }
  };

  const colorTable = colorPalettes[palette][isDark ? 'dark' : 'light'];

  useEffect(() => {
    if (items.length === 0) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % (items.length + colorTable.length));
    }, delay / speed);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [items.length, delay, speed]);

  const getCharColor = (charIndex: number): string => {
    // 현재 인덱스를 기준으로 각 글자의 색상 결정
    const distance = Math.abs(currentIndex - charIndex);
    const colorIndex = Math.min(distance, colorTable.length - 1);

    // 흐르는 효과를 위해 currentIndex 근처의 글자들에 그라데이션 적용
    if (distance < colorTable.length) {
      return colorTable[colorIndex];
    }

    return colorTable[colorTable.length - 1]; // 기본색 (가장 연한색)
  };

  return (
    <div className={`inline ${className || ''}`}>
      {items.map((char, index) => (
        <span
          key={index}
          style={{
            color: getCharColor(index),
            transition: `color ${delay}ms ease-in-out`
          }}
        >
          {char}
        </span>
      ))}
    </div>
  )
}


const ActivityIndicator = {
  defaultSize: { width: '2em', height: '2em' },
  Squares,
  LegacySpinner,
  TextGradient,
}

export default ActivityIndicator;