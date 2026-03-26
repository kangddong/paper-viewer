---
name: paper-init
description: arXiv 논문 ID를 받아 수집 및 번역 환경 구축을 자동화하는 스킬입니다.
---

# 🚀 Paper Initialization Skill

이 스킬은 arXiv 논문 ID(예: `2403.00161v1`)를 입력받아, 해당 논문의 원문 수집부터 번역을 위한 기본 파일 세팅까지의 과정을 자동화합니다.

## 🛠️ 주요 기능
- 아카이브 ID를 기반으로 자동 URL 생성 (`https://arxiv.org/abs/[ID]`)
- `scripts/init_paper.py`를 실행하여 원문(`orig.html`), 이미지, 메타데이터 수집
- 한국어 번역용 스켈레톤 파일(`ko.html`) 생성
- `scripts/data.js`에 논문 정보 자동 등록

## 📝 사용 방법
사용자가 논문 ID를 제공하면 다음 절차를 수행합니다.

1.  **URL 구성**: 입력받은 ID를 사용하여 arXiv `abs` 링크를 생성합니다.
    - 예: `2403.00161v1` -> `https://arxiv.org/abs/2403.00161v1`
2.  **스크립트 실행**: 터미널에서 아래 명령어를 실행합니다.
    ```bash
    python scripts/init_paper.py https://arxiv.org/abs/[ID]
    ```
3.  **결과 확인**: `papers/[ID]/` 폴더 내에 아래 파일들이 생성되었는지 확인합니다.
    - `orig.html`: 원문 HTML
    - `meta.json`: 논문 메타데이터
    - `ko.html`: 번역용 템플릿
    - `figures/`: 추출된 이미지 폴더
4.  **후속 작업**: 생성된 `ko.html`을 열고 `docs/translation/TRANSLATION_PLAN_TEMPLATE.md`, `docs/translation/words.md`를 기준으로 번역 작업을 시작합니다.

## ⚠️ 주의 사항
- arXiv HTML 서비스가 지원되지 않는 논문의 경우 수집이 실패할 수 있습니다.
- `scripts/data.js` 업데이트 시 중복 등록 여부를 체크해야 합니다.
