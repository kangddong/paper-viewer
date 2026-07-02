import { createClient } from '@supabase/supabase-js';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const DEFAULT_SUPABASE_URL = 'https://zofpynymldlwunixwyvm.supabase.co';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const papersRoot = path.join(repoRoot, 'papers');

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

const parseArgs = () => {
    const ids = [];
    const args = process.argv.slice(2);

    for (let index = 0; index < args.length; index += 1) {
        if (args[index] === '--id' && args[index + 1]) {
            ids.push(args[index + 1]);
            index += 1;
            continue;
        }

        if (!args[index].startsWith('-')) {
            ids.push(args[index]);
        }
    }

    return ids;
};

const readText = async (filePath, fallback = '') => {
    try {
        return await readFile(filePath, 'utf8');
    } catch (error) {
        if (error.code === 'ENOENT') {
            return fallback;
        }

        throw error;
    }
};

const getPaperIds = async (requestedIds) => {
    if (requestedIds.length > 0) {
        return requestedIds;
    }

    const entries = await readdir(papersRoot, { withFileTypes: true });
    return entries
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .sort();
};

const normalizeAuthors = (authors) => {
    if (Array.isArray(authors)) {
        return authors.join(', ');
    }

    return authors || '';
};

const inferTranslationStatus = (koHtml) => {
    if (!koHtml) {
        return 'draft';
    }

    const isSkeleton = koHtml.includes('[번역된 초록') || koHtml.includes('본문 번역을 여기에 작성하세요');
    return isSkeleton ? 'draft' : 'done';
};

const loadPaper = async (paperId) => {
    const paperDir = path.join(papersRoot, paperId);
    const paperStat = await stat(paperDir);

    if (!paperStat.isDirectory()) {
        throw new Error(`${paperId} is not a paper directory.`);
    }

    const metaPath = path.join(paperDir, 'meta.json');
    const koHtmlPath = path.join(paperDir, 'ko.html');
    const origHtmlPath = path.join(paperDir, 'orig.html');

    const meta = JSON.parse(await readText(metaPath));
    const koHtml = await readText(koHtmlPath);
    const origHtml = await readText(origHtmlPath);

    return {
        id: meta.id || paperId,
        title: meta.title || paperId,
        authors: normalizeAuthors(meta.authors),
        abstract: meta.abstract || '',
        source_url: meta.sourceUrl || meta.originalUrl || meta.url || '',
        added_at: meta.addedAt || meta.date || null,
        translation_status: meta.translationStatus || inferTranslationStatus(koHtml),
        ko_html: koHtml,
        orig_html: origHtml,
        ko_html_path: `papers/${paperId}/ko.html`,
        orig_html_path: `papers/${paperId}/orig.html`,
        figures_path: `papers/${paperId}/figures`
    };
};

const main = async () => {
    if (!serviceKey) {
        console.error('Missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SECRET_KEY.');
        process.exit(1);
    }

    const requestedIds = parseArgs();
    const paperIds = await getPaperIds(requestedIds);
    const supabase = createClient(supabaseUrl, serviceKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false
        }
    });

    for (const paperId of paperIds) {
        const payload = await loadPaper(paperId);
        const { error } = await supabase
            .from('papers')
            .upsert(payload, { onConflict: 'id' });

        if (error) {
            throw new Error(`Failed to sync ${paperId}: ${error.message}`);
        }

        console.log(`Synced ${paperId}`);
    }

    console.log(`Done. ${paperIds.length} paper(s) synced.`);
};

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
