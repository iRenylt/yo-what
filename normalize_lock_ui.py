from pathlib import Path
import re

canonical_css = '''        body.locked { overflow: hidden !important; height: 100vh !important; }
        body.locked > *:not(.page-lock):not(.stars) { display: none !important; }

        .page-lock {
            position: fixed;
            inset: 0;
            background: #000 !important;
            z-index: 99999;
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(20px);
            -webkit-backface-visibility: hidden;
            backface-visibility: hidden;
        }

        .page-lock::before {
            content: '';
            position: absolute;
            inset: 0;
            background: #000;
            z-index: -1;
        }

        .page-lock.force-solid {
            -webkit-backdrop-filter: none !important;
            backdrop-filter: none !important;
            background: #000 !important;
        }

        .lock-box {
            text-align: center;
            padding: 40px;
            width: 90%;
            max-width: 400px;
            animation: lockFadeIn 1s ease-out;
        }

        @keyframes lockFadeIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
        }

        .lock-box h2 { 
            font-weight: 400; 
            margin-bottom: 30px; 
            letter-spacing: 4px; 
            color: #e8dfd5;
            text-shadow: 0 0 30px rgba(212, 165, 116, 0.25);
            font-size: 1.6rem;
        }

        .lock-box input {
            background: rgba(201, 184, 168, 0.06);
            border: 1.5px solid var(--border);
            color: #e8dfd5;
            padding: 15px 16px;
            border-radius: 14px;
            outline: none;
            text-align: center;
            font-size: 16px;
            -webkit-text-size-adjust: 100%;
            margin-bottom: 20px;
            width: 100%;
            transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .lock-box input:focus { 
            border-color: var(--border-hover);
            background: rgba(201, 184, 168, 0.12);
            box-shadow: 0 0 20px rgba(212, 165, 116, 0.2);
        }

        .lock-box button {
            background: linear-gradient(135deg, rgba(212,165,116,0.15), rgba(201,184,168,0.1));
            border: 1.5px solid var(--border);
            color: #d4a574;
            padding: 13px 42px;
            border-radius: 50px;
            cursor: pointer;
            text-transform: uppercase;
            letter-spacing: 2px;
            font-size: 0.8rem;
            font-weight: 600;
            transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .lock-box button:hover { 
            background: linear-gradient(135deg, rgba(212,165,116,0.25), rgba(201,184,168,0.18));
            border-color: var(--border-hover);
            transform: translateY(-3px);
            box-shadow: 0 8px 20px rgba(212, 165, 116, 0.3);
        }

        .lock-error {
            margin-top: 15px;
            color: #ff4444;
            font-size: 0.8rem;
            display: none;
        }
'''

canonical_markup = '''    <div id="pageLock" class="page-lock">
        <div class="lock-box">
            <h2 id="lockPhrase"></h2>
            <p style="font-size: 0.7rem; color: var(--text-dim); margin-bottom: 25px; letter-spacing: 3px;">REGISTROS FANTASMAS</p>
            <input type="password" id="pinInput" name="pin" placeholder="PIN SEGURIDAD" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">
            <button onclick="unlockPage()">Abrir Corazón</button>
            <div id="errorMsg" class="lock-error">INTENTA DE NUEVO</div>
        </div>
    </div>'''

files = [
    'cartaB.html',
    'cartaC.html',
    'cartaD.html',
    'cartaE.html',
    'comentariosA.html',
    'mensajesA.html',
]

for fn in files:
    path = Path(fn)
    if not path.exists():
        print(f'{fn}: missing file')
        continue
    text = path.read_text(encoding='utf-8')
    orig = text

    # Patch CSS block
    css_start = text.find('body.locked { overflow: hidden !important; height: 100vh !important; }')
    if css_start == -1:
        print(f'{fn}: CSS start not found')
        continue
    # find the end of the lock-error block after css_start
    lock_error_match = re.search(r'\.lock-error\s*\{[^}]*\}', text[css_start:])
    if not lock_error_match:
        print(f'{fn}: lock error block not found')
        continue
    css_end = css_start + lock_error_match.end()
    text = text[:css_start] + canonical_css + text[css_end:]

    # Patch markup block
    start_re = re.search(r'<div\s+id=["\']pageLock["\']\s+class=["\']page-lock["\']', text)
    if not start_re:
        print(f'{fn}: pageLock start not found')
        path.write_text(text, encoding='utf-8')
        continue
    markup_start = start_re.start()
    idx = markup_start
    depth = 0
    while idx < len(text):
        if text.startswith('<div', idx):
            depth += 1
            idx += 4
        elif text.startswith('</div>', idx):
            depth -= 1
            idx += 6
            if depth == 0:
                markup_end = idx
                break
        else:
            idx += 1
    else:
        print(f'{fn}: pageLock end not found')
        continue

    text = text[:markup_start] + canonical_markup + text[markup_end:]

    if text != orig:
        path.write_text(text, encoding='utf-8')
        print(f'{fn}: patched')
    else:
        print(f'{fn}: already canonical')
