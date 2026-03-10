// scripts/app.js

document.addEventListener('DOMContentLoaded', () => {
    const paperListElement = document.getElementById('paperList');
    const searchInput = document.getElementById('searchInput');
    const gridViewBtn = document.getElementById('gridViewBtn');
    const listViewBtn = document.getElementById('listViewBtn');

    // Render functions
    const renderPapers = (papers = APP_DATA.papers) => {
        paperListElement.innerHTML = '';

        if (papers.length === 0) {
            paperListElement.innerHTML = '<div class="loading-state">검색 결과가 없습니다.</div>';
            return;
        }

        papers.forEach(paper => {
            const el = document.createElement('article');
            el.className = 'paper-card';

            const abstractContent = paper.abstract || '요약 정보가 없습니다.';
            const shortAbstract = abstractContent.length > 150 ? abstractContent.substring(0, 150) + '...' : abstractContent;

            el.innerHTML = `
        <div class="paper-meta">
          <span class="paper-authors">${paper.authors || 'Unknown'}</span>
          <span class="paper-date">${paper.date || ''}</span>
        </div>
        <h2 class="paper-title">${paper.title}</h2>
        <p class="paper-abstract">${shortAbstract}</p>
        <div class="card-actions">
          <a href="${paper.originalUrl}" target="_blank" class="btn btn-outline">원문 보기</a>
          <a href="paper.html?id=${paper.id}" class="btn btn-primary">번역본 읽기</a>
        </div>
      `;
            paperListElement.appendChild(el);
        });
    };

    // View toggle logic
    gridViewBtn.addEventListener('click', () => {
        paperListElement.classList.remove('list-view');
        gridViewBtn.classList.add('active');
        listViewBtn.classList.remove('active');
    });

    listViewBtn.addEventListener('click', () => {
        paperListElement.classList.add('list-view');
        listViewBtn.classList.add('active');
        gridViewBtn.classList.remove('active');
    });

    // Search logic
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = APP_DATA.papers.filter(p =>
            p.title.toLowerCase().includes(query) ||
            (p.authors && p.authors.toLowerCase().includes(query)) ||
            (p.abstract && p.abstract.toLowerCase().includes(query))
        );
        renderPapers(filtered);
    });

    // Initial render
    renderPapers();
});
