import React from 'react'
import { useDialogContext } from '../contexts/DialogContext'
import { Bluetooth } from 'lucide-react'

export default function DialogDemo() {
  const { showAlert, showConfirm, showError, showSuccess, showDialog } = useDialogContext()

  const handleAlert = () => {
    showAlert('알림', '이것은 알림 메시지입니다.')
  }

  const handleConfirm = () => {
    showConfirm(
      '확인 필요',
      '정말로 삭제하시겠습니까?',
      () => console.log('삭제됨'),
      () => console.log('취소됨')
    )
  }

  const handleError = () => {
    showError('오류 발생', '연결에 실패했습니다. 다시 시도해주세요.')
  }

  const handleSuccess = () => {
    showSuccess('성공', '작업이 성공적으로 완료되었습니다.')
  }

  const handleBluetoothDialog = () => {
    showDialog({
      title: '블루투스 알림',
      message: 'PC의 Bluetooth 장치가 꺼져있습니다.',
      icon: <Bluetooth className="text-sky-400" size={20} />,
      type: 'warning',
      confirmText: '설정하기',
      cancelText: '나중에',
      showCancel: true,
      onConfirm: () => console.log('블루투스 설정으로 이동'),
      onCancel: () => console.log('나중에 설정')
    })
  }

  return (
    <div className="flex flex-wrap gap-4 p-4">
      <button
        onClick={handleAlert}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Alert 다이얼로그
      </button>

      <button
        onClick={handleConfirm}
        className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
      >
        Confirm 다이얼로그
      </button>

      <button
        onClick={handleError}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Error 다이얼로그
      </button>

      <button
        onClick={handleSuccess}
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Success 다이얼로그
      </button>

      <button
        onClick={handleBluetoothDialog}
        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
      >
        블루투스 다이얼로그 (원본 스타일)
      </button>
    </div>
  )
}