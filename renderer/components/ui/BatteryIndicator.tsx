import React from 'react';

interface BatteryIndicatorProps {
  /** 배터리 잔량 (0-100) */
  level: number | null | undefined;
}

/**
 * 배터리 잔량에 따라 4단계의 색상으로 상태를 표시하는 아이콘 컴포넌트
 */
export default function BatteryIndicator({ level }: BatteryIndicatorProps) {

  // 배터리 잔량(level) 값에 따라 색상과 스크린리더를 위한 레이블을 반환하는 함수
  const getBatteryState = (lvl: number) => {
    if (lvl <= 10) {
      return { colorClass: 'text-red-500', label: 'Battery critical' };
    }
    if (lvl <= 30) {
      return { colorClass: 'text-orange-500', label: 'Battery low' };
    }
    if (lvl < 80) {
      return { colorClass: 'text-yellow-500', label: 'Battery medium' };
    }
    return { colorClass: 'text-green-500', label: 'Battery good' };
  };

  // level 값이 유효하지 않을 경우 (null, undefined) 플레이스홀더를 표시
  if (level === null || typeof level === 'undefined') {
    return (
      <div className="inline items-center space-x-2 text-gray-400">
        <span>아이콘</span>
        <span>--%</span>
      </div>
    );
  }

  const { colorClass, label } = getBatteryState(level);

  return (
    <div className="flex items-center space-x-2">
      {/* 아이콘 플레이스홀더 */}
      <span className={colorClass} aria-label={label}>
        아이콘
      </span>
      {/* 배터리 잔량 텍스트 */}
      <span>{Math.round(level)}%</span>
    </div>
  );
}
