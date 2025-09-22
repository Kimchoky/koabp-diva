import React, { createContext, useContext, ReactNode } from 'react'
import { useDialog } from '../hooks/useDialog'
import Dialog from '../components/ui/BlurNotice'

interface DialogContextType {
  showDialog: (options: import('../hooks/useDialog').DialogOptions) => void
  hideDialog: () => void
  showAlert: (title: string, message: string, onConfirm?: () => void) => void
  showConfirm: (title: string, message: string, onConfirm?: () => void, onCancel?: () => void) => void
  showError: (title: string, message: string, onConfirm?: () => void) => void
  showSuccess: (title: string, message: string, onConfirm?: () => void) => void
}

const DialogContext = createContext<DialogContextType | undefined>(undefined)

export function DialogProvider({ children }: { children: ReactNode }) {
  const dialog = useDialog()

  const contextValue: DialogContextType = {
    showDialog: dialog.showDialog,
    hideDialog: dialog.hideDialog,
    showAlert: dialog.showAlert,
    showConfirm: dialog.showConfirm,
    showError: dialog.showError,
    showSuccess: dialog.showSuccess
  }

  return (
    <DialogContext.Provider value={contextValue}>
      {children}
      <Dialog
        isOpen={dialog.isOpen}
        options={dialog.options}
        onConfirm={dialog.handleConfirm}
        onCancel={dialog.handleCancel}
        onClose={dialog.hideDialog}
      />
    </DialogContext.Provider>
  )
}

export function useDialogContext() {
  const context = useContext(DialogContext)
  if (context === undefined) {
    throw new Error('useDialogContext must be used within a DialogProvider')
  }
  return context
}