// scripts/viewer.js

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const paperId = urlParams.get('id');
    const paperTitleEl = document.getElementById('paperTitle');

    const koPane = document.getElementById('koPane');
    const koContent = document.getElementById('koContent');
    const origPane = document.getElementById('origPane');
    const origLoading = document.getElementById('origLoading');
    const origFrame = document.getElementById('origFrame');
    const resizer = document.getElementById('resizer');
    const viewerContainer = document.getElementById('viewerContainer');
    const toggleSplitBtn = document.getElementById('toggleSplitBtn');
    const compactViewport = window.matchMedia('(max-width: 1024px)');

    let isSplitMode = false;

    const renderToggleButton = () => {
        if (isSplitMode) {
            toggleSplitBtn.innerHTML = `
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        단일 뷰로 돌아가기
      `;
            return;
        }

        if (compactViewport.matches) {
            toggleSplitBtn.innerHTML = `
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 3h7m0 0v7m0-7L10 14" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5h5M5 5v14h14v-5" />
        </svg>
        원문 새 탭으로 보기
      `;
            return;
        }

        toggleSplitBtn.innerHTML = `
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h2m0-16V5a2 2 0 012-2h2a2 2 0 012 2v16a2 2 0 01-2 2h-2a2 2 0 01-2-2m0-16h2a2 2 0 012 2v12a2 2 0 01-2 2h-2" />
        </svg>
        원문과 함께 보기
      `;
    };

    const exitSplitMode = () => {
        isSplitMode = false;
        origPane.style.display = 'none';
        viewerContainer.classList.remove('split-mode');
        koPane.style.width = '100%';
        koPane.style.flex = '1';
        origPane.style.width = '';
        origPane.style.flex = '';
        renderToggleButton();
    };

    const decorateOriginalFrame = () => {
        try {
            const frameDoc = origFrame.contentDocument;

            if (!frameDoc || frameDoc.getElementById('paper-viewer-orig-style')) {
                return;
            }

            const style = frameDoc.createElement('style');
            style.id = 'paper-viewer-orig-style';
            style.textContent = `
                :root {
                    color-scheme: light;
                }

                html, body {
                    background: #ffffff !important;
                }

                body {
                    margin: 0 !important;
                    padding: 0 !important;
                }

                #modal-form,
                .arxiv-html-header,
                .ltx_page_navbar,
                .ltx_role_creation,
                .ltx_page_footer,
                footer,
                .ltx_bibliography .ltx_tag_bibitem {
                    display: none !important;
                }

                .ltx_page_main,
                .ltx_document {
                    max-width: 920px !important;
                    margin: 0 auto !important;
                    padding: 24px 28px 56px !important;
                    box-sizing: border-box !important;
                }

                .ltx_abstract,
                .ltx_section,
                .ltx_appendix,
                .ltx_bibliography {
                    width: 100% !important;
                }

                img,
                svg,
                table {
                    max-width: 100% !important;
                }

                pre,
                code {
                    white-space: pre-wrap !important;
                    word-break: break-word !important;
                }
            `;

            frameDoc.head.appendChild(style);
            if (origLoading) {
                origLoading.style.display = 'none';
            }
        } catch (e) {
            console.warn('Could not decorate original iframe:', e);
        }
    };

    if (paperId) {
        // 논문 데이터 로드 (data.js에서)
        const paperMeta = typeof APP_DATA !== 'undefined'
            ? APP_DATA.papers.find(p => p.id === paperId)
            : null;

        paperTitleEl.textContent = paperMeta ? paperMeta.title : `[${paperId}] 논문 뷰어`;

        // 번역본(ko.html) 로드
        try {
            const response = await fetch(`papers/${paperId}/ko.html`);
            if (response.ok) {
                const koHtml = await response.text();
                koContent.innerHTML = koHtml;
            } else {
                koContent.innerHTML = `<div class="loading">번역본을 찾을 수 없습니다. (${response.status})</div>`;
            }
        } catch (e) {
            koContent.innerHTML = `<div class="loading">번역본 로드 중 오류가 발생했습니다.</div>`;
        }

        // 원문 로컬 파일 로드 (iframe cors 문제 해결)
        origFrame.src = `papers/${paperId}/orig.html`;
    } else {
        paperTitleEl.textContent = "논문을 찾을 수 없습니다.";
        koContent.innerHTML = `<div class="loading">잘못된 접근입니다. 메인 페이지(index.html)에서 논문을 선택해주세요.</div>`;
        origFrame.src = 'about:blank';
    }

    // Split View Toggle Logic
    toggleSplitBtn.addEventListener('click', () => {
        if (!isSplitMode && compactViewport.matches) {
            window.open(origFrame.src, '_blank', 'noopener');
            return;
        }

        isSplitMode = !isSplitMode;

        if (isSplitMode) {
            origPane.style.display = 'block';
            viewerContainer.classList.add('split-mode');

            koPane.style.width = '50%';
            koPane.style.flex = 'none';
            origPane.style.width = '50%';
            origPane.style.flex = 'none';
        } else {
            exitSplitMode();
            return;
        }

        renderToggleButton();
    });

    compactViewport.addEventListener('change', (event) => {
        if (event.matches && isSplitMode) {
            exitSplitMode();
            return;
        }

        renderToggleButton();
    });

    // Resizing Logic
    let isResizing = false;

    resizer.addEventListener('mousedown', (e) => {
        isResizing = true;
        document.body.style.cursor = 'col-resize';
        viewerContainer.classList.add('is-resizing'); // 리사이징 상태 클래스 추가
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;

        const containerRect = viewerContainer.getBoundingClientRect();
        const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

        if (newWidth > 20 && newWidth < 80) {
            koPane.style.width = `${newWidth}%`;
            origPane.style.width = `${100 - newWidth}%`;
        }
    });

    document.addEventListener('mouseup', () => {
        if (isResizing) {
            isResizing = false;
            document.body.style.cursor = 'default';
            viewerContainer.classList.remove('is-resizing');
        }
    });

    // Sync scroll logic
    let isSyncingLeft = false;
    let isSyncingRight = false;

    koPane.addEventListener('scroll', () => {
        if (!isSplitMode || isSyncingLeft) {
            isSyncingLeft = false;
            return;
        }

        const maxScrollLeft = koPane.scrollHeight - koPane.clientHeight;
        if (maxScrollLeft <= 0) return;

        const percentage = koPane.scrollTop / maxScrollLeft;

        try {
            const frameWin = origFrame.contentWindow;
            const frameDoc = frameWin.document;
            // 로컬 파일이므로 접근 가능
            const maxScrollRight = frameDoc.body.scrollHeight - frameWin.innerHeight;

            isSyncingRight = true;
            frameWin.scrollTo(0, percentage * maxScrollRight);
        } catch (e) {
            console.warn('Scroll sync failed:', e);
        }
    });

    origFrame.addEventListener('load', () => {
        decorateOriginalFrame();

        try {
            origFrame.contentWindow.addEventListener('scroll', () => {
                if (!isSplitMode || isSyncingRight) {
                    isSyncingRight = false;
                    return;
                }

                const frameWin = origFrame.contentWindow;
                const frameDoc = frameWin.document;
                const maxScrollRight = frameDoc.body.scrollHeight - frameWin.innerHeight;

                if (maxScrollRight <= 0) return;

                const percentage = frameWin.scrollY / maxScrollRight;
                const maxScrollLeft = koPane.scrollHeight - koPane.clientHeight;

                isSyncingLeft = true;
                koPane.scrollTo(0, percentage * maxScrollLeft);
            });
        } catch (e) {
            console.warn('Could not attach scroll listener to iframe:', e);
        }
    });

    renderToggleButton();
});
