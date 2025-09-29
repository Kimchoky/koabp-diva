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

export interface ModalComponentProps {
  onClose: () => void
  onConfirm?: (data?: any) => void
  onCancel?: () => void
}

export interface CustomModalRef {
  open: () => void
  close: () => void
  isOpen: boolean
}

interface CustomModalProps {
  component: React.ComponentType<ModalComponentProps>
}

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

export const CustomModal = forwardRef<CustomModalRef, CustomModalProps>(
  ({ component: Component }, ref) => {
    const [isOpen, setIsOpen] = useState(false)

    useImperativeHandle(ref, () => ({
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      isOpen
    }))

    const handleClose = () => {
      setIsOpen(false)
    }

    const handleConfirm = (data?: any) => {
      setIsOpen(false)
    }

    const handleCancel = () => {
      setIsOpen(false)
    }

    if (!isOpen) return null

    return (
      <div className="fixed inset-0 z-50 backdrop-blur-sm flex justify-center items-center">
        <div onClick={(e) => e.stopPropagation()}>
          <Component
            onClose={handleClose}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
          />
        </div>
      </div>
    )
  }
)

CustomModal.displayName = 'CustomModal'