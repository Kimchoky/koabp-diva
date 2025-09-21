# 개요

이 앱은 Electron + Next.js 스택으로 구성되어 있다.

initializing 은 `nextron`으로 작업하였다.


## 앱의 명칭에 대해
KoaBP-DIVA
- KoaBP: vital sign을 측정하는 하드웨어+펌웨어+모바일 앱 브랜딩 네임.
- DIVA: Device Imprinting and Verifying Application 의 약자.


## 앱의 목적
KB-1 모델은 Blood Pressure를 측정하여, BLE 를 통해 모바일 앱과 통신한다. 자체 통신 프로토콜을 가지고 있다.

이 KB-1 은 사내 생산 공장에서 제조되는데, PCB에 각종 모듈을 부착한 후 하우징 하기 전 단계에서 이 앱을 활용한다.

즉, PCB를 지그에 고정시킨 후, 가까운 곳에서 윈도우즈 노트북(또는 데스크탑)에 해당 앱을 설치/사용하여 KB-1 기기와 BLE를 사용해 연결한다.


## 아키텍처 정의
[Architecture.md](./Architecture.md)를 참조한다.

## 화면 정의
[Screen-layout.md](./Screen-layout.md)을 참조한다.


- BLE 디바이스 스캔/연결/연결해제
- 연결된 디바이스에 `writeCharacteristics`할 수 있음
- 기기 고유번호 write
- 기기 이름 write
- write하는 데이터와 그 결과를 DB(Mongo)에 저장.
- 수동으로 기기 기능에 대해 체크리스트 Pass/Fail 처리할 수 있다.
  - 오실로스코프 파형검사