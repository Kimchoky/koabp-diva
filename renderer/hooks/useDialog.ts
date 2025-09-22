import { useState, useCallback } from 'react'

export interface DialogOptions {
  title?: string
  message?: string
  icon?: React.ReactNode
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void | Promise<void>
  onCancel?: () => void
  type?: 'info' | 'warning' | 'error' | 'success'
  showCancel?: boolean
}

export interface DialogState {
  isOpen: boolean
  options: DialogOptions
}

export function useDialog() {
  const [dialogState, setDialogState] = useState<DialogState>({
    isOpen: false,
    options: {}
  })

  const showDialog = useCallback((options: DialogOptions) => {
    setDialogState({
      isOpen: true,
      options: {
        confirmText: '확인',
        cancelText: '취소',
        showCancel: true,
        type: 'info',
        ...options
      }
    })
  }, [])

  const hideDialog = useCallback(() => {
    setDialogState(prev => ({
      ...prev,
      isOpen: false
    }))
  }, [])

  const handleConfirm = useCallback(async () => {
    if (dialogState.options.onConfirm) {
      await dialogState.options.onConfirm()
    }
    hideDialog()
  }, [dialogState.options, hideDialog])

  const handleCancel = useCallback(() => {
    if (dialogState.options.onCancel) {
      dialogState.options.onCancel()
    }
    hideDialog()
  }, [dialogState.options, hideDialog])

  // 편의 메소드들
  const showAlert = useCallback((title: string, message: string, onConfirm?: () => void) => {
    showDialog({
      title,
      message,
      onConfirm,
      showCancel: false,
      type: 'info'
    })
  }, [showDialog])

  const showConfirm = useCallback((title: string, message: string, onConfirm?: () => void, onCancel?: () => void) => {
    showDialog({
      title,
      message,
      onConfirm,
      onCancel,
      showCancel: true,
      type: 'warning'
    })
  }, [showDialog])

  const showError = useCallback((title: string, message: string, onConfirm?: () => void) => {
    showDialog({
      title,
      message,
      onConfirm,
      showCancel: false,
      type: 'error'
    })
  }, [showDialog])

  const showSuccess = useCallback((title: string, message: string, onConfirm?: () => void) => {
    showDialog({
      title,
      message,
      onConfirm,
      showCancel: false,
      type: 'success'
    })
  }, [showDialog])

  return {
    isOpen: dialogState.isOpen,
    options: dialogState.options,
    showDialog,
    hideDialog,
    handleConfirm,
    handleCancel,
    // 편의 메소드들
    showAlert,
    showConfirm,
    showError,
    showSuccess
  }
}