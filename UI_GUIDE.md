# UI Design System & Guide

## 🎨 디자인 컨셉
- **Minimal & Essential**: 본질(논문 읽기)에 집중하기 위해 불필요한 장식을 배제한 미니멀리즘 설계.
- **Academic & Modern**: 학술 자료의 신뢰성을 주면서도 최신 트렌드를 반영한 세련된 타이포그래피와 레이아웃.
- **Glassmorphism & Depth**: 은은한 그림자와 블러 효과를 사용하여 카드와 Split View의 계층 구조를 명확히 함.

## 🌈 컬러 팔레트 (Color Scheme)
루트 CSS 변수(`:root`)를 활용하여 다크/라이트 모드를 유연하게 지원하도록 설계합니다.

### Light Mode (디폴트)
- `--bg-primary`: `#F9FAFB` (아주 밝은 회색, 눈의 피로도를 낮춤)
- `--bg-secondary`: `#FFFFFF` (카드 및 콘텐츠 영역 배경)
- `--text-primary`: `#111827` (가독성 높은 짙은 회색)
- `--text-secondary`: `#4B5563` (보조 설명, 날짜 등)
- `--accent-color`: `#2563EB` (차분하면서도 신뢰감을 주는 블루 계열)
- `--border-color`: `#E5E7EB` (부드러운 구분선)

### Dark Mode (지원 계획)
- `--bg-primary`: `#111827`
- `--bg-secondary`: `#1F2937`
- `--text-primary`: `#F9FAFB`
- `--text-secondary`: `#D1D5DB`
- `--accent-color`: `#3B82F6`
- `--border-color`: `#374151`

## 🖋️ 타이포그래피 (Typography)
구글 폰트를 활용하여 영문과 한글 모두 최고 수준의 가독성과 세련미를 제공합니다.
- **기본 폰트**: `'Pretendard', 'Inter', sans-serif`
  - 논문 본문의 가독성을 위한 깔끔한 산세리프 글꼴.
  - Heading은 Bold (700) 계열을 사용하고, 본문은 Regular (400) 사용.
- **폰트 크기 시스템**:
  - `h1` (페이지 제목): `2.5rem`
  - `h2` (논문 제목): `1.75rem`
  - `h3` (섹션 제목): `1.25rem`
  - `p` (본문): `1.05rem` (줄간격 1.6~1.8 적용으로 긴 글 가독성 확보)

## 📐 레이아웃 및 컴포넌트

### 1. 메인 논문 리스트
- 반응형 Grid (또는 Flex) 레이아웃 적용 (최대 너비 1200px 중앙 정렬).
- 각 논문 아이템은 시각적 카드 UI 형태로 구현. Hover 시 은은하게 떠오르는 효과 (box-shadow 및 transform: translateY 애니메이션).

### 2. Split View (동시보기 기능)
- 버튼 클릭 시 전체 화면 너비를 사용하여 `50% : 50%`로 좌우를 나눔.
- 가운데 구분선은 마우스로 잡고 크기 조절(Resizing)이 가능하도록 확장성을 염두에 둠 (초기엔 5:5 고정).
- 두 문서 영역의 스크롤바는 시각적으로 방해되지 않도록 스타일링(`::-webkit-scrollbar` 최소화).

### 3. 마이크로 인터렉션 (Micro-animations)
- 버튼 클릭 등 상태 변화 시 `transition: all 0.2s ease` 적용으로 부드러운 반응 제공.
- 스크롤 시 Fade-in 효과 등을 통해 등장하는 요소들에 생명력을 줌.
