import urllib.request
import json
import sys
import re
from bs4 import BeautifulSoup
import os

url = "https://arxiv.org/html/2603.05225v1"
html_path = "papers/2603.05225v1/orig.html"

with open(html_path, 'r', encoding='utf-8') as f:
    html_content = f.read()

soup = BeautifulSoup(html_content, 'html.parser')

title = ""
title_el = soup.find('h1', class_='title')
if title_el:
    title = title_el.get_text(strip=True)

authors = ""
authors_el = soup.find('div', class_='authors')
if authors_el:
    authors = authors_el.get_text(strip=True)

abstract = ""
abstract_el = soup.find('div', class_='abstract')
if abstract_el:
    abstract = abstract_el.get_text(strip=True)
    if abstract.startswith("Abstract"):
        abstract = abstract[8:].strip()

meta = {
    "title": title,
    "authors": authors,
    "abstract": abstract,
    "url": url,
    "id": "2603.05225v1",
    "date": "2026-03-09" # Assume some date
}

with open("papers/2603.05225v1/meta.json", "w", encoding="utf-8") as f:
    json.dump(meta, f, ensure_ascii=False, indent=2)

print(json.dumps(meta, ensure_ascii=False))
