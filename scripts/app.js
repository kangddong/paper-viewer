// scripts/app.js

import { fetchPapers } from './paperRepository.js';

document.addEventListener('DOMContentLoaded', () => {
    const paperListElement = document.getElementById('paperList');
    const searchInput = document.getElementById('searchInput');
    const resetFilters = document.getElementById('resetFilters');
    const gridViewBtn = document.getElementById('gridViewBtn');
    const listViewBtn = document.getElementById('listViewBtn');

    let papers = [];

    const setStatus = (message) => {
        paperListElement.innerHTML = '';

        const status = document.createElement('div');
        status.className = 'loading-state';
        status.textContent = message;
        paperListElement.appendChild(status);
    };

    const appendHighlightedText = (element, text) => {
        const terms = /(인공지능|AI|하드웨어|HW)/g;
        let lastIndex = 0;
        let match;

        while ((match = terms.exec(text)) !== null) {
            if (match.index > lastIndex) {
                element.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
            }

            const highlight = document.createElement('span');
            highlight.className = 'highlight-dotted';
            highlight.textContent = match[0];
            element.appendChild(highlight);
            lastIndex = terms.lastIndex;
        }

        if (lastIndex < text.length) {
            element.appendChild(document.createTextNode(text.slice(lastIndex)));
        }
    };

    const renderPapers = (visiblePapers = papers) => {
        paperListElement.innerHTML = '';

        if (visiblePapers.length === 0) {
            setStatus('검색 결과가 없습니다.');
            return;
        }

        visiblePapers.forEach((paper) => {
            const el = document.createElement('article');
            el.className = 'paper-card';

            const abstractContent = paper.abstract || '요약 정보가 없습니다.';
            const shortAbstract = abstractContent.length > 150
                ? `${abstractContent.substring(0, 150)}...`
                : abstractContent;

            const meta = document.createElement('div');
            meta.className = 'paper-meta';

            const authors = document.createElement('span');
            authors.className = 'paper-authors';
            authors.textContent = paper.authors || 'Unknown';

            const date = document.createElement('span');
            date.className = 'paper-date';
            date.textContent = paper.date || '';

            const title = document.createElement('h2');
            title.className = 'paper-title';
            title.textContent = paper.title;

            const abstract = document.createElement('p');
            abstract.className = 'paper-abstract';
            appendHighlightedText(abstract, shortAbstract);

            const actions = document.createElement('div');
            actions.className = 'card-actions';

            const originalLink = document.createElement('a');
            originalLink.href = paper.originalUrl;
            originalLink.target = '_blank';
            originalLink.rel = 'noopener';
            originalLink.className = 'btn btn-outline';
            originalLink.textContent = '원문 보기';

            const translationLink = document.createElement('a');
            translationLink.href = `paper.html?id=${encodeURIComponent(paper.id)}`;
            translationLink.className = 'btn btn-primary';
            translationLink.textContent = '번역본 읽기';

            meta.append(authors, date);
            actions.append(originalLink, translationLink);
            el.append(meta, title, abstract, actions);
            paperListElement.appendChild(el);
        });
    };

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

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = papers.filter((p) =>
            p.title.toLowerCase().includes(query) ||
            (p.authors && p.authors.toLowerCase().includes(query)) ||
            (p.abstract && p.abstract.toLowerCase().includes(query))
        );
        renderPapers(filtered);
    });

    resetFilters.addEventListener('click', () => {
        searchInput.value = '';
        renderPapers();
    });

    const init = async () => {
        setStatus('논문 데이터를 불러오는 중...');

        try {
            papers = await fetchPapers();
            renderPapers();
        } catch (error) {
            console.error('Failed to load papers:', error);
            setStatus('Supabase에서 논문 데이터를 불러오지 못했습니다. 환경 변수와 RLS 정책을 확인해주세요.');
        }
    };

    init();
});
