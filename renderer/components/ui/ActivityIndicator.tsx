import {useEffect, useState} from "react";

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

const LegacySpinner = ({ width = ActivityIndicator.defaultSize.width, height = ActivityIndicator.defaultSize.height, className }) => {
  const strokeWidth = 8;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;

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
          <stop offset="0%" stopColor="rgb(0, 155, 176)" stopOpacity="1" />
          <stop offset="25%" stopColor="rgb(0, 155, 176)" stopOpacity="0.8" />
          <stop offset="50%" stopColor="rgb(0, 155, 176)" stopOpacity="0.4" />
          <stop offset="75%" stopColor="rgb(0, 155, 176)" stopOpacity="0.2" />
          <stop offset="100%" stopColor="rgb(0, 155, 176)" stopOpacity="0" />
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


const ActivityIndicator = {
  defaultSize: { width: '2em', height: '2em' },
  Squares,
  LegacySpinner,
}

export default ActivityIndicator;