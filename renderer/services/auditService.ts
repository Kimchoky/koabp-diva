/**
 * 감사 로그 서비스 - MongoDB 저장 인터페이스
 * 실제 구현은 Main 프로세스에서 수행
 */

import {
  UserActionLog,
  LogMessage,
  AuditSession,
  AuditLogFilter,
  AuditStatistics
} from '../types/audit';

// IPC 통신을 위한 채널 정의
export const AUDIT_CHANNELS = {
  // 액션 로그
  SAVE_ACTION: 'audit:save-action',
  GET_ACTIONS: 'audit:get-actions',
  DELETE_ACTIONS: 'audit:delete-actions',

  // 로그 메시지
  SAVE_LOG: 'audit:save-log',
  GET_LOGS: 'audit:get-logs',
  DELETE_LOGS: 'audit:delete-logs',

  // 세션
  START_SESSION: 'audit:start-session',
  END_SESSION: 'audit:end-session',
  GET_SESSIONS: 'audit:get-sessions',

  // 통계
  GET_STATISTICS: 'audit:get-statistics',

  // 유지보수
  CLEANUP_OLD_LOGS: 'audit:cleanup-old-logs',
  EXPORT_LOGS: 'audit:export-logs',
} as const;

// 응답 타입 정의
export interface AuditResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}

// 내보내기 옵션
export interface ExportOptions {
  format: 'json' | 'csv' | 'excel';
  filter?: AuditLogFilter;
  includeActions?: boolean;
  includeLogs?: boolean;
  includeSessions?: boolean;
  filePath?: string;
}

// 정리 옵션
export interface CleanupOptions {
  olderThanDays: number;
  actionTypes?: string[];
  keepSessions?: boolean;
  dryRun?: boolean;
}

/**
 * 감사 로그 서비스 클래스
 */
export class AuditService {
  private static instance: AuditService;

  private constructor() {}

  public static getInstance(): AuditService {
    if (!AuditService.instance) {
      AuditService.instance = new AuditService();
    }
    return AuditService.instance;
  }

  /**
   * 액션 로그 저장
   */
  async saveAction(action: UserActionLog): Promise<AuditResponse<{ actionId: string }>> {
    try {
      if (!window.ipc) {
        throw new Error('IPC not available');
      }

      const response = await window.ipc.invoke(
        AUDIT_CHANNELS.SAVE_ACTION,
        action
      );

      return response;
    } catch (error) {
      console.error('Failed to save action:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  /**
   * 액션 로그 조회
   */
  async getActions(filter?: AuditLogFilter): Promise<AuditResponse<UserActionLog[]>> {
    try {
      if (!window.ipc) {
        throw new Error('IPC not available');
      }

      const response = await window.ipc.invoke(
        AUDIT_CHANNELS.GET_ACTIONS,
        filter
      );

      return response;
    } catch (error) {
      console.error('Failed to get actions:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  /**
   * 로그 메시지 저장
   */
  async saveLog(log: LogMessage): Promise<AuditResponse<{ logId: string }>> {
    try {
      if (!window.ipc) {
        throw new Error('IPC not available');
      }

      const response = await window.ipc.invoke(
        AUDIT_CHANNELS.SAVE_LOG,
        log
      );

      return response;
    } catch (error) {
      console.error('Failed to save log:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  /**
   * 로그 메시지 조회
   */
  async getLogs(filter?: AuditLogFilter): Promise<AuditResponse<LogMessage[]>> {
    try {
      if (!window.ipc) {
        throw new Error('IPC not available');
      }

      const response = await window.ipc.invoke(
        AUDIT_CHANNELS.GET_LOGS,
        filter
      );

      return response;
    } catch (error) {
      console.error('Failed to get logs:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  /**
   * 세션 시작
   */
  async startSession(session: AuditSession): Promise<AuditResponse<{ sessionId: string }>> {
    try {
      if (!window.ipc) {
        throw new Error('IPC not available');
      }

      const response = await window.ipc.invoke(
        AUDIT_CHANNELS.START_SESSION,
        session
      );

      return response;
    } catch (error) {
      console.error('Failed to start session:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  /**
   * 세션 종료
   */
  async endSession(sessionId: string): Promise<AuditResponse<void>> {
    try {
      if (!window.ipc) {
        throw new Error('IPC not available');
      }

      const response = await window.ipc.invoke(
        AUDIT_CHANNELS.END_SESSION,
        sessionId
      );

      return response;
    } catch (error) {
      console.error('Failed to end session:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  /**
   * 통계 조회
   */
  async getStatistics(filter?: AuditLogFilter): Promise<AuditResponse<AuditStatistics>> {
    try {
      if (!window.ipc) {
        throw new Error('IPC not available');
      }

      const response = await window.ipc.invoke(
        AUDIT_CHANNELS.GET_STATISTICS,
        filter
      );

      return response;
    } catch (error) {
      console.error('Failed to get statistics:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  /**
   * 오래된 로그 정리
   */
  async cleanupOldLogs(options: CleanupOptions): Promise<AuditResponse<{
    deletedActions: number;
    deletedLogs: number;
    deletedSessions: number;
  }>> {
    try {
      if (!window.ipc) {
        throw new Error('IPC not available');
      }

      const response = await window.ipc.invoke(
        AUDIT_CHANNELS.CLEANUP_OLD_LOGS,
        options
      );

      return response;
    } catch (error) {
      console.error('Failed to cleanup old logs:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  /**
   * 로그 내보내기
   */
  async exportLogs(options: ExportOptions): Promise<AuditResponse<{ filePath: string }>> {
    try {
      if (!window.ipc) {
        throw new Error('IPC not available');
      }

      const response = await window.ipc.invoke(
        AUDIT_CHANNELS.EXPORT_LOGS,
        options
      );

      return response;
    } catch (error) {
      console.error('Failed to export logs:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  /**
   * 배치 저장 (성능 최적화용)
   */
  async saveBatch(data: {
    actions?: UserActionLog[];
    logs?: LogMessage[];
  }): Promise<AuditResponse<{
    savedActions: number;
    savedLogs: number;
  }>> {
    try {
      if (!window.ipc) {
        throw new Error('IPC not available');
      }

      // 병렬로 저장 처리
      const promises = [];

      if (data.actions?.length) {
        promises.push(
          ...data.actions.map(action => this.saveAction(action))
        );
      }

      if (data.logs?.length) {
        promises.push(
          ...data.logs.map(log => this.saveLog(log))
        );
      }

      const results = await Promise.allSettled(promises);

      const savedActions = results.slice(0, data.actions?.length || 0)
        .filter(r => r.status === 'fulfilled' && (r.value as AuditResponse).success).length;

      const savedLogs = results.slice(data.actions?.length || 0)
        .filter(r => r.status === 'fulfilled' && (r.value as AuditResponse).success).length;

      return {
        success: true,
        data: {
          savedActions,
          savedLogs
        },
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Failed to save batch:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date()
      };
    }
  }
}

// 싱글톤 인스턴스 내보내기
export const auditService = AuditService.getInstance();