import os
import sys
import json
import re
import urllib.request
from bs4 import BeautifulSoup
from datetime import datetime

def init_paper(url):
    # 1. Extract Paper ID from URL
    # Example URL: https://arxiv.org/html/2403.00001v1 or https://arxiv.org/abs/2403.00001
    id_match = re.search(r'(?:html|abs)/([^/]+)', url)
    if not id_match:
        print("Error: Could not extract Paper ID from URL.")
        return
    
    paper_id = id_match.group(1).split('?')[0].split('#')[0]
    # If it's an /abs/ link, convert to /html/ for downloading
    if "/abs/" in url:
        url = url.replace("/abs/", "/html/")
    
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
        # Use a User-Agent to avoid being blocked
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
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
    
    title = ""
    title_el = soup.find('h1', class_='title')
    if title_el:
        title = title_el.get_text(strip=True)
        if title.startswith("Title:"):
            title = title[6:].strip()

    authors = ""
    authors_el = soup.find('div', class_='authors')
    if authors_el:
        authors = authors_el.get_text(strip=True)

    abstract = ""
    abstract_el = soup.find('div', class_='abstract')
    if abstract_el:
        abstract_text = abstract_el.get_text(strip=True)
        if abstract_text.startswith("Abstract:"):
            abstract = abstract_text[9:].strip()
        else:
            abstract = abstract_text

    # 5. Download Images
    img_tags = soup.find_all('img')
    print(f"[*] Found {len(img_tags)} images. Downloading...")
    
    for img in img_tags:
        src = img.get('src')
        if src:
            # Handle relative paths for arXiv
            img_url = f"{url}/{src}" if not src.startswith('http') else src
            img_name = os.path.basename(src)
            img_path = os.path.join(figures_path, img_name)
            
            try:
                print(f"    - Downloading {img_name}...")
                req = urllib.request.Request(img_url, headers=headers)
                with urllib.request.urlopen(req) as response:
                    with open(img_path, "wb") as f:
                        f.write(response.read())
            except Exception as e:
                print(f"    - Failed to download {img_name}: {e}")

    # 6. Create meta.json
    meta = {
        "id": paper_id,
        "title": title,
        "authors": authors,
        "abstract": abstract,
        "url": url,
        "date": datetime.now().strftime("%Y-%m-%d")
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

        <!-- 
        TIP: 
        1. 이미지 삽입 시: <figure><img src="figures/이미지명.png"><figcaption>설정</figcaption></figure>
        2. 하이라이트 박스: <div class="info-box">...</div>
        3. 표-카드 변환: <div class="table-grid"><div class="table-card">...</div></div>
        -->

    </div>
</body>
</html>
"""
    with open(f"{base_path}/ko.html", "w", encoding="utf-8") as f:
        f.write(skeleton_html)
    print(f"[*] Created skeleton ko.html")


    # 8. Update scripts/data.js (Simple append strategy)
    print(f"[*] Updating scripts/data.js...")
    try:
        with open("scripts/data.js", "r", encoding="utf-8") as f:
            data_content = f.read()
        
        # Look for the end of the papers array
        # This is a bit hacky but works for the current structure
        new_entry = f""",
    {{
      id: "{paper_id}",
      title: "{title}",
      authors: "{authors}",
      date: "{meta['date']}",
      abstract: "{abstract[:150]}...",
      originalUrl: "{url}"
    }}"""
        
        # Insert before the closing bracket of the array
        updated_content = re.sub(r'\]\s*\}\s*;', new_entry + r'\n  ]\n};', data_content)
        
        with open("scripts/data.js", "w", encoding="utf-8") as f:
            f.write(updated_content)
        print(f"[*] scripts/data.js updated.")
    except Exception as e:
        print(f"[*] Warning: Could not update scripts/data.js automatically: {e}")

    print(f"\n[✔] Setup complete for {paper_id}!")
    print(f"    - Original: {orig_html_path}")
    print(f"    - Translation: {base_path}/ko.html")
    print(f"    - Metadata: {base_path}/meta.json")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python scripts/init_paper.py [arXiv_HTML_URL]")
    else:
        init_paper(sys.argv[1])
