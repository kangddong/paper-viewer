import { isSupabaseConfigured, supabase } from './supabaseClient.js';

const LIST_FIELDS = [
    'id',
    'title',
    'authors',
    'abstract',
    'source_url',
    'added_at',
    'translation_status',
    'ko_html_path',
    'orig_html_path',
    'figures_path'
].join(',');

const DETAIL_FIELDS = `${LIST_FIELDS},ko_html,orig_html`;

const mapPaper = (row) => ({
    id: row.id,
    title: row.title,
    authors: row.authors,
    abstract: row.abstract,
    date: row.added_at,
    originalUrl: row.source_url,
    translationStatus: row.translation_status,
    koHtmlPath: row.ko_html_path,
    origHtmlPath: row.orig_html_path,
    figuresPath: row.figures_path,
    koHtml: row.ko_html,
    origHtml: row.orig_html
});

const assertConfigured = () => {
    if (!isSupabaseConfigured) {
        throw new Error('Supabase publishable key is not configured. Set VITE_SUPABASE_PUBLISHABLE_KEY in .env.');
    }
};

export const fetchPapers = async () => {
    assertConfigured();

    const { data, error } = await supabase
        .from('papers')
        .select(LIST_FIELDS)
        .order('added_at', { ascending: false })
        .order('id', { ascending: true });

    if (error) {
        throw error;
    }

    return data.map(mapPaper);
};

export const fetchPaper = async (id) => {
    assertConfigured();

    const { data, error } = await supabase
        .from('papers')
        .select(DETAIL_FIELDS)
        .eq('id', id)
        .single();

    if (error) {
        throw error;
    }

    return mapPaper(data);
};
