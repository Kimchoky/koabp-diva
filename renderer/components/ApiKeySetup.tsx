import React, { useState } from 'react';
import { VStack, HStack } from './ui/Stack';
import Button from './ui/Button';
import TextInput from './ui/TextInput';
import { validateApiKey } from '../lib/queries';

interface ApiKeySetupProps {
  onComplete: () => void;
  hasApiKey: boolean;
  isValidApiKey: boolean;
}

/**
 * API 시크릿 키 최초 설정 화면
 * 앱 실행 시 키가 없으면 표시됩니다.
 */
export default function ApiKeySetup({ onComplete, hasApiKey, isValidApiKey }: ApiKeySetupProps) {
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setError('API 키를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. API 키 유효성 검증
      const isValid = await validateApiKey(apiKey.trim());

      if (!isValid) {
        setError('유효하지 않은 API 키입니다.');
        setLoading(false);
        return;
      }

      // 2. 유효한 키면 저장
      const success = await window.keytar.setApiKey(apiKey.trim());

      if (success) {
        alert('API 키가 안전하게 저장되었습니다.');
        onComplete();
      } else {
        setError('API 키 저장에 실패했습니다.');
      }
    } catch (err) {
      console.error('Failed to save API key:', err);
      setError('오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
        <VStack gap={6}>
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">최초 설정</h1>
            <div className="text-gray-600 dark:text-gray-400">
              {hasApiKey && !isValidApiKey &&
                <p className="text-error">API키가 유효하지 않습니다.</p>
              }
              <p>API 시크릿 키를 입력하여 앱을 설정합니다.</p>
            </div>
          </div>

          {/* Info Box */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>안내:</strong> 전달 받은 <code className="px-1 py-0.5 bg-blue-100 dark:bg-blue-800 rounded">API_SECRET_KEY</code> 값을 입력하세요.
            </p>
          </div>

          {/* Input */}
          <VStack gap={2}>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              API 시크릿 키
            </label>
            <TextInput
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="API_SECRET_KEY를 입력하세요"
              disabled={loading}
              autoFocus
            />
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
          </VStack>

          {/* Actions */}
          <HStack justifyContent="flex-end" gap={3}>
            <Button
              onClick={handleSave}
              mode="primary"
              size="md"
              loading={loading}
              disabled={loading || !apiKey.trim()}
            >
              {loading ? '저장 중...' : '저장하고 시작'}
            </Button>
          </HStack>

          {/* Footer Info */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              입력한 키는 운영체제의 보안 저장소에 안전하게 보관됩니다.
            </p>
          </div>
        </VStack>
      </div>
    </div>
  );
}