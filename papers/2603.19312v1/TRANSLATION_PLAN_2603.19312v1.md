# 📋 논문 번역 진행 계획 (Translation Plan): 2603.19312v1

## 🎯 목표
`orig.html`의 본문, 부록, 그림/표 캡션까지 누락 없이 `ko.html`에 반영한다. 핵심 아이디어와 실험 결과가 빠지지 않도록 전체 논문을 한국어 열람본으로 재구성한다.

## 🔄 워크플로우 (Workflow)
1. **분석 (Analyze)**: `orig.html`에서 섹션, 부록, 표, 그림 구조를 추출한다.
2. **작업 (Translate)**: `words.md`를 기준으로 용어를 통일하며 본문을 번역한다.
3. **통합 (Integrate)**: 번역 내용을 `ko.html`에 재배치하고 주요 시각 자료를 포함한다.
4. **검증 (Verify)**: 섹션 누락, 그림/표 캡션, 이미지 경로, UI 렌더링을 확인한다.

## 📝 To-do Checklist

### [Phase 1] 초기 분석 및 준비
- [x] 용어집(`words.md`) 보강
- [x] 제목, 저자, 초록 확인
- [x] 전체 섹션/부록 구조 추출

### [Phase 2] 본문 번역
- [x] 1장 Introduction 번역
- [x] 2장 Related Work 번역
- [x] 3장 Method 번역
- [x] 4장 Latent Planning Performance 번역
- [x] 5장 Quantifying Physical Understanding 번역
- [x] 6장 Conclusion 번역

### [Phase 3] 부록 및 시각 자료 통합
- [x] Appendix A-B (SIGReg, CEM) 번역
- [x] Appendix C (Baselines) 번역
- [x] Appendix D-E (구현, 데이터셋) 번역
- [x] Appendix F (평가 세부사항) 번역
- [x] Appendix G-I (Ablation, Temporal Straightening, Training Curves) 번역
- [x] Figure 1-19 및 Table 1-9 캡션/요약 반영

### [Phase 4] 내용 검증
- [x] 본문/부록 섹션 누락 여부 점검
- [x] 핵심 수식과 메서드 설명 반영 여부 점검
- [x] 그림/표 캡션 누락 여부 점검
- [x] 이미지 경로 존재 여부 점검

### [Phase 5] UI 검증 및 마무리
- [x] `paper.html?id=2603.19312v1` 렌더링 확인
- [x] Split View 및 스크롤 동기화 확인
- [x] 최종 커밋

---
*이 계획은 `2603.19312v1`의 번역 품질과 누락 방지를 위해 작성되었습니다.*
