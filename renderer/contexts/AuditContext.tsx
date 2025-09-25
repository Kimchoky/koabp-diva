import React, { createContext, useContext, useCallback, useRef, ReactNode } from 'react';
import {
  UserActionLog,
  LogMessage,
  UserActionType,
  LogLevel,
  ActionResult,
  BLEMetadata,
  UIMetadata,
  SystemMetadata,
  BaseMetadata
} from '../types/audit';

// 세션 ID 생성
const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// 추적 ID 생성
const generateTraceId = (): string => {
  return `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// 액션 추적을 위한 인터페이스
interface ActionTracker {
  actionId: string;
  startTime: Date;
  actionType: UserActionType;
  description: string;
  component?: string;
  metadata?: BaseMetadata;
  traceId?: string;
  parentId?: string;
}

// Context 타입 정의
interface AuditContextType {
  // 세션 정보
  sessionId: string;

  // 사용자 액션 로깅
  startAction: (
    actionType: UserActionType,
    description: string,
    options?: {
      component?: string;
      metadata?: BLEMetadata | UIMetadata | SystemMetadata | BaseMetadata;
      traceId?: string;
      parentId?: string;
    }
  ) => string; // actionId 반환

  endAction: (
    actionId: string,
    result: ActionResult,
    options?: {
      error?: {
        code?: string;
        message: string;
        stack?: string;
      };
      metadata?: BaseMetadata;
    }
  ) => void;

  // 간편한 액션 로깅 (시작과 종료를 함께)
  logAction: (
    actionType: UserActionType,
    description: string,
    result: ActionResult,
    options?: {
      component?: string;
      duration?: number;
      metadata?: BLEMetadata | UIMetadata | SystemMetadata | BaseMetadata;
      error?: {
        code?: string;
        message: string;
        stack?: string;
      };
      traceId?: string;
      parentId?: string;
    }
  ) => void;

  // 로그 메시지
  log: (
    level: LogLevel,
    message: string,
    options?: {
      category?: string;
      source?: string;
      actionId?: string;
      traceId?: string;
      data?: Record<string, any>;
      error?: {
        code?: string;
        message: string;
        stack?: string;
      };
    }
  ) => void;

  // 편의 메소드들
  logInfo: (message: string, options?: Omit<Parameters<AuditContextType['log']>[2], never>) => void;
  logWarn: (message: string, options?: Omit<Parameters<AuditContextType['log']>[2], never>) => void;
  logError: (message: string, options?: Omit<Parameters<AuditContextType['log']>[2], never>) => void;
  logDebug: (message: string, options?: Omit<Parameters<AuditContextType['log']>[2], never>) => void;

  // 추적 ID 생성
  createTrace: () => string;

  // 통계 및 정보
  getSessionInfo: () => {
    sessionId: string;
    startTime: Date;
    actionCount: number;
    logCount: number;
  };
}

// Context 생성
const AuditContext = createContext<AuditContextType | undefined>(undefined);

// Provider Props
interface AuditProviderProps {
  children: ReactNode;
  userId?: string;
  onAction?: (action: UserActionLog) => void;
  onLog?: (log: LogMessage) => void;
}

export function AuditProvider({
  children,
  userId,
  onAction,
  onLog
}: AuditProviderProps) {

  const sessionId = useRef(generateSessionId()).current;
  const sessionStartTime = useRef(new Date()).current;
  const actionCount = useRef(0);
  const logCount = useRef(0);
  const activeActions = useRef(new Map<string, ActionTracker>()).current;

  // 사용자 액션 시작
  const startAction = useCallback((
    actionType: UserActionType,
    description: string,
    options?: {
      component?: string;
      metadata?: BaseMetadata;
      traceId?: string;
      parentId?: string;
    }
  ): string => {
    const actionId = `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const tracker: ActionTracker = {
      actionId,
      startTime: new Date(),
      actionType,
      description,
      component: options?.component,
      metadata: options?.metadata,
      traceId: options?.traceId,
      parentId: options?.parentId
    };

    activeActions.set(actionId, tracker);
    return actionId;
  }, []);

  // 사용자 액션 종료
  const endAction = useCallback((
    actionId: string,
    result: ActionResult,
    options?: {
      error?: {
        code?: string;
        message: string;
        stack?: string;
      };
      metadata?: BaseMetadata;
    }
  ) => {
    const tracker = activeActions.get(actionId);
    if (!tracker) {
      console.warn(`Action ${actionId} not found`);
      return;
    }

    const endTime = new Date();
    const duration = endTime.getTime() - tracker.startTime.getTime();

    const actionLog: UserActionLog = {
      timestamp: tracker.startTime,
      sessionId,
      userId,
      actionType: tracker.actionType,
      actionDescription: tracker.description,
      component: tracker.component,
      result,
      duration,
      metadata: { ...tracker?.metadata, ...options?.metadata },
      error: options?.error,
      traceId: tracker.traceId,
      parentId: tracker.parentId
    };

    actionCount.current++;
    activeActions.delete(actionId);

    // 콜백 호출
    onAction?.(actionLog);

    console.log('🎯 User Action:', {
      type: tracker.actionType,
      description: tracker.description,
      result,
      duration: `${duration}ms`
    });

  }, [sessionId, userId, onAction]);

  // 간편한 액션 로깅
  const logAction = useCallback((
    actionType: UserActionType,
    description: string,
    result: ActionResult,
    options?: {
      component?: string;
      duration?: number;
      metadata?: BaseMetadata;
      error?: {
        code?: string;
        message: string;
        stack?: string;
      };
      traceId?: string;
      parentId?: string;
    }
  ) => {
    const actionLog: UserActionLog = {
      timestamp: new Date(),
      sessionId,
      userId,
      actionType,
      actionDescription: description,
      component: options?.component,
      result,
      duration: options?.duration,
      metadata: options?.metadata || {},
      error: options?.error,
      traceId: options?.traceId,
      parentId: options?.parentId
    };

    actionCount.current++;
    onAction?.(actionLog);

    console.log('🎯 User Action:', {
      type: actionType,
      description,
      result,
      duration: options?.duration ? `${options.duration}ms` : undefined
    });
  }, [sessionId, userId, onAction]);

  // 로그 메시지
  const log = useCallback((
    level: LogLevel,
    message: string,
    options?: {
      category?: string;
      source?: string;
      actionId?: string;
      traceId?: string;
      data?: Record<string, any>;
      error?: {
        code?: string;
        message: string;
        stack?: string;
      };
    }
  ) => {
    const logMessage: LogMessage = {
      timestamp: new Date(),
      sessionId,
      level,
      message,
      category: options?.category,
      source: options?.source,
      actionId: options?.actionId,
      traceId: options?.traceId,
      data: options?.data,
      error: options?.error
    };

    logCount.current++;
    onLog?.(logMessage);

    const levelEmoji = {
      [LogLevel.TRACE]: '🔍',
      [LogLevel.DEBUG]: '🐛',
      [LogLevel.INFO]: 'ℹ️',
      [LogLevel.WARN]: '⚠️',
      [LogLevel.ERROR]: '❌',
      [LogLevel.FATAL]: '💥'
    };

    console.log(`${levelEmoji[level]} [${level.toUpperCase()}] ${message}`, options?.data);
  }, [sessionId, onLog]);

  // 편의 메소드들
  const logInfo = useCallback((message: string, options?: any) =>
    log(LogLevel.INFO, message, options), [log]);

  const logWarn = useCallback((message: string, options?: any) =>
    log(LogLevel.WARN, message, options), [log]);

  const logError = useCallback((message: string, options?: any) =>
    log(LogLevel.ERROR, message, options), [log]);

  const logDebug = useCallback((message: string, options?: any) =>
    log(LogLevel.DEBUG, message, options), [log]);

  // 추적 ID 생성
  const createTrace = useCallback(() => generateTraceId(), []);

  // 세션 정보
  const getSessionInfo = useCallback(() => ({
    sessionId,
    startTime: sessionStartTime,
    actionCount: actionCount.current,
    logCount: logCount.current
  }), [sessionId, sessionStartTime]);

  const value: AuditContextType = {
    sessionId,
    startAction,
    endAction,
    logAction,
    log,
    logInfo,
    logWarn,
    logError,
    logDebug,
    createTrace,
    getSessionInfo
  };

  return (
    <AuditContext.Provider value={value}>
      {children}
    </AuditContext.Provider>
  );
}

// Hook
export function useAudit() {
  const context = useContext(AuditContext);
  if (context === undefined) {
    throw new Error('useAudit must be used within an AuditProvider');
  }
  return context;
}

// HOC for automatic action tracking
export function withActionTracking<P extends object>(
  Component: React.ComponentType<P>,
  actionType: UserActionType,
  componentName?: string
) {
  return function TrackedComponent(props: P) {
    const audit = useAudit();

    React.useEffect(() => {
      const actionId = audit.startAction(
        actionType,
        `Rendered ${componentName || Component.displayName || Component.name}`,
        { component: componentName || Component.displayName || Component.name }
      );

      return () => {
        audit.endAction(actionId, ActionResult.SUCCESS);
      };
    }, [audit]);

    return <Component {...props} />;
  };
}