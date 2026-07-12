from pathlib import Path
import re

root = Path(r"c:\Users\FA506\Documents\Footage Archive\yo-what-main")
files = [root / name for name in ["cartaB.html","cartaC.html","cartaD.html","cartaE.html","comentariosA.html","mensajesA.html"]]
css_re = re.compile(r'body\.locked[\s\S]*?\.lock-error\s*\{[\s\S]*?\n\s*\}', re.MULTILINE)
markup_re = re.compile(r'<div id="pageLock" class="page-lock"[\s\S]*?<div class="lock-box">[\s\S]*?</div>\s*</div>', re.MULTILINE)
for path in files:
    text = path.read_text(encoding='utf-8')
    print(f"\n=== {path.name} ===")
    css_matches = list(css_re.finditer(text))
    print(f"CSS blocks: {len(css_matches)}")
    if css_matches:
        m = css_matches[0]
        start = max(0, m.start()-80)
        end = min(len(text), m.end()+80)
        print(text[start:end].replace('\n','\\n')[:1000])
    markup_matches = list(markup_re.finditer(text))
    print(f"pageLock markup blocks: {len(markup_matches)}")
    if markup_matches:
        m = markup_matches[0]
        start = max(0, m.start()-80)
        end = min(len(text), m.end()+80)
        print(text[start:end].replace('\n','\\n')[:1000])
