import React from 'react'
import {Bluetooth} from 'lucide-react'
import {useDialog} from "../contexts/DialogContext";
import Button from "./ui/Button";
import {HStack, VStack} from "./ui/Stack";

export default function ComponentDemo() {
  const {showAlert, showConfirm, showError, showSuccess, showDialog} = useDialog()

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
      icon: <Bluetooth className="text-sky-400" size={20}/>,
      type: 'warning',
      confirmText: '설정하기',
      cancelText: '나중에',
      showCancel: true,
      onConfirm: () => console.log('블루투스 설정으로 이동'),
      onCancel: () => console.log('나중에 설정')
    })
  }

  return (
    <div className="mt-4">
      <div className="text-xl text-orange-500">Component Demo</div>

      <div>Dialog samples</div>
      <HStack gap={12} className="p-4 mb-8">
        <Button mode="info" onClick={handleAlert}>Alert 다이얼로그</Button>
        <Button mode="warning" onClick={handleConfirm}>Confirm 다이얼로그</Button>
        <Button mode="error" onClick={handleError}>Error 다이얼로그</Button>
        <Button mode="success" onClick={handleSuccess}>Success 다이얼로그</Button>
        <Button onClick={handleBluetoothDialog}>블루투스 다이얼로그 (원본 스타일)</Button>
      </HStack>

      <div>'Contained' buttons on 'Surface' container</div>
      <HStack appearance={"surface"} gap={12} className="mb-8">
        <Button mode="default" appearance="contained">contained</Button>
        <Button mode="info" appearance="contained">contained info</Button>
        <Button mode="warning" appearance="contained">contained warning</Button>
        <Button mode="error" appearance="contained">contained error</Button>
        <Button mode="success" appearance="contained">contained success</Button>
      </HStack>

      <div>'Outlined' buttons on 'Outlined' container</div>
      <HStack appearance={"outlined"} gap={12} className="mb-8">
        <Button mode="default" appearance="outlined">outlined</Button>
        <Button mode="info" appearance="outlined">outlined info</Button>
        <Button mode="warning" appearance="outlined">outlined warning</Button>
        <Button mode="error" appearance="outlined">outlined error</Button>
        <Button mode="success" appearance="outlined">outlined success</Button>
      </HStack>

      <div>Etc</div>
      <HStack appearance={"default"} gap={12} className={"mb-8 p-4 flex-wrap"}>
        <Button disabled appearance={"contained"}>disabled contain</Button>
        <Button disabled appearance={"outlined"}>disabled outline</Button>
        <Button loading appearance={"contained"}>loading contain</Button>
        <Button loading appearance={"outlined"}>loading outline</Button>
        <Button disabled loading appearance={"contained"}>loading disabled contain</Button>
        <Button disabled loading appearance={"outlined"}>loading disabled outline</Button>
      </HStack>
    </div>
  )
}