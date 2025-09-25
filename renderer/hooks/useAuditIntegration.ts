/**
 * 감사 로그 통합 훅 - MongoDB와 연동하여 자동 저장
 */

import { useEffect, useRef } from 'react';
import { useAudit } from '../contexts/AuditContext';
import { auditService } from '../services/auditService';
import {AuditSession, LogMessage, UserActionLog} from "../types/audit";

interface AuditIntegrationOptions {
  autoSave?: boolean;
  batchSize?: number;
  batchInterval?: number; // milliseconds
  enableSessionTracking?: boolean;
}

export function useAuditIntegration(options: AuditIntegrationOptions = {}) {
  const {
    autoSave = true,
    batchSize = 10,
    batchInterval = 5000,
    enableSessionTracking = true
  } = options;

  const audit = useAudit();
  const actionBuffer = useRef<UserActionLog[]>([]);
  const logBuffer = useRef<LogMessage[]>([]);
  const batchTimer = useRef<NodeJS.Timeout | null>(null);
  const sessionStarted = useRef(false);

  // 배치 저장 처리
  const processBatch = async () => {
    if (actionBuffer.current.length === 0 && logBuffer.current.length === 0) {
      return;
    }

    try {
      const result = await auditService.saveBatch({
        actions: actionBuffer.current.length > 0 ? [...actionBuffer.current] : undefined,
        logs: logBuffer.current.length > 0 ? [...logBuffer.current] : undefined,
      });

      if (result.success) {
        console.log(`📊 Batch saved: ${result.data?.savedActions || 0} actions, ${result.data?.savedLogs || 0} logs`);
        actionBuffer.current = [];
        logBuffer.current = [];
      } else {
        console.error('Failed to save batch:', result.error);
      }
    } catch (error) {
      console.error('Batch save error:', error);
    }
  };

  // 타이머 설정
  const resetBatchTimer = () => {
    if (batchTimer.current) {
      clearTimeout(batchTimer.current);
    }

    batchTimer.current = setTimeout(processBatch, batchInterval);
  };

  // 액션 저장 핸들러
  const handleAction = (action: UserActionLog) => {
    if (!autoSave) return;

    actionBuffer.current.push(action);

    // 버퍼 크기 체크
    if (actionBuffer.current.length >= batchSize) {
      processBatch();
    } else {
      resetBatchTimer();
    }
  };

  // 로그 저장 핸들러
  const handleLog = (log: LogMessage) => {
    if (!autoSave) return;

    logBuffer.current.push(log);

    // 버퍼 크기 체크
    if (logBuffer.current.length >= batchSize) {
      processBatch();
    } else {
      resetBatchTimer();
    }
  };

  // 세션 시작
  useEffect(() => {
    if (!enableSessionTracking || sessionStarted.current) return;

    const startSession = async () => {
      const sessionInfo = audit.getSessionInfo();
      const session: AuditSession = {
        sessionId: sessionInfo.sessionId,
        startTime: sessionInfo.startTime,
        deviceInfo: {
          platform: navigator.platform,
          version: navigator.appVersion,
          userAgent: navigator.userAgent,
        },
        actionCount: 0,
        logCount: 0,
      };

      try {
        const result = await auditService.startSession(session);
        if (result.success) {
          sessionStarted.current = true;
          audit.logInfo('Audit session started', {
            category: 'system',
            data: { sessionId: sessionInfo.sessionId }
          });
        }
      } catch (error) {
        console.error('Failed to start audit session:', error);
      }
    };

    startSession();
  }, [audit, enableSessionTracking]);

  // 세션 종료 및 정리
  useEffect(() => {
    const handleBeforeUnload = async () => {
      // 남은 배치 데이터 저장
      await processBatch();

      // 세션 종료
      if (enableSessionTracking && sessionStarted.current) {
        const sessionInfo = audit.getSessionInfo();
        await auditService.endSession(sessionInfo.sessionId);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);

      // 정리
      if (batchTimer.current) {
        clearTimeout(batchTimer.current);
      }

      // 마지막 배치 처리
      processBatch();

      // 세션 종료
      if (enableSessionTracking && sessionStarted.current) {
        const sessionInfo = audit.getSessionInfo();
        auditService.endSession(sessionInfo.sessionId);
      }
    };
  }, [audit, enableSessionTracking]);

  return {
    handleAction,
    handleLog,
    processBatch,
    getBufferStatus: () => ({
      actionCount: actionBuffer.current.length,
      logCount: logBuffer.current.length,
    }),
    flushBuffers: processBatch,
  };
}