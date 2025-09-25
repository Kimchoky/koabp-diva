import React, {useCallback} from 'react';
import {HStack} from "./Stack";
import {LucideBattery, LucideBatteryFull, LucideBatteryLow, LucideBatteryMedium} from "lucide-react";

interface BatteryIndicatorProps {
  /** 배터리 잔량 (0-100) */
  level: number | null | undefined;
}

/**
 * 배터리 잔량에 따라 4단계의 색상으로 상태를 표시하는 아이콘 컴포넌트
 */
export default function BatteryIndicator({ level }: BatteryIndicatorProps) {

  // 배터리 잔량(level) 값에 따라 색상과 스크린리더를 위한 레이블을 반환하는 함수
  const getBatteryState = useCallback((lvl: number) => {

    if (lvl === null || typeof level === 'undefined') {
      return { icon: <></>, colorClass: '', label: 'Battery unknown' };
    }

    if (lvl <= 10) {
      return { icon: <LucideBattery />, colorClass: 'text-red-500', label: 'Battery critical' };
    }
    if (lvl <= 30) {
      return { icon: <LucideBatteryLow />, colorClass: 'text-orange-500', label: 'Battery low' };
    }
    if (lvl < 80) {
      return { icon: <LucideBatteryMedium />, colorClass: 'text-yellow-500', label: 'Battery medium' };
    }
    return { icon: <LucideBatteryFull /> , colorClass: 'text-green-500', label: 'Battery good' };
  }, [level]);

  const { icon, colorClass, label } = getBatteryState(level);

  return (
    <HStack className={`flex items-center space-x- ${colorClass}`} gap={1}>
      {/* 아이콘 플레이스홀더 */}
      <span aria-label={label}>
        {icon}
      </span>
      {/* 배터리 잔량 텍스트 */}
      <span>{level >= 0 ? Math.round(level) : '--'}%</span>
    </HStack>
  );
}
