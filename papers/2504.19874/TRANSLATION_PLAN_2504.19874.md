# 📋 논문 번역 진행 계획 (Translation Plan): 2504.19874

## 🎯 목표
`orig.html`의 내용을 누락 없이 동일한 수준의 가독성으로 `ko.html`에 반영한다. (단순 요약이 아닌 전체 본문 번역)

## 🔄 워크플로우 (Workflow)
1. **분석 (Analyze)**: `orig.html`에서 번역할 섹션의 전체 텍스트와 구조(Table, Figure, List) 추출.
2. **작업 (Translate)**: `docs/translation/words.md`를 참조하여 섹션별 상세 번역 수행.
3. **통합 (Integrate)**: 번역된 내용을 `ko.html`의 해당 위치에 삽입 및 스타일 유지.
4. **검증 (Verify)**: 원문과 대조하여 누락 여부 및 용어 통일성 체크.

## 📝 To-do Checklist

### [Phase 1] 기초 섹션 보강 (Executive Summary & Intro)
- [x] 용어집(`docs/translation/words.md`) 업데이트 및 보강 (TurboQuant, Vector Quantization 등)
- [x] 제목 및 저자 정보 확인
- [x] 초록(Abstract) 번역 및 핵심 요약 작성
- [x] 1. 서론 (Introduction) 번역 반영
  - [x] 1.1 Problem Definition
  - [x] 1.2 Related Work
  - [x] 1.3 Overview of Techniques and Contributions

### [Phase 2] 본문 정밀 번역 (Section 2-3)
- [ ] 2. Preliminaries 번역
  - [ ] 2.1 Shannon Lower Bound on Distortion
  - [ ] 2.2 QJL: 1-bit inner product quantization
- [x] 3. TurboQuant: High Performance Quantization 번역
  - [x] 3.1 MSE Optimal TurboQuant
  - [x] 3.2 Inner-product Optimal TurboQuant
  - [ ] 3.3 Lower Bounds
- [x] 수식, 리스트, 강조 텍스트 스타일 적용

### [Phase 3] 본문 정밀 번역 (Section 4-End)
- [ ] 4. Experiments 번역
  - [ ] 4.1 Empirical Validation
  - [ ] 4.2 Needle-In-A-Haystack
  - [ ] 4.3 End-to-end Generation on LongBench
  - [ ] 4.4 Near Neighbour Search Experiments
- [ ] 결론 및 향후 과제 (있는 경우)
- [ ] 참고문헌(References) 구조화

### [Phase 4] 시각 자료 및 데이터 통합
- [ ] 이미지(Figures) 캡션 번역 및 삽입 (16개 이미지 확인됨)
- [ ] 표(Tables) 데이터 한글화 및 레이아웃 조정

### [Phase 5] 최종 검토 및 폴리싱
- [ ] 전체 레이아웃 및 반응형 확인
- [ ] 스크롤 동기화 동작 테스트
- [ ] 오탈자 및 용어 일관성 최종 점검

---
*이 계획은 2504.19874의 번역 품질을 높이기 위해 작성되었습니다.*
