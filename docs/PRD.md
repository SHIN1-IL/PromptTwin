# 프로젝트 개요: PromptTwin (VS Code / Cursor용 메타 프롬프트 익스텐션)

너는 VS Code 및 Cursor 확장 프로그램 개발에 정통한 시니어 풀스택 아키텍트이자 프롬프트 엔지니어링 전문가야. 지금부터 1인 개발자의 생산성을 극대화하고 글로벌 시장에 판매할 마이크로 SaaS 툴인 **'PromptTwin'** 개발을 시작할 거니까, 아래 개요와 규칙을 완벽하게 숙지하고 개발에 임해줘.

---

## 1. 제품 비전 및 목적 (Vision)
*   **제품명:** PromptTwin (프롬프트 트윈)
*   **한 줄 정의:** 개발자가 Cursor AI에서 코딩할 때 컨텍스트 부족으로 발생하는 무한 루프 삽질을 방지하기 위해, 구글 제미나이(Gemini) API를 활용해 프로젝트 맥락, 에러 로그, 그리고 '개발 분야별 특화 아키텍처 규칙'이 결합된 완벽한 메가 명령문을 제조·주입해 주는 범용 메타 에이전트.
*   **핵심 가치:** 브라우저 이탈 없는 에디터 임베디드 UI, 분야별 포괄적 프리셋 제공, 개발자 개인 맞춤형 커스텀 프리셋 저장 기능.

---

## 2. 확장된 핵심 기능 요구사항 (Core Features)

### ① 올라운드 개발 카테고리 프리셋 (포괄적 특화 세팅)
제미나이 백엔드(System Instruction)에 단순 텍스트 번역을 넘어, 개발 분야별 최신 아키텍처 표준과 보안 표준 가이드라인을 내장함.
*   **Web Frontend:** 상태 관리 프레임워크 최적화, 컴포넌트 생명주기 및 렌더링 최적화, 반응형 UI 및 웹 접근성 지침 주입.
*   **Backend & DB Schema:** RESTful/GraphQL API 설계 표준, Prisma/TypeORM 등 ORM 예외 처리 규칙, PostgreSQL/MySQL 인덱싱 및 성능 최적화, 데이터 정형화(Parsing) 및 유효성 검증 규칙.
*   **Infrastructure & DevOps:** Docker/K8s 가상화 환경 구축, CI/CD 파이프라인(Github Actions), Nginx/인프라 라우팅 및 리버스 프록시 보안 세팅 가이드.
*   **Security & Auth:** OAuth2.0, JWT 토큰 인증/인가 흐름, CORS 에러 방지, 해싱 및 데이터 암호화 표준 가이드.
*   **Specialty (기존 자산 활용):** 비정형 데이터(크롤링/공공데이터/부동산 명세서 등)의 위험 점수 및 텍스트 마이닝 특화 아키텍처 셋.

### ② 사용자 정의 커스텀 프리셋 (Custom Preset Engine) - *판매 핵심 셀링 포인트*
*   개발자가 자신만의 "코딩 스타일 규칙", "회사 전용 컨벤션", 또는 "특정 사내 API 연동 가이드"를 프리셋으로 직접 등록하고 영구 저장(`ExtensionContext.globalState`)하여 재사용할 수 있는 기능.

### ③ 컨텍스트 스냅샷 캡처 & 원클릭 자동 복사
*   `activeTextEditor` 코드 + 터미널 에러 로그 + 개발자 목표를 패키징하여 제미나이로 전송.
*   결과 출력 시 클립보드 자동 주입(`vscode.env.clipboard.writeText`) 및 즉시 붙여넣기 안내 토스트 노출.

---

## 3. 타겟 고객 및 글로벌 마케팅 셀링 포인트 (SaaS Strategy)
*   **타겟:** Cursor / VS Code 환경에서 "Vibe Coding"을 지향하지만, 프롬프트 깎는 데 시간을 더 많이 쓰는 전 세계 모든 분야의 인디 해커 및 풀스택 개발자.
*   **판매 킥(Kick):** "더 이상 AI에게 프롬프트 가스라이팅을 하느라 시간을 낭비하지 마세요. PromptTwin이 당신의 코드와 에러를 분석해 Cursor가 단 한 번에 알아듣는 최고급 시니어 엔지니어 레벨의 명령문으로 변환해 드립니다."

---

## 4. 기술 스택 및 구현 규칙 (Tech Stack)
*   **플랫폼:** VS Code / Cursor Extension Marketplace
*   **기반 언어:** TypeScript / JavaScript (Node.js 기반)
*   **LLM API:** Google Gen AI SDK (`gemini-2.5-flash` 및 `gemini-2.5-pro` API 인프라 활용)
*   **아키텍처:** 완전한 독립 실행형 구조. 초기 MVP는 서버리스로 유저가 본인의 Gemini API Key를 입력하거나 로컬에 키를 저장해 동작하는 경량화 방식으로 빌드.

---

이 리팩토링된 PRD 개요를 바탕으로, 우선 **[1단계: 프로젝트 폴더 구조 정의 및 `package.json` 세팅]**부터 코드를 제안해 줘. 준비됐으면 시작하자!
