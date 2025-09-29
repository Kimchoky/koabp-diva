import React, { useState, useEffect, useRef } from 'react';
import { Settings, Eye, Trash2 } from 'lucide-react';
import { VStack } from './ui/Stack';
import Button from './ui/Button';
import Link from "next/link";

/**
 * 설정 메뉴 컴포넌트
 * API 키 확인 및 삭제 기능 제공
 */
export default function SettingsMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 감지하여 메뉴 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // 메뉴 토글
  const handleToggleMenu = async () => {
    if (!isOpen) {
      // await fetchApiKey();
    }
    setIsOpen(!isOpen);
  };


  return (
    <div ref={menuRef}>
      {/* 설정 아이콘 버튼 */}
      <button
        onClick={handleToggleMenu}
        className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        aria-label="Settings"
      >
        <Settings size={28} className="text-gray-700 dark:text-gray-300" />
      </button>

      {/* 드롭다운 메뉴 */}
      {isOpen && (
        <div className="absolute top-12 right-0 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <VStack gap={0}>
            {/* 헤더 */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                앱 설정
              </h3>
            </div>

            {/* API 키 표시 영역 */}
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              </p>
            </div>

            {/* 버튼 영역 */}
            <div className="p-2">
              <VStack gap={2}>

              </VStack>
            </div>

            {/* 안내 문구 */}
            <div className="px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 border-t border-yellow-200 dark:border-yellow-800">
              <p className="text-xs text-yellow-800 dark:text-yellow-200">
                ⚠️ API 키를 삭제하면 앱이 재시작됩니다.
              </p>
            </div>
          </VStack>
        </div>
      )}
    </div>
  );
}