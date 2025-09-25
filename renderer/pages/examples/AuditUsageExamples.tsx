/**
 * 감사 로그 시스템 사용 예제
 */

import React from 'react';
import {AuditProvider, useAudit} from "../../contexts/AuditContext";
import {ActionResult, LogLevel, UserActionType} from "../../types/audit";
import {useAuditIntegration} from "../../hooks/useAuditIntegration";
import Button from "../../components/ui/Button";
import {VStack} from "../../components/ui/Stack";

// 1. 기본 사용법 예제
function BasicUsageExample() {
  const audit = useAudit();

  const handleBLEConnect = async (deviceId: string) => {
    // 액션 시작
    const actionId = audit.startAction(
      UserActionType.BLE_DEVICE_CONNECT,
      `Connecting to device ${deviceId}`,
      {
        component: 'DeviceScanner',
        metadata: { deviceId }
      }
    );

    try {
      // 실제 BLE 연결 로직
      // const result = await bleService.connect(deviceId);

      // 성공 시
      audit.endAction(actionId, ActionResult.SUCCESS, {
        metadata: { connectedAt: new Date() }
      });

      audit.logInfo('BLE device connected successfully', {
        category: 'BLE',
        data: { deviceId }
      });

    } catch (error) {
      // 실패 시
      audit.endAction(actionId, ActionResult.FAILURE, {
        error: {
          code: 'CONNECTION_FAILED',
          message: error.message,
          stack: error.stack
        }
      });

      audit.logError('Failed to connect BLE device', {
        category: 'BLE',
        data: { deviceId },
        error: {
          message: error.message,
          stack: error.stack
        }
      });
    }
  };

  return (
    <div>
      <Button onClick={() => handleBLEConnect('device-123')}>
        Connect BLE Device
      </Button>
    </div>
  );
}

// 2. 간편한 액션 로깅 예제
function SimpleLoggingExample() {
  const audit = useAudit();

  const handleButtonClick = () => {
    // 즉시 로깅 (시작과 종료를 함께)
    audit.logAction(
      UserActionType.UI_BUTTON_CLICK,
      'User clicked search button',
      ActionResult.SUCCESS,
      {
        component: 'SearchForm',
        metadata: {
          elementId: 'search-btn',
          elementType: 'button'
        }
      }
    );

    audit.logInfo('Search initiated', {
      category: 'UI',
      source: 'SearchForm.handleButtonClick'
    });
  };

  return (
    <div>
      <Button onClick={handleButtonClick}>
        Search
      </Button>
    </div>
  );
}

// 3. 추적 ID를 사용한 연관 액션 로깅
function TrackedActionsExample() {
  const audit = useAudit();

  const handleComplexOperation = async () => {
    const traceId = audit.createTrace();

    // 1단계: 스캔 시작
    audit.logAction(
      UserActionType.BLE_SCAN_START,
      'Starting BLE scan',
      ActionResult.SUCCESS,
      {
        component: 'DeviceManager',
        traceId,
        metadata: { timeout: 10000 }
      }
    );

    // 2단계: 기기 발견 (상위 액션의 하위 액션)
    audit.logAction(
      UserActionType.BLE_DEVICE_CONNECT,
      'Device discovered and connecting',
      ActionResult.SUCCESS,
      {
        component: 'DeviceManager',
        traceId,
        parentId: 'scan-action', // 상위 액션과 연결
        metadata: { deviceId: 'found-device-123' }
      }
    );

    audit.logInfo('Complex operation completed', {
      category: 'BLE',
      traceId,
      data: { steps: ['scan', 'discover', 'connect'] }
    });
  };

  return (
    <div>
      <Button onClick={handleComplexOperation}>
        Start Complex BLE Operation
      </Button>
    </div>
  );
}

// 4. 에러 처리 및 다양한 로그 레벨 예제
function ErrorHandlingExample() {
  const audit = useAudit();

  const handleRiskyOperation = async () => {
    const actionId = audit.startAction(
      UserActionType.BLE_DATA_WRITE,
      'Writing critical data to device',
      {
        component: 'DataManager',
        metadata: { dataSize: 1024, critical: true }
      }
    );

    try {
      audit.logDebug('Starting data validation', {
        category: 'BLE',
        actionId
      });

      // 가상의 위험한 작업
      const riskLevel = Math.random();

      if (riskLevel > 0.7) {
        throw new Error('Network timeout');
      } else if (riskLevel > 0.4) {
        audit.logWarn('High latency detected', {
          category: 'BLE',
          actionId,
          data: { latency: riskLevel * 1000 }
        });
      }

      audit.endAction(actionId, ActionResult.SUCCESS);

    } catch (error) {
      audit.endAction(actionId, ActionResult.FAILURE, {
        error: {
          code: 'NETWORK_TIMEOUT',
          message: error.message
        }
      });

      // 치명적 에러인 경우
      if (error.message.includes('timeout')) {
        audit.log(LogLevel.FATAL, 'Critical operation failed', {
          category: 'BLE',
          actionId,
          error: {
            code: 'CRITICAL_FAILURE',
            message: error.message
          }
        });
      }
    }
  };

  return (
    <div>
      <Button onClick={handleRiskyOperation}>
        Perform Risky Operation
      </Button>
    </div>
  );
}

// 5. 메인 앱 컴포넌트 - Provider 설정 예제
function AuditExampleApp() {
  // MongoDB 자동 저장 통합
  const auditIntegration = useAuditIntegration({
    autoSave: true,
    batchSize: 5,
    batchInterval: 3000,
    enableSessionTracking: true
  });

  return (
    <AuditProvider
      userId="user-123"
      onAction={auditIntegration.handleAction}
      onLog={auditIntegration.handleLog}
    >
      <div className="p-4">
        <h1>Audit System Examples</h1>

        <div className="space-y-4">
          <section>
            <h2>Basic Usage</h2>
            <BasicUsageExample />
          </section>

          <section>
            <h2>Simple Logging</h2>
            <SimpleLoggingExample />
          </section>

          <section>
            <h2>Tracked Actions</h2>
            <TrackedActionsExample />
          </section>

          <section>
            <h2>Error Handling</h2>
            <ErrorHandlingExample />
          </section>

          <VStack appearance={"surface"} className="mt-8 p-4 rounded">
            <h3>Buffer Status</h3>
            <pre>{JSON.stringify(auditIntegration.getBufferStatus(), null, 2)}</pre>
            <Button
              onClick={auditIntegration.flushBuffers}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
            >
              Flush Buffers
            </Button>
          </VStack>
        </div>
      </div>
    </AuditProvider>
  );
}

export default AuditExampleApp;