// scripts/viewer.js

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const paperId = urlParams.get('id');
    const paperTitleEl = document.getElementById('paperTitle');

    const koPane = document.getElementById('koPane');
    const koContent = document.getElementById('koContent');
    const origPane = document.getElementById('origPane');
    const origFrame = document.getElementById('origFrame');
    const resizer = document.getElementById('resizer');
    const viewerContainer = document.getElementById('viewerContainer');
    const toggleSplitBtn = document.getElementById('toggleSplitBtn');

    let isSplitMode = false;

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
    }

    // Split View Toggle Logic
    toggleSplitBtn.addEventListener('click', () => {
        isSplitMode = !isSplitMode;

        if (isSplitMode) {
            origPane.style.display = 'block';
            viewerContainer.classList.add('split-mode');

            koPane.style.width = '50%';
            koPane.style.flex = 'none';
            origPane.style.width = '50%';
            origPane.style.flex = 'none';

            toggleSplitBtn.innerHTML = `
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        단일 뷰로 돌아가기
      `;
        } else {
            origPane.style.display = 'none';
            viewerContainer.classList.remove('split-mode');

            koPane.style.width = '100%';
            koPane.style.flex = '1';
            origPane.style.width = '';
            origPane.style.flex = '';

            toggleSplitBtn.innerHTML = `
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h2m0-16V5a2 2 0 012-2h2a2 2 0 012 2v16a2 2 0 01-2 2h-2a2 2 0 01-2-2m0-16h2a2 2 0 012 2v12a2 2 0 01-2 2h-2" />
        </svg>
        원문과 함께 보기
      `;
        }
    });

    // Resizing Logic
    let isResizing = false;

    resizer.addEventListener('mousedown', (e) => {
        isResizing = true;
        document.body.style.cursor = 'col-resize';
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
});
