import {useEffect, useState} from "react";
import ActivityIndicator from "./ui/ActivityIndicator";
import Button from "./ui/Button";
import {X} from "lucide-react";

/**
 * 주어진 시간(초) 동안 카운트다운을 표시하는 컴포넌트.
 * 타이머가 0에 도달하면 `close` 콜백을 호출함.
 * @param duration 카운트다운 시간 (초 단위)
 * @param close 타이머 종료 시 실행할 콜백 함수
 * @param text 표시할 텍스트
 * @param totalSteps 전체 단계 수 (선택사항)
 * @param currStep 현재 단계 (1부터 시작, 선택사항)
 * @param width 컴포넌트의 너비 (선택사항, 기본값: 400px)
 */
export default function AwaitIndicator({
  duration,
  close,
  text,
  totalSteps,
  currStep,
  width = 400
}: {
  text: string,
  duration: number,
  close?: () => void,
  totalSteps?: number,
  currStep?: number,
  width?: number
}) {

  const [timeLeft, setTimeLeft] = useState(duration > 1 ? duration : 999999);

  // 카운트다운 로직을 처리하는 Effect
  useEffect(() => {
    // duration이 0 이하이면 타이머를 시작하지 않음.
    if (duration <= 0) {
      // timeLeft가 0이하일 때 close를 호출하는 로직은 다른 effect에서 처리함.
      return;
    }

    // 1초마다 시간을 1씩 감소시키는 인터벌 설정
    const timerId = window.setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);

    // 컴포넌트 언마운트 시 인터벌 정리
    return () => window.clearInterval(timerId);

  }, [duration]); // duration이 변경될 때만 effect를 재실행

  // timeLeft 값 변경에 따른 부수 효과(side effect)를 처리하는 Effect
  useEffect(() => {
    // timeLeft가 0 이하가 되면 close 콜백을 호출함.
    if (timeLeft <= 0) {
      close?.();
    }
  }, [timeLeft, close]); // timeLeft 또는 close 함수가 변경될 때만 effect를 재실행

  // 프로그레스바 진행 상태를 렌더링하는 컴포넌트
  const StepProgress = () => {
    if (!totalSteps || totalSteps <= 1) return null;

    const currentStep = Math.max(0, Math.min(currStep || 0, totalSteps));
    const progressPercentage = (currentStep / totalSteps) * 100;

    return (
      <div className="px-8 pb-6">
        <div className="w-full bg-white/50 dark:bg-white/20 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 ease-in-out shadow-sm shadow-primary/20"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        {/*<div className="flex justify-between text-xs text-white/70 mt-2">*/}
        {/*  <span>{currentStep} / {totalSteps}</span>*/}
        {/*  <span>{Math.round(progressPercentage)}%</span>*/}
        {/*</div>*/}
      </div>
    );
  };

  return (
    <div
      className={`flex flex-col gap-4 rounded-lg border border-primary shadow-xl bg-gray-300 dark:bg-gray-700`}
      style={{ width: `${width}px` }}
    >
      <h2 className={"p-8 pb-4"}>
        <div className="break-words leading-relaxed text-gray-200">
          <ActivityIndicator.TextGradient>
            {text}
          </ActivityIndicator.TextGradient>
        </div>
      </h2>

      {/* 스텝 진행 상태 표시 */}
      <StepProgress />
    </div>
  )
}