---
description: 논문 수집, 번역 플랜 수립, 실제 본문 번역, 그리고 내용/UI 검증까지의 전체 과정을 관리하는 올인원 파이프라인 워크플로우입니다.
---

이 워크플로우는 논문 ID를 입력받아 최종 한국어 번역 페이지 완성까지의 모든 단계를 가이드합니다.

## 🏁 시작 대기열
사용자로부터 논문 ID (예: `1706.03762v7`)를 입력받습니다.

---

### 1단계: 논문 초기화 (Initialization)
`paper-init` 스킬을 사용하여 논문 데이터를 수집합니다.
// turbo
1. 터미널에서 초기화 스크립트 실행:
   ```powershell
   python scripts/init_paper.py https://arxiv.org/abs/[ID]
   ```
2. `papers/[ID]/` 디렉토리에 `orig.html`, `ko.html`, `meta.json`, `figures/`가 정상 생성되었는지 확인합니다.

---

### 2단계: 번역 플랜 수립 (Planning)
`create-translation-plan` 워크플로우를 실행하여 해당 논문에 특화된 플랜을 생성합니다.
1. `TRANSLATION_PLAN_TEMPLATE.md`를 복사하여 `papers/[ID]/TRANSLATION_PLAN_[ID].md`를 생성합니다.
2. 파일 내의 `[논문 ID]`를 실제 ID로 치환합니다.
3. `orig.html`을 분석하여 섹션 구조를 파악하고, 플랜의 Checklist에 섹션 목록을 업데이트합니다.

---

### 3단계: 반복적 번역 수행 (Execution)
플랜의 [Phase 1~5]에 따라 순차적으로 작업을 진행합니다. 각 섹션마다 아래 루프를 반복합니다.
1. **분석**: `orig.html`에서 타겟 섹션의 텍스트와 구조(표, 그림 포함)를 파악합니다.
2. **번역**: `words.md` 용어집을 준수하며 번역을 수행합니다.
3. **통합**: 번역본을 `ko.html`에 삽입하고, `viewer.css`의 프리미엄 컴포넌트를 활용하여 스타일링합니다.

---

### 4단계: 내용 검증 (Content Verification)
번역 내용의 정확성과 완결성을 확인합니다. **코드/파일 레벨에서 수행합니다.**

체크리스트:
- [ ] `ko.html`의 모든 섹션이 `orig.html`의 섹션 구조와 1:1로 대응되는가?
- [ ] `words.md` 용어집의 핵심 용어가 번역본에 일관적으로 적용되었는가?
- [ ] 모든 수식·표·그림 캡션이 번역 또는 포함되었는가?
- [ ] 번역하지 않고 누락된 섹션이나 문단이 없는가?
- [ ] 이미지 `src` 경로가 `figures/` 내 실제 파일을 올바르게 가리키는가?
  ```powershell
  # 이미지 파일 실제 존재 확인
  Get-ChildItem papers/[ID]/figures/
  ```

---

### 5단계: UI 검증 (UI Verification)
**검증 도구: `chrome-devtools` MCP 툴을 사용합니다.**

개발 서버(`npm run dev`)가 실행 중인지 확인하고, 아래 순서로 검증합니다.

#### 5-1. 페이지 열기
- `mcp_chrome-devtools_navigate_page` 또는 `mcp_chrome-devtools_new_page`로 다음 URL을 엽니다:
  ```
  http://localhost:5173/paper.html?id=[ID]
  ```

#### 5-2. 스크린샷 캡처 및 육안 확인
- `mcp_chrome-devtools_take_screenshot`으로 전체 페이지 스크린샷을 찍습니다 (`fullPage: true`).
- 다음 항목을 육안으로 확인합니다:
  - [ ] 제목(h1), 저자, 핵심 요약 영역이 **겹치거나 잘리지 않고** 올바르게 렌더링되는가?
  - [ ] 모든 섹션 헤딩(h2, h3, h4)이 정상 표시되는가?
  - [ ] `info-box`, `insight-list`, `table-grid` 등 컴포넌트가 박스에 제대로 담겨 있는가?
  - [ ] 표(table)가 깨지지 않고 정상 렌더링되는가?

#### 5-3. 이미지 로딩 확인
- `mcp_chrome-devtools_list_network_requests`로 네트워크 요청을 확인합니다.
  - 이미지(`.png`, `.jpg`) 요청의 status code가 모두 **200**인지 확인합니다.
  - 404 응답이 있으면 해당 이미지 경로를 `ko.html`에서 수정합니다.
- 또는 `mcp_chrome-devtools_list_console_messages`로 콘솔 에러(이미지 로딩 실패 등)를 확인합니다.

#### 5-4. 레이아웃 스냅샷
- `mcp_chrome-devtools_take_snapshot`으로 접근성 트리 스냅샷을 찍어 요소 배치를 확인합니다.

#### 5-5. 반응형 확인
- `mcp_chrome-devtools_resize_page`로 뷰포트 크기를 변경하여 모바일(375×812), 태블릿(768×1024), 데스크탑(1440×900) 해상도에서 레이아웃이 깨지지 않는지 확인합니다.

#### 5-6. Split View 동작 확인
- `paper.html?id=[ID]`에서 "원문과 함께 보기" 버튼을 클릭하여 Split View 및 스크롤 동기화가 정상 동작하는지 확인합니다.

#### 발견된 UI 문제 수정
- 위 검증에서 발견한 문제는 `ko.html`, `viewer.css` 등에서 즉시 수정합니다.
- 수정 후 스크린샷을 다시 찍어 개선되었음을 확인합니다.

---

### 6단계: 마무리 및 저장 (Commit)
// turbo
1. `papers/[ID]/TRANSLATION_PLAN_[ID].md`의 모든 항목을 체크 완료로 표시합니다.
2. 의미 있는 작업 단위마다 Git Commit을 수행합니다:
   ```powershell
   git add .
   git commit -m "feat([ID]): complete translation and UI verification"
   ```

---

**사용 예시:**
/paper-full-pipeline 1706.03762v7
