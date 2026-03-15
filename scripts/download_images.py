import os
import urllib.request

base_dir = r"c:\Users\rkdeh\Desktop\dev\vibe_coding\paper-viewer\papers\2603.05225v1\figures"
os.makedirs(base_dir, exist_ok=True)

images = [
    "Picture1.png",
    "Picture2.png",
    "Picture3.png",
    "Picture4.png"
]

base_url = "https://arxiv.org/html/2603.05225v1/figures/"

for img in images:
    url = base_url + img
    path = os.path.join(base_dir, img)
    print(f"Downloading {url} to {path}...")
    try:
        urllib.request.urlretrieve(url, path)
        print("Success.")
    except Exception as e:
        print(f"Failed: {e}")
