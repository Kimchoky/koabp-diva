import React, {createContext, ReactNode, useCallback, useContext, useState} from 'react'
import Dialog, {CustomModal} from '../components/ui/BlurNotice'

// TODO: light mode theming

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


// --- DialogContext.tsx ---

interface DialogContextType {
  showDialog: (options: DialogOptions) => void
  hideDialog: () => void
  handleConfirm:() => void
  handleCancel:() => void
  showAlert: (title: string, message: string, onConfirm?: () => void) => void
  showConfirm: (title: string, message: string, onConfirm?: () => void, onCancel?: () => void) => void
  showError: (title: string, message: string, onConfirm?: () => void) => void
  showSuccess: (title: string, message: string, onConfirm?: () => void) => void
  showComponent: (component: ReactNode) => void
  hideComponent: () => void
}

const DialogContext = createContext<DialogContextType | undefined>(undefined)

export function DialogProvider({ children }: { children: ReactNode }) {

  const [dialogState, setDialogState] = useState<DialogState>({
    isOpen: false,
    options: {}
  })
  const [componentState, setComponentState] = useState(false);
  const [componentNode, setComponentNode] = useState<ReactNode>(null);

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

  // 편의 메소드
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

  const showComponent = useCallback((node: ReactNode) => {
    setComponentNode(node)
    setComponentState(true);
  }, [])
  const hideComponent = useCallback(() => {
    setComponentNode(null)
    setComponentState(false);
  }, [])

  const contextValue: DialogContextType = {
    showDialog,
    hideDialog,
    handleConfirm,
    handleCancel,
    showAlert,
    showConfirm,
    showError,
    showSuccess,
    showComponent,
    hideComponent,
  }

  return (
    <DialogContext.Provider value={contextValue}>
      {children}
      <Dialog
        isOpen={dialogState.isOpen}
        options={dialogState.options}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        onClose={hideDialog}
      />
      {componentState && <CustomModal>{componentNode}</CustomModal>}
    </DialogContext.Provider>
  )
}

export function useDialog() {
  const context = useContext(DialogContext)
  if (context === undefined) {
    throw new Error('useDialog must be used within a DialogProvider')
  }
  return context
}
