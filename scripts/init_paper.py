import os
import sys
import json
import re
import urllib.request
import urllib.parse
from bs4 import BeautifulSoup
from datetime import datetime

def clean_text(text):
    if not text:
        return ""
    # Remove excessive whitespace and newlines
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def clean_authors(text: str) -> str:
    if not text:
        return ""
    # arXiv authors div often contains emails, footnotes, "Equal contribution" etc.
    # Remove emails
    text = re.sub(r'[\w\.-]+@[\w\.-]+', '', text)
    # Remove footnotemarks (common in arXiv)
    text = re.sub(r'footnotemark\s*:\s*\d+', '', text, flags=re.I)
    # Remove specific affiliations and unwanted text frequently found in ar5iv author divs
    patterns = [
        r'Equal contribution',
        r'Listing order is random',
        r'Work performed while at.*',
        r'Google Brain',
        r'Google Research',
        r'University of Toronto',
        r'[\w\s]*Research',
        r'[\w\s]*Brain',
        r'Jakob proposed.*',
        r'Ashish, with Illia.*',
        r'Noam proposed.*',
        r'Niki designed.*',
        r'Llion also.*',
        r'Lukasz and Aidan.*',
        r'Provided proper attribution is provided.*works\.'
    ]
    for p in patterns:
        text = re.sub(p, '', text, flags=re.I | re.DOTALL)
    
    # Remove dangling numbers (sometimes superscript links like 1, 2)
    text = re.sub(r'\b\d+\b', '', text)
    
    # Replace common author separators with commas
    text = text.replace('&', ',').replace(';', ',')
    
    # Flatten and clean
    text = clean_text(text)
    
    # Limit number of commas and filter out very short parts or common academic filler
    parts = []
    for p in text.split(','):
        p = p.strip()
        if p and len(p) > 2 and not re.match(r'^(and|with|the)$', p, re.I):
            parts.append(p)
    
    return ", ".join(parts)

def init_paper(url):
    # 1. Extract Paper ID from URL
    id_match = re.search(r'(?:html|abs)/([^/]+)', url)
    if not id_match:
        print("Error: Could not extract Paper ID from URL.")
        return
    
    paper_id = id_match.group(1).split('?')[0].split('#')[0]
    
    if "/abs/" in url:
        url = url.replace("/abs/", "/html/")
    
    base_url = url if url.endswith('/') else url + '/'
    
    print(f"[*] Processing Paper ID: {paper_id}")
    print(f"[*] Targeted HTML URL: {url}")

    # 2. Create Directory Structure
    base_path = f"papers/{paper_id}"
    figures_path = f"{base_path}/figures"
    os.makedirs(figures_path, exist_ok=True)
    print(f"[*] Created directory: {base_path}")

    # 3. Download Original HTML
    orig_html_path = f"{base_path}/orig.html"
    print(f"[*] Downloading original HTML...")
    try:
        headers = {'User-Agent': 'Mozilla/5.0'}
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as response:
            html_content = response.read().decode('utf-8')
        
        with open(orig_html_path, "w", encoding="utf-8") as f:
            f.write(html_content)
    except Exception as e:
        print(f"Error downloading HTML: {e}")
        return

    # 4. Parse Metadata and Images
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Improved metadata extraction targeting arXiv/ar5iv classes
    title = ""
    # 1. Try <title> tag first for high-level title
    if soup.title and soup.title.string:
        title = clean_text(soup.title.string)
    
    # 2. Try to find the document title in the body (more accurate for ar5iv)
    title_el = soup.find(['h1', 'h2'], class_=re.compile(r'ltx_title_document', re.I))
    if not title_el:
        # Fallback to general title class, but skip TOC entries
        # TOC entries often use ltx_ref_title or are inside a nav
        body = soup.body
        if body:
            # Look for title-like elements that are not in navigation
            for el in body.find_all(['h1', 'h2', 'span'], class_=re.compile(r'(ltx_title|title)', re.I)):
                if not el.find_parent('nav') and not any(p_class and 'toc' in str(p_class).lower() for p_class in el.get('class', [])):
                    text = clean_text(el.get_text())
                    if text and text.lower() != "abstract" and len(text) > 5:
                        title = text
                        break

    authors = ""
    # Prioritize div with class ltx_authors
    authors_el = soup.find('div', class_=re.compile(r'ltx_authors', re.I))
    if not authors_el:
        authors_el = soup.find(class_=re.compile(r'ltx_authors', re.I))
    if not authors_el:
        authors_el = soup.find(['div', 'span'], class_=re.compile(r'authors?', re.I))
    
    if authors_el:
        authors = clean_authors(authors_el.get_text())

    abstract = ""
    # Try ar5iv specific class
    abstract_el = soup.find(class_=re.compile(r'ltx_abstract', re.I))
    if not abstract_el:
        abstract_el = soup.find(['div', 'section'], class_=re.compile(r'abstract', re.I))
    
    if abstract_el:
        abs_text = abstract_el.get_text(separator=' ', strip=True)
        # Remove any leading "Abstract" text
        abs_text = re.sub(r'^abstract[:\s]*', '', abs_text, flags=re.I)
        abstract = clean_text(abs_text)

    # 5. Download Images
    img_tags = soup.find_all('img')
    print(f"[*] Found {len(img_tags)} images. Checking...")
    
    downloaded_count = 0
    headers = {'User-Agent': 'Mozilla/5.0'}
    for img in img_tags:
        src = img.get('src')
        if not src or src.startswith('data:'):
            continue
            
        if src.startswith(paper_id):
            parent_base = os.path.dirname(url.rstrip('/')) + '/'
            img_url = urllib.parse.urljoin(parent_base, src)
        else:
            img_url = urllib.parse.urljoin(base_url, src)
            
        img_name = os.path.basename(src)
        if len(img_name) > 100 or ';' in img_name:
            continue
            
        img_path = os.path.join(figures_path, img_name)
        
        try:
            print(f"    - Downloading {img_name}...")
            req = urllib.request.Request(img_url, headers=headers)
            with urllib.request.urlopen(req) as response:
                with open(img_path, "wb") as f:
                    f.write(response.read())
            downloaded_count += 1
        except Exception as e:
            print(f"    - Failed to download {img_name}: {e}")

    print(f"[*] Successfully downloaded {downloaded_count} images.")

    # 6. Create meta.json
    curr_date = datetime.now().strftime("%Y-%m-%d")
    meta = {
        "id": paper_id,
        "title": title,
        "authors": authors,
        "abstract": abstract,
        "url": url,
        "date": curr_date
    }
    
    with open(f"{base_path}/meta.json", "w", encoding="utf-8") as f:
        json.dump(meta, f, ensure_ascii=False, indent=2)
    print(f"[*] Created meta.json")

    # 7. Create Skeleton ko.html
    print(f"[*] Creating skeleton ko.html...")
    skeleton_html = f"""<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} - 한국어 번역</title>
    <link rel="stylesheet" href="../../styles/viewer.css">
</head>
<body>
    <div class="content-wrapper">
        <header class="viewer-header">
            <h1 id="title">{title}</h1>
            <p class="authors">{authors}</p>
        </header>

        <div class="executive-summary">
            <h2>핵심 요약 (Executive Summary)</h2>
            <div class="info-box">
                <p><strong>[번역된 초록 및 핵심 요약 내용이 들어갈 자리입니다.]</strong></p>
                <ul class="insight-list">
                    <li>핵심 인사이트 1</li>
                    <li>핵심 인사이트 2</li>
                </ul>
            </div>
        </div>

        <hr style="margin: 2rem 0; border: none; border-top: 1px solid var(--border-color);">

        <section id="section-1">
            <h2>1. 서론 (Introduction)</h2>
            <p>본문 번역을 여기에 작성하세요...</p>
        </section>

    </div>
</body>
</html>
"""
    with open(f"{base_path}/ko.html", "w", encoding="utf-8") as f:
        f.write(skeleton_html)
    print(f"[*] Created skeleton ko.html")


    # 8. Supabase sync is handled separately so the browser list has one source of truth.
    print(f"[*] Local files are ready. To publish metadata/content to Supabase, run:")
    print(f"    npm run sync:papers -- --id {paper_id}")

    print(f"\n[✔] Setup complete for {paper_id}!")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python scripts/init_paper.py [arXiv_HTML_URL]")
    else:
        init_paper(sys.argv[1])
