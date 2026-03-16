from bs4 import BeautifulSoup
import os

with open('papers/1706.03762v7/orig.html', 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')

with open('scripts/debug_images.txt', 'w', encoding='utf-8') as out:
    out.write("--- IMG TAGS ---\n")
    for img in soup.find_all('img'):
        out.write(f"SRC: {img.get('src')}, ALT: {img.get('alt')}\n")
