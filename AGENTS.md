# 논문 번역 수집기 (Paper Translation Collector)

## 📌 프로젝트 소개
이 프로젝트는 arXiv 등에서 제공되는 HTML 형태의 논문을 수집하고, 한국어로 번역하여 제공하는 아카이빙 웹 어플리케이션입니다.
핵심 기능으로 **한국어 번역본 제공**과 함께 언제든 원문을 대조해볼 수 있는 **동시보기(Split View) 및 스크롤 동기화 기능**을 지원합니다.

## 🎯 주요 기능
1. **메인 페이지 (논문 리스트)**
   - 수집된 논문들이 심플하고 모던한 카드 형태 또는 리스트 형태로 배치됩니다.
   - 각 논문 항목에는 제목, 요약, 원문 링크, 번역 보기 버튼 등이 포함됩니다.

2. **논문 열람 페이지**
   - **기본 모드**: 한국어로 번역된 논문 내용을 깔끔한 웹 인터페이스로 제공합니다.
   - **Split View 모드**: 특정 버튼(예: '원문과 함께 보기')을 클릭하면, 화면이 좌우로 나뉘며 한쪽에는 한국어 번역본, 다른 한쪽에는 원문(HTML)이 렌더링 됩니다.
   - **스크롤 동기화 (Sync Scroll)**: Split View 상태에서 한쪽을 스크롤하면 다른 한쪽도 동일한 비율 또는 위치로 자동 스크롤됩니다.

3. **반응형 디자인 (Responsive)**
   - 모바일, 태블릿, 데스크탑 등 다양한 환경에 대응하며, 모바일 화면에서는 Split View 대신 탭 전환 등으로 대체될 수 있도록 유연하게 설계합니다.

## 🏗️ 기술 스택 (Tech Stack)
- **Frontend Core**: HTML5, CSS3, Vanilla JavaScript (빠른 성능과 의존성 최소화를 위해 Vanilla 환경 구축)
- **Framework/Bundler** (선택 사항): Vite (빌드 및 개발 서버 로컬 호스팅용)
- **Design/Styling**: Vanilla CSS (CSS Variables를 활용한 디자인 시스템 구축, Modern Typography 적용)
- **Data Storage**: `data.json` 형태의 파일 기반 저장소 사용 (프론트엔드에서 fetch하여 리스트 렌더링)

## 🗂️ 프로젝트 구조 (예상)
```text
/
├── index.html        # 메인 페이지 (논문 리스트 뷰)
├── paper.html        # 논문 열람 페이지 (Split View 지원 뷰어)
├── styles/
│   ├── index.css     # 전역 CSS, 디자인 시스템 (변수 등)
│   ├── home.css      # 메인 페이지 스타일
│   └── viewer.css    # 논문 뷰어 페이지 (Split View) 스타일
├── scripts/
│   ├── app.js        # 초기화 및 메인 UI 로직
│   ├── data.js       # 논문 데이터 관리 (또는 JSON fetch 로직)
│   ├── run-server.bat # 로컬 서버 실행 보조 스크립트
│   └── viewer.js     # Split view 및 Sync scroll 구현 로직
├── docs/
│   ├── guides/
│   │   └── UI_GUIDE.md # 디자인 가이드 및 스타일 시스템 명세
│   └── translation/
│       ├── TRANSLATION_PLAN_TEMPLATE.md # 번역 계획 템플릿
│       └── words.md   # 번역 용어집
├── papers/           # 수집된 논문 데이터 폴더
│   ├── [논문 ID]/
│   │   ├── orig.html # 원문 HTML 파일
│   │   ├── ko.html   # 한국어 번역 내용 파일
│   │   └── meta.json # 논문 메타데이터 (제목, 요약 등)
└── GEMINI.md         # 프로젝트 전반 개요 (현재 파일)
```

## 🔄 워크플로우 (신규 논문 추가 시)
1. **자동 수집 및 기초 세팅**:
   ```bash
   python scripts/init_paper.py [arXiv_HTML_URL]
   ```
   - 이 명령어 하나로 폴더 생성, 원문 다운로드, 이미지 수집, `meta.json` 생성, `ko.html` 스켈레톤 생성, `data.js` 업데이트가 완료됩니다.
2. **번역 계획 수립 및 수행**:
   - [docs/translation/TRANSLATION_PLAN_TEMPLATE.md](/Users/kangdong-yeong/Desktop/Workspace/Personal-Project/VibeCoding/paper_transration/docs/translation/TRANSLATION_PLAN_TEMPLATE.md)의 4단계 워크플로우(분석→작업→통합→검증)에 따라 번역을 진행합니다.
   - 번역 시 [docs/translation/words.md](/Users/kangdong-yeong/Desktop/Workspace/Personal-Project/VibeCoding/paper_transration/docs/translation/words.md) 용어집을 반드시 준수하여 일관성을 유지합니다.
   - `viewer.css`에 정의된 프리미엄 컴포넌트(`info-box`, `insight-list`, `table-grid` 등)를 활용하여 `ko.html`을 채웁니다.
3. **최종 확인**:
   - 로컬 서버에서 `paper.html?id=[ID]` 경로로 접속하여 레이아웃 및 스크롤 동기화를 확인합니다.

## Version Control
1. 의미있는 각 작업 단위당 git commit을 수행한다.
