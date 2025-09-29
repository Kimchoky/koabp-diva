/**
 * Keytar IPC 핸들러
 * OS 보안 저장소와 통신하여 API 시크릿 키를 안전하게 관리합니다.
 */

import { ipcMain } from 'electron';
import * as keytar from 'keytar';

// 서비스명과 계정명 (OS 보안 저장소에서 식별자로 사용)
const SERVICE_NAME = 'koabp-diva-app';
const ACCOUNT_NAME = 'api-secret-key';

/**
 * Keytar IPC 핸들러 등록
 */
export function registerKeytarHandlers() {

  /**
   * API 시크릿 키 가져오기
   * @returns {Promise<string | null>} 저장된 키 또는 null
   */
  ipcMain.handle('keytar:get-api-key', async () => {
    try {
      const key = await keytar.getPassword(SERVICE_NAME, ACCOUNT_NAME);
      console.log('[Keytar] API key retrieved:', key ? '***' : 'null');
      return key;
    } catch (error) {
      console.error('[Keytar] Failed to get API key:', error);
      return null;
    }
  });

  /**
   * API 시크릿 키 저장하기
   * @param {string} key - 저장할 API 키
   * @returns {Promise<boolean>} 성공 여부
   */
  ipcMain.handle('keytar:set-api-key', async (_event, key: string) => {
    try {
      await keytar.setPassword(SERVICE_NAME, ACCOUNT_NAME, key);
      console.log('[Keytar] API key saved successfully');
      return true;
    } catch (error) {
      console.error('[Keytar] Failed to save API key:', error);
      return false;
    }
  });

  /**
   * API 시크릿 키 삭제하기 (선택적 - 설정 초기화 시 사용)
   * @returns {Promise<boolean>} 성공 여부
   */
  ipcMain.handle('keytar:delete-api-key', async () => {
    try {
      const deleted = await keytar.deletePassword(SERVICE_NAME, ACCOUNT_NAME);
      console.log('[Keytar] API key deleted:', deleted);
      return deleted;
    } catch (error) {
      console.error('[Keytar] Failed to delete API key:', error);
      return false;
    }
  });

  console.log('[Keytar] IPC handlers registered');
}