import React, { forwardRef, useImperativeHandle, useState } from 'react'
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react'
import { DialogOptions } from '../../contexts/DialogContext'

interface DialogProps {
  isOpen: boolean
  options: DialogOptions
  onConfirm: () => void
  onCancel: () => void
  onClose: () => void
}

/**
 * @description
 * 화면 전체를 덮는 블러 처리된 배경 위에 커스텀 컴포넌트를 렌더링하기 위한 래퍼 컴포넌트.
 * DialogContext와 함께 사용하도록 설계됨.
 * `useDialog` 훅의 `showComponent` 함수에 렌더링할 컴포넌트를 넘겨주어 사용함.
 *
 * @example
 * const { showComponent } = useDialog();
 * showComponent(<MyCustomComponent />);
 *
 * // MyCustomComponent.tsx
 * const MyCustomComponent = () => {
 *   const { hideComponent } = useDialog();
 *   return (
 *     <div className="bg-white p-4 rounded">
 *       <p>This is a custom component.</p>
 *       <button onClick={hideComponent}>Close</button>
 *     </div>
 *   )
 * }
 */

const getTypeStyles = (type: string) => {
  switch (type) {
    case 'success':
      return {
        borderColor: 'border-green-500',
        bgColor: 'bg-gray-700',
        iconColor: 'text-green-400',
        icon: CheckCircle
      }
    case 'error':
      return {
        borderColor: 'border-red-500',
        bgColor: 'bg-gray-700',
        iconColor: 'text-red-400',
        icon: AlertCircle
      }
    case 'warning':
      return {
        borderColor: 'border-amber-500',
        bgColor: 'bg-gray-700',
        iconColor: 'text-orange-400',
        icon: AlertTriangle
      }
    default: // info
      return {
        borderColor: 'border-blue-500',
        bgColor: 'bg-gray-700',
        iconColor: 'text-blue-400',
        icon: Info
      }
  }
}

export default function Dialog({ isOpen, options, onConfirm, onCancel, onClose }: DialogProps) {
  if (!isOpen) return null

  const typeStyles = getTypeStyles(options.type || 'info')
  const IconComponent = typeStyles.icon

  return (
    <div className="fixed inset-0 z-50 backdrop-blur-sm flex justify-center items-center">
      <div className="relative max-w-md w-full mx-4">
        <div className={`flex flex-col gap-4 rounded-lg ${typeStyles.bgColor} border ${typeStyles.borderColor} p-6 shadow-xl`}>
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
            aria-label="닫기"
          >
            <X size={20} />
          </button>

          {/* Title with icon */}
          {options.title && (
            <div className="text-white flex items-center gap-2">
              {options.icon ? (
                options.icon
              ) : (
                <IconComponent className={`inline ${typeStyles.iconColor}`} size={20} />
              )}
              <span className="font-medium">{options.title}</span>
            </div>
          )}

          {/* Message */}
          {options.message && (
            <div>
              {options.message.split('\n').map((line, i) => (
                <p key={i} className="text-gray-200 text-sm leading-relaxed ">{line}</p>
              ))}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 justify-end mt-2">
            {options.showCancel && (
              <button
                onClick={onCancel}
                className="px-4 py-2 text-sm rounded bg-gray-600 text-gray-200 hover:bg-gray-500 transition-colors"
              >
                {options.cancelText || '취소'}
              </button>
            )}
            <button
              onClick={onConfirm}
              className={`px-4 py-2 text-sm rounded text-white transition-colors ${
                options.type === 'error'
                  ? 'bg-red-600 hover:bg-red-500'
                  : options.type === 'success'
                  ? 'bg-green-600 hover:bg-green-500'
                  : options.type === 'warning'
                  ? 'bg-amber-600 hover:bg-amber-500'
                  : 'bg-blue-600 hover:bg-blue-500'
              }`}
            >
              {options.confirmText || '확인'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export const CustomModal = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      className="fixed inset-0 z-50 backdrop-blur-sm flex justify-center items-center"
      // 배경 클릭 시 닫히는 기능을 넣고 싶다면 여기에 onClick 핸들러 추가 가능
    >
      {/* 컨텐츠 영역 클릭 시 이벤트 전파를 막아 모달이 닫히지 않게 함 */}
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  )
}