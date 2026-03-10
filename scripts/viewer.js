// scripts/viewer.js

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const paperId = urlParams.get('id');
    const paperTitleEl = document.getElementById('paperTitle');

    const koPane = document.getElementById('koPane');
    const origPane = document.getElementById('origPane');
    const resizer = document.getElementById('resizer');
    const viewerContainer = document.getElementById('viewerContainer');
    const toggleSplitBtn = document.getElementById('toggleSplitBtn');

    let isSplitMode = false;

    // dummy content for now
    if (paperId) {
        paperTitleEl.textContent = `[${paperId}] 논문 뷰어`;
        document.getElementById('koContent').innerHTML = `
      <h1>한국어 번역본 (더미 데이터)</h1>
      <p>ID: ${paperId}에 해당하는 논문입니다.</p>
      <p>여기서부터 번역된 논문의 내용이 길게 이어진다고 가정합니다.</p>
      <p style="height: 1500px; background: linear-gradient(to bottom, #f0f0f0, #e0e0e0); padding: 1rem; margin-top: 2rem; border-radius: 8px;">
        (스크롤 테스트를 위한 긴 내용 영역)
      </p>
    `;

        document.getElementById('origFrame').src = `https://arxiv.org/html/${paperId}`;
    } else {
        paperTitleEl.textContent = "논문을 찾을 수 없습니다.";
    }

    // Split View Toggle Logic
    toggleSplitBtn.addEventListener('click', () => {
        isSplitMode = !isSplitMode;

        if (isSplitMode) {
            origPane.style.display = 'block';
            viewerContainer.classList.add('split-mode');

            // Default 50:50
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
        e.preventDefault(); // Prevent text selection
    });

    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;

        // Calculate relative position based on container
        const containerRect = viewerContainer.getBoundingClientRect();
        const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

        // Bounds check
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

        // Calculate percentage
        const maxScrollLeft = koPane.scrollHeight - koPane.clientHeight;
        if (maxScrollLeft <= 0) return;

        const percentage = koPane.scrollTop / maxScrollLeft;

        const maxScrollRight = origPane.scrollHeight - origPane.clientHeight;

        // sync only if iframe allows it (CORS might block accessing iframe contents depending on the source)
        // Note: since it's an arXiv link in iframe, we might run into cross-origin restrictions for scroll sync 
        // unless we host the orig.html locally as well!
        try {
            // For local iframe documents
            const frameDoc = document.getElementById('origFrame').contentWindow;
            isSyncingRight = true;
            frameDoc.scrollTo(0, percentage * (frameDoc.document.body.scrollHeight - frameDoc.innerHeight));
        } catch (e) {
            // If cross-origin, we can't sync the iframe content easily without local proxy
            console.log('Cross-origin scroll sync blocked. Will require local orig.html hosting.');
        }
    });
});
