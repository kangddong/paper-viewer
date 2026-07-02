#!/usr/bin/env python3
import argparse
import json
import re
import time
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta, timezone
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
ARXIV_API_URL = "https://export.arxiv.org/api/query"
ATOM_NS = {"atom": "http://www.w3.org/2005/Atom"}

AI_TERMS = [
    "artificial intelligence",
    "machine learning",
    "deep learning",
    "neural network",
    "large language model",
    "LLM",
    "transformer",
    "AI accelerator",
    "AI inference",
    "AI training",
]

MEMORY_TERMS = [
    "HBM",
    "high bandwidth memory",
    "DRAM",
    "LPDDR",
    "low power double data rate",
    "memory bandwidth",
    "memory wall",
    "memory hierarchy",
    "memory system",
    "memory subsystem",
    "processing-in-memory",
    "process-in-memory",
    "compute-in-memory",
    "near-memory computing",
    "CXL memory",
]


@dataclass
class Candidate:
    id: str
    title: str
    published: str
    updated: str
    authors: list[str]
    summary: str
    html_url: str
    abs_url: str
    matched_ai_terms: list[str]
    matched_memory_terms: list[str]
    score: int


def normalize_space(value: str) -> str:
    return re.sub(r"\s+", " ", value or "").strip()


def arxiv_id_from_url(url: str) -> str:
    return url.rstrip("/").rsplit("/", 1)[-1]


def base_arxiv_id(arxiv_id: str) -> str:
    return re.sub(r"v\d+$", "", arxiv_id)


def load_existing_ids() -> set[str]:
    ids: set[str] = set()

    papers_dir = REPO_ROOT / "papers"
    if papers_dir.exists():
        for child in papers_dir.iterdir():
            if child.is_dir():
                ids.add(child.name)
                ids.add(base_arxiv_id(child.name))

    data_path = REPO_ROOT / "scripts" / "data.js"
    if data_path.exists():
        content = data_path.read_text(encoding="utf-8")
        for match in re.finditer(r'id:\s*"([^"]+)"', content):
            paper_id = match.group(1)
            ids.add(paper_id)
            ids.add(base_arxiv_id(paper_id))

    return ids


def term_pattern(term: str) -> re.Pattern[str]:
    escaped = re.escape(term)
    escaped = escaped.replace(r"\ ", r"\s+")
    if re.fullmatch(r"[A-Za-z0-9]+", term):
        return re.compile(rf"\b{escaped}\b", re.IGNORECASE)
    return re.compile(escaped, re.IGNORECASE)


def matched_terms(text: str, terms: list[str]) -> list[str]:
    matches = []
    for term in terms:
        if term_pattern(term).search(text):
            matches.append(term)
    return matches


def query_token(term: str) -> str:
    escaped = term.replace('"', r"\"")
    if " " in escaped:
        return f'all:"{escaped}"'
    return f"all:{escaped}"


def build_search_query(start: datetime, end: datetime) -> str:
    memory_query = " OR ".join(query_token(term) for term in MEMORY_TERMS)
    ai_query = " OR ".join(query_token(term) for term in AI_TERMS)
    date_query = f"submittedDate:[{start:%Y%m%d%H%M} TO {end:%Y%m%d%H%M}]"
    return f"({memory_query}) AND ({ai_query}) AND {date_query}"


def fetch_arxiv_entries(search_query: str, max_results: int) -> list[ET.Element]:
    params = urllib.parse.urlencode(
        {
            "search_query": search_query,
            "start": 0,
            "max_results": max_results,
            "sortBy": "submittedDate",
            "sortOrder": "descending",
        }
    )
    request = urllib.request.Request(
        f"{ARXIV_API_URL}?{params}",
        headers={"User-Agent": "paper-translation-collector/0.1"},
    )

    with urllib.request.urlopen(request, timeout=30) as response:
        payload = response.read()

    root = ET.fromstring(payload)
    return root.findall("atom:entry", ATOM_NS)


def text_of(entry: ET.Element, tag: str) -> str:
    node = entry.find(f"atom:{tag}", ATOM_NS)
    return normalize_space(node.text if node is not None else "")


def links_for(entry: ET.Element) -> tuple[str, str]:
    abs_url = text_of(entry, "id")
    paper_id = arxiv_id_from_url(abs_url)
    html_url = f"https://arxiv.org/html/{paper_id}"
    return html_url, abs_url


def parse_candidate(entry: ET.Element) -> Candidate | None:
    abs_url = text_of(entry, "id")
    if not abs_url:
        return None

    paper_id = arxiv_id_from_url(abs_url)
    title = text_of(entry, "title")
    summary = text_of(entry, "summary")
    combined = f"{title} {summary}"
    ai_matches = matched_terms(combined, AI_TERMS)
    memory_matches = matched_terms(combined, MEMORY_TERMS)

    if not ai_matches or not memory_matches:
        return None

    authors = [
        normalize_space(author.findtext("atom:name", default="", namespaces=ATOM_NS))
        for author in entry.findall("atom:author", ATOM_NS)
    ]
    html_url, abs_url = links_for(entry)
    score = len(ai_matches) + (len(memory_matches) * 2)

    return Candidate(
        id=paper_id,
        title=title,
        published=text_of(entry, "published"),
        updated=text_of(entry, "updated"),
        authors=[author for author in authors if author],
        summary=summary,
        html_url=html_url,
        abs_url=abs_url,
        matched_ai_terms=ai_matches,
        matched_memory_terms=memory_matches,
        score=score,
    )


def find_candidates(days: int, max_results: int, limit: int) -> list[Candidate]:
    end = datetime.now(timezone.utc)
    start = end - timedelta(days=days)
    existing_ids = load_existing_ids()
    search_query = build_search_query(start, end)
    entries = fetch_arxiv_entries(search_query, max_results=max_results)

    candidates: dict[str, Candidate] = {}
    for entry in entries:
        candidate = parse_candidate(entry)
        if not candidate:
            continue
        if candidate.id in existing_ids or base_arxiv_id(candidate.id) in existing_ids:
            continue
        candidates[candidate.id] = candidate

    ordered = sorted(
        candidates.values(),
        key=lambda item: (item.score, item.published),
        reverse=True,
    )
    return ordered[:limit]


def print_text(candidates: list[Candidate]) -> None:
    if not candidates:
        print("No new matching arXiv papers found.")
        return

    print(f"Found {len(candidates)} new matching arXiv paper(s):")
    for index, candidate in enumerate(candidates, start=1):
        authors = ", ".join(candidate.authors[:5])
        if len(candidate.authors) > 5:
            authors += ", et al."
        print(f"{index}. {candidate.id} | {candidate.title}")
        print(f"   Authors: {authors or 'Unknown'}")
        print(f"   Published: {candidate.published}")
        print(f"   HTML: {candidate.html_url}")
        print(f"   ABS: {candidate.abs_url}")
        print(f"   AI terms: {', '.join(candidate.matched_ai_terms)}")
        print(f"   Memory terms: {', '.join(candidate.matched_memory_terms)}")


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Find new arXiv papers related to AI and memory technologies."
    )
    parser.add_argument("--days", type=int, default=2, help="UTC lookback window.")
    parser.add_argument("--max-results", type=int, default=50)
    parser.add_argument("--limit", type=int, default=5)
    parser.add_argument("--json", action="store_true", help="Print JSON output.")
    args = parser.parse_args()

    candidates = find_candidates(
        days=args.days,
        max_results=args.max_results,
        limit=args.limit,
    )

    if args.json:
        print(json.dumps([asdict(candidate) for candidate in candidates], ensure_ascii=False, indent=2))
    else:
        print_text(candidates)

    time.sleep(0.5)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
