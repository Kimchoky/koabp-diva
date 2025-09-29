/**
 * 감사 로그 데이터 구조 정의
 * MongoDB에 저장되는 견고한 감사 로그 시스템
 */

// 사용자 액션 유형
export enum UserActionType {
  // BLE 관련 액션
  BLE_SCAN_START = 'ble_scan_start',
  BLE_SCAN_STOP = 'ble_scan_stop',
  BLE_DEVICE_CONNECT = 'ble_device_connect',
  BLE_DEVICE_DISCONNECT = 'ble_device_disconnect',
  BLE_SERVICE_DISCOVER = 'ble_service_discover',
  BLE_DATA_WRITE = 'ble_data_write',
  BLE_DATA_READ = 'ble_data_read',
  BLE_NOTIFICATION_SUBSCRIBE = 'ble_notification_subscribe',
  BLE_NOTIFICATION_UNSUBSCRIBE = 'ble_notification_unsubscribe',

  // 시스템 액션
  APP_START = 'app_start',
  APP_CLOSE = 'app_close',
  PAGE_NAVIGATE = 'page_navigate',

  // 사용자 인터페이스 액션
  UI_BUTTON_CLICK = 'ui_button_click',
  UI_FORM_SUBMIT = 'ui_form_submit',
  UI_DIALOG_OPEN = 'ui_dialog_open',
  UI_DIALOG_CLOSE = 'ui_dialog_close',

  // 기타
  CUSTOM = 'custom'
}

export enum ActorType {
  USER = 'user',  // 사용자가 명시적으로 수행함
  LOGIC = 'logic',  // 비지니스 플로우에 따른 자동처리
  SYSTEM = 'system',  // 타임아웃 등에 의한 자동처리
}

// 로그 레벨
export enum LogLevel {
  TRACE = 'trace',
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal'
}

// 액션 결과 상태
export enum ActionResult {
  SUCCESS = 'success',
  FAILURE = 'failure',
  PARTIAL = 'partial',
  CANCELLED = 'cancelled'
}

// 기본 메타데이터 인터페이스
export interface BaseMetadata {
  [key: string]: any;
}

// BLE 관련 메타데이터
export interface BLEMetadata extends BaseMetadata {
  deviceId?: string;
  deviceName?: string;
  serviceUuid?: string;
  characteristicUuid?: string;
  dataLength?: number;
  rssi?: number;
  batteryLevel?: number;
}

// UI 관련 메타데이터
export interface UIMetadata extends BaseMetadata {
  elementId?: string;
  elementType?: string;
  pagePath?: string;
  formData?: Record<string, any>;
}

// 시스템 관련 메타데이터
export interface SystemMetadata extends BaseMetadata {
  version?: string;
  platform?: string;
  userAgent?: string;
  memoryUsage?: number;
  performanceMetrics?: Record<string, number>;
}

// 사용자 액션 로그
export interface UserActionLog {
  // 고유 식별자 (MongoDB ObjectId)
  _id?: string;

  // 기본 정보
  timestamp: Date;
  sessionId: string;  // 세션 추적용
  userId?: string;    // 사용자 식별 (선택적)

  // 액션 정보
  actionType: UserActionType;
  actionDescription: string;
  component?: string;  // 액션이 발생한 컴포넌트

  // 결과 정보
  result: ActionResult;
  duration?: number;  // 액션 소요 시간 (ms)

  // 메타데이터 (액션 유형별 추가 정보)
  metadata: BLEMetadata | UIMetadata | SystemMetadata | BaseMetadata;

  // 에러 정보 (실패 시)
  error?: {
    code?: string;
    message: string;
    stack?: string;
  };

  // 추적 정보
  traceId?: string;   // 연관된 액션들을 추적
  parentId?: string;  // 상위 액션 ID (중첩된 액션의 경우)
}

// 로그 메시지
export interface LogMessage {
  // 고유 식별자
  _id?: string;

  // 기본 정보
  timestamp: Date;
  sessionId: string;
  level: LogLevel;

  // 메시지 정보
  message: string;
  category?: string;  // 로그 카테고리 (BLE, UI, System 등)
  source?: string;    // 로그 발생 위치 (파일명, 함수명 등)

  // 연관 정보
  actionId?: string;  // 관련된 사용자 액션 ID
  traceId?: string;   // 추적 ID

  // 추가 데이터
  data?: Record<string, any>;

  // 에러 정보
  error?: {
    code?: string;
    message: string;
    stack?: string;
  };
}

// 세션 정보
export interface AuditSession {
  _id?: string;
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  userId?: string;
  deviceInfo: {
    platform: string;
    version: string;
    userAgent?: string;
  };
  actionCount: number;
  logCount: number;
}

// 감사 로그 검색/필터 옵션
export interface AuditLogFilter {
  sessionId?: string;
  userId?: string;
  actionType?: UserActionType | UserActionType[];
  result?: ActionResult;
  level?: LogLevel;
  category?: string;
  startTime?: Date;
  endTime?: Date;
  traceId?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'timestamp' | 'actionType' | 'result';
  sortOrder?: 'asc' | 'desc';
}

// 통계 정보
export interface AuditStatistics {
  totalActions: number;
  totalLogs: number;
  actionsByType: Record<UserActionType, number>;
  actionsByResult: Record<ActionResult, number>;
  logsByLevel: Record<LogLevel, number>;
  sessionCount: number;
  timeRange: {
    startTime: Date;
    endTime: Date;
  };
}