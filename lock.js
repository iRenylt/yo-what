const PIN_CORRECTO = "0906";

// Priorizar la animación inicial: ocultar todo excepto el splash y el overlay
// hasta que se complete el proceso de bloqueo/desbloqueo. Esto evita
// cualquier "flash" de contenido detrás de la animación incluso al recargar.
(function ensureInitialSplashPriority() {
    try {
        const css = `
        /* Oculta todo menos #initialSplash y #pageLock durante la inicialización */
        .initializing > *:not(#initialSplash):not(#pageLock) { visibility: hidden !important; }
        html.initializing, body.initializing { background: #000 !important; }
        `;

        const style = document.createElement('style');
        style.id = 'initializing-style';
        style.appendChild(document.createTextNode(css));
        (document.head || document.documentElement).appendChild(style);

        // Añadimos la marca de inicialización lo antes posible al <body>
        // (NO al <html> para evitar ocultar todo el <body> accidentalmente).
        if (document.body) {
            document.body.classList.add('initializing');
        } else {
            document.addEventListener('DOMContentLoaded', () => document.body.classList.add('initializing'));
        }
    } catch (e) {
        console.error('No se pudo aplicar initializing-style:', e);
    }

    // Función utilitaria para quitar la clase y el estilo cuando sea seguro
    window.__removeInitializing = function removeInitializing() {
        try {
            if (document.body) document.body.classList.remove('initializing');
            const s = document.getElementById('initializing-style');
            if (s && s.parentNode) s.parentNode.removeChild(s);
            try { delete window.__removeInitializing; } catch (e) {}
        } catch (e) {
            console.error('removeInitializing fallo:', e);
        }
    };
})();

// Inyecta estilos modernos y responsivos para la pantalla de PIN
function injectPinStyles() {
    if (document.getElementById('pin-styles')) return;
    const css = `
    /* Pin styles injected by lock.js - responsive + accessible */
    .page-lock { display: none; align-items: center; justify-content: center; }
    .page-lock.active { display: flex; }
    .page-lock { position: fixed; inset: 0; background: rgba(0,0,0,0.98); z-index: 99999; padding: 20px; }
    .page-lock.force-solid { backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }
    .lock-box { width: min(92%, 420px); max-width: 92vw; border-radius: 18px; padding: clamp(18px, 3.2vw, 36px); background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); border: 1px solid rgba(255,255,255,0.06); box-shadow: 0 20px 50px rgba(0,0,0,0.6); text-align: center; transform-origin: center; }
    .lock-box h2 { font-size: clamp(1rem, 3.4vw, 1.6rem); margin-bottom: 8px; letter-spacing: 4px; }
    .lock-box p { margin: 0 0 18px; color: rgba(255,255,255,0.65); font-size: 0.85rem; letter-spacing: 2px; }
    .lock-box input { width: 100%; padding: 14px 16px; font-size: 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.02); color: #fff; outline: none; transition: box-shadow 220ms ease, transform 200ms ease, border-color 200ms ease; text-align: center; }
    .lock-box input:focus { box-shadow: 0 6px 20px rgba(0,0,0,0.6), 0 0 14px rgba(255,183,213,0.06); border-color: rgba(255,255,255,0.18); }
    .lock-box button { margin-top: 12px; padding: 12px 34px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.12); background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02)); color: #fff; cursor: pointer; transition: transform 220ms cubic-bezier(.2,.9,.3,1), box-shadow 220ms; }
    .lock-box button:active { transform: translateY(1px) scale(0.998); }
    .lock-box button:hover { box-shadow: 0 10px 30px rgba(0,0,0,0.6); }
    .lock-error { color: #ff6b6b; font-size: 0.85rem; margin-top: 12px; display: none; }
    .lock-error.show { display: block; animation: shake 420ms ease; }
    @keyframes shake { 0% { transform: translateX(0); } 25% { transform: translateX(-6px); } 50% { transform: translateX(6px); } 75% { transform: translateX(-4px); } 100% { transform: translateX(0); } }
    .page-lock.unlocking { transition: opacity 420ms ease, transform 420ms ease; opacity: 0; transform: scale(1.03); }
    @media (max-width: 480px) { .lock-box { padding: 14px; border-radius: 12px; } .lock-box h2 { letter-spacing: 2px; } }
    `;

    const style = document.createElement('style');
    style.id = 'pin-styles';
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
}

document.addEventListener('DOMContentLoaded', injectPinStyles);

/* ============================= */
/* 🔒 BLOQUEO Y AUTENTICACIÓN */
/* ============================= */

function actualizarUltimaActividad() {
    localStorage.setItem('lastActivity', Date.now());
}

// Splash inicial: mostrar logo de la web al abrir, luego desaparecer y mostrar PIN
function showInitialLogoSplash() {
    try {
        const splash = document.createElement('div');
        splash.id = 'initialSplash';
        // Asegurarnos de que el splash actúe como pantalla de bloqueo
        // para que no se vea el contenido detrás mientras aparece.
        splash.classList.add('page-lock');
        // Activar el estado locked previamente para ocultar el resto
        // del contenido mientras el splash esté presente.
        document.body.classList.add('locked');
        Object.assign(splash.style, {
            position: 'fixed',
            inset: '0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,1)',
            zIndex: '99999',
            transition: 'opacity 600ms ease, transform 700ms ease',
            padding: '20px'
        });

        // Contenedor interno para centrar imagen + texto y controlar responsividad
        const inner = document.createElement('div');
        Object.assign(inner.style, {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '18px',
            textAlign: 'center'
        });

        // Intentamos obtener el favicon de la página; si no existe, usamos la URL por defecto
        const iconHref = (document.querySelector('link[rel="icon"]') || document.querySelector('link[rel~="icon"]'))?.href || 'https://i.imgur.com/GtphDVv.png';

        const img = document.createElement('img');
        img.src = iconHref;
        img.alt = document.title ? `${document.title} logo` : 'Logo';
        Object.assign(img.style, {
            width: 'min(44vw, 220px)',
            maxWidth: '220px',
            height: 'auto',
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
            opacity: '0',
            transform: 'translateY(8px) scale(0.97)',
            transition: 'all 500ms cubic-bezier(0.22,1,0.36,1)'
        });

        const logo = document.createElement('div');
        const logoText = document.title && document.title.trim() ? document.title : 'FOOTAGE ARCHIVE';
        logo.textContent = logoText.toUpperCase();
        Object.assign(logo.style, {
            color: '#fff',
            fontSize: 'clamp(1.6rem, 4vw, 3.2rem)',
            fontWeight: '700',
            letterSpacing: '6px',
            opacity: '0',
            transform: 'translateY(6px)',
            transition: 'opacity 600ms ease, transform 700ms cubic-bezier(0.22,1,0.36,1)',
            textTransform: 'uppercase',
            textAlign: 'center',
            padding: '0 8px',
            maxWidth: '90vw',
            wordBreak: 'break-word'
        });

        inner.appendChild(img);
        inner.appendChild(logo);
        splash.appendChild(inner);
        document.body.appendChild(splash);

        // Entrada suave secuenciada (imagen primero, texto después)
        requestAnimationFrame(() => {
            setTimeout(() => {
                img.style.opacity = '1';
                img.style.transform = 'translateY(0) scale(1)';
            }, 50);

            setTimeout(() => {
                logo.style.opacity = '1';
                logo.style.transform = 'translateY(0)';
            }, 180);
        });

        // Mantener visible un instante y luego desvanecer splash
        setTimeout(() => {
            // Antes de hacer el splash totalmente transparente, activamos
            // el overlay oficial de bloqueo para que haga de fondo sólido
            // y evitar que el contenido subyacente quede visible.
            try { verificarBloqueo(); } catch (e) { /* no bloquear si falla */ }
            splash.style.opacity = '0';
            splash.style.transform = 'scale(1.04)';
            // impedir interacciones mientras se desvanece
            splash.style.pointerEvents = 'none';
        }, 1800);

        // Remover splash después de que el overlay ya esté activo
        setTimeout(() => {
            if (splash && splash.parentNode) splash.parentNode.removeChild(splash);
        }, 2050);
    } catch (err) {
        // En caso de fallo, caer al comportamiento anterior
        console.error('showInitialLogoSplash fallo:', err);
        verificarBloqueo();
    }
}

function verificarBloqueo() {
    document.body.classList.add("locked");
    const pageLock = document.getElementById("pageLock");
    if (pageLock) {
        // Asegurar que el overlay cubre todo y evita que se vea contenido detrás
        pageLock.style.display = '';
        pageLock.classList.add('active');
        pageLock.style.pointerEvents = 'auto';
        pageLock.style.zIndex = '99999';
        // Forzar fondo oscuro (algunos navegadores ignoran backdrop cuando se enfoca teclado móvil)
        pageLock.style.backgroundColor = '#000';
        pageLock.style.backdropFilter = 'blur(20px)';

        // Mejorar accesibilidad y foco en el input PIN
        const pin = document.getElementById('pinInput');
        if (pin) {
            pin.setAttribute('aria-label', 'PIN de seguridad');
            pin.setAttribute('autocomplete', 'off');
            pin.setAttribute('inputmode', 'numeric');
            pin.style.fontSize = pin.style.fontSize || '16px';
            setTimeout(() => { try { pin.focus(); } catch(e){} }, 60);
        }
    }
}

function showWelcomeAnimation() {
    const pageLock = document.getElementById("pageLock");
    if (!pageLock) return;
    // Forzar overlay opaco mientras dure la animación de bienvenida
    pageLock.style.display = 'flex';
    pageLock.style.backgroundColor = '#000';
    pageLock.style.zIndex = '99999';
    pageLock.style.opacity = '1';
    pageLock.style.pointerEvents = 'auto';
    pageLock.style.backdropFilter = 'blur(20px)';
    // evitar fugas visuales en móviles: desactivar backdrop-filter vía clase
    pageLock.classList.add('force-solid');

    const lockBox = pageLock.querySelector('.lock-box');
    lockBox.style.transition = "all 1s cubic-bezier(0.19, 1, 0.22, 1)";
    lockBox.style.opacity = "0";
    lockBox.style.transform = "scale(0.8) translateY(-50px)";
    lockBox.style.filter = "blur(10px)";

    setTimeout(() => {
        pageLock.innerHTML = `
            <div style="text-align: center; color: white; width: 100%; max-width: 500px; padding: 20px;">
                <div id="welcomeIcon" style="
                    font-size: 4rem; 
                    margin-bottom: 20px; 
                    opacity: 0; 
                    transform: scale(0.5);
                    transition: all 1s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                ">❤️</div>
                <h1 id="welcomeText" style="
                    font-size: 3.5rem;
                    font-weight: 400;
                    background: linear-gradient(to bottom, #fff, #aaa);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    opacity: 0;
                    transform: translateY(30px);
                    transition: all 1.2s cubic-bezier(0.19, 1, 0.22, 1);
                    letter-spacing: 8px;
                    margin-bottom: 15px;
                    text-transform: uppercase;
                ">
                    HOLA NOHELIA
                </h1>
                <p id="welcomeSub" style="
                    font-size: 0.9rem;
                    letter-spacing: 12px;
                    color: rgba(255,255,255,0.4);
                    opacity: 0;
                    transform: translateY(10px);
                    transition: all 1s ease 0.4s;
                    text-transform: uppercase;
                ">
                    TU ARCHIVO ESTÁ LISTO
                </p>
                <div id="welcomeLine" style="
                    width: 0;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, #fff, transparent);
                    margin: 30px auto;
                    transition: width 2s cubic-bezier(0.19, 1, 0.22, 1) 0.6s;
                "></div>
                <p id="welcomeFinal" style="
                    font-size: 0.7rem;
                    color: rgba(255,255,255,0.2);
                    opacity: 0;
                    transition: all 1s ease 1s;
                    letter-spacing: 4px;
                ">DESBLOQUEANDO RECUERDOS...</p>
            </div>
        `; 

        setTimeout(() => {
            document.getElementById('welcomeIcon').style.opacity = '1';
            document.getElementById('welcomeIcon').style.transform = 'scale(1)';
            document.getElementById('welcomeText').style.opacity = '1';
            document.getElementById('welcomeText').style.transform = 'translateY(0)';
            document.getElementById('welcomeSub').style.opacity = '1';
            document.getElementById('welcomeSub').style.transform = 'translateY(0)';
            document.getElementById('welcomeLine').style.width = '100%';
            document.getElementById('welcomeFinal').style.opacity = '1';
        }, 100);

        setTimeout(() => {
            // Hacemos fade-out (sin volver transparente el fondo antes de tiempo)
            pageLock.style.transition = 'opacity 1.2s cubic-bezier(0.19, 1, 0.22, 1), transform 1.2s ease';
            pageLock.style.opacity = '0';
            pageLock.style.transform = 'scale(1.04)';

            setTimeout(() => {
                pageLock.style.display = 'none';
                pageLock.classList.remove('force-solid');
                document.body.classList.remove("locked");
                if (typeof window.__removeInitializing === 'function') window.__removeInitializing();
                actualizarUltimaActividad();
                loadAvatarFromDB(); // 👈 AQUI TAMBIÉN
            }, 1200);

        }, 4000);
    }, 800);
}

function unlockPage() {
    const input = document.getElementById("pinInput").value;
    const error = document.getElementById("errorMsg");

    if (error) error.style.display = "none";

    if (input === PIN_CORRECTO) {
        const isIndex =
            window.location.pathname.endsWith('index.html') ||
            window.location.pathname === '/' ||
            window.location.pathname.endsWith('/');

        if (isIndex) {
            showWelcomeAnimation();
        } else {
            const pageLock = document.getElementById("pageLock");
            if (pageLock) {
                // animación de salida suave
                pageLock.classList.add('unlocking');
                setTimeout(() => {
                    pageLock.classList.remove('active');
                    pageLock.classList.remove('unlocking');
                    pageLock.style.display = 'none';
                }, 420);
            }
            document.body.classList.remove("locked");
            if (typeof window.__removeInitializing === 'function') window.__removeInitializing();
            actualizarUltimaActividad();
            if (typeof loadAvatarFromDB === 'function') loadAvatarFromDB(); // 👈 AQUI
        }
    } else {
        if (error) error.style.display = "block";
    }
}

/* ============================= */
/* 🚫 BLOQUEO INICIAL FORZADO */
/* ============================= */

    document.addEventListener('DOMContentLoaded', () => {
        // Mostrar splash del logo solamente al abrir el index.
        // En otras páginas mostramos el bloqueo inmediatamente para evitar esperas.
        const isIndex =
            window.location.pathname.endsWith('index.html') ||
            window.location.pathname === '/' ||
            window.location.pathname.endsWith('/');

        if (isIndex) {
            // Animación de entrada y luego bloqueo
            showInitialLogoSplash();
        } else {
            // Evitar splash en páginas internas: mostrar bloqueo directamente
            verificarBloqueo();
        }
    });

    // Evitar zoom automático en iOS al enfocar/ocultar el teclado en el input del PIN
    document.addEventListener('DOMContentLoaded', () => {
        const pinInput = document.getElementById('pinInput');
        if (!pinInput) return;

        function isIOS() {
            return /iP(ad|hone|od)/.test(navigator.userAgent) && !window.MSStream;
        }

        const metaViewport = document.querySelector('meta[name=viewport]');
        const originalViewport = metaViewport ? metaViewport.getAttribute('content') : 'width=device-width, initial-scale=1.0';

        // Aseguramos tamaño de fuente mínimo 16px para evitar zoom en iOS como primera defensa
        pinInput.style.fontSize = '16px';

        if (isIOS()) {
            pinInput.addEventListener('focus', () => {
                if (metaViewport) metaViewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1');
                document.documentElement.style['-webkit-text-size-adjust'] = '100%';
            });

            pinInput.addEventListener('blur', () => {
                // esperamos un poco para dejar que el teclado se oculte antes de restaurar
                setTimeout(() => {
                    if (metaViewport) metaViewport.setAttribute('content', originalViewport);
                    document.documentElement.style['-webkit-text-size-adjust'] = '';
                }, 300);
            });
        }
    });

// Forzar overlay sólido mientras el input PIN esté enfocado (workaround cross-platform)
document.addEventListener('DOMContentLoaded', () => {
    const pin = document.getElementById('pinInput');
    const pageLock = document.getElementById('pageLock');
    if (!pin || !pageLock) return;

    pin.addEventListener('focus', () => {
        pageLock.classList.add('force-solid');
    });

    pin.addEventListener('blur', () => {
        // dejar un pequeño margen para que el teclado se oculte
        setTimeout(() => pageLock.classList.remove('force-solid'), 250);
    });
});

/* ============================= */
/* 💬 COMENTARIOS (SUPABASE) */
/* ============================= */

const SUPABASE_URL =
    "https://xcjzydmprmbpbqkacjwb.supabase.co/";

const SUPABASE_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhjanp5ZG1wcm1icGJxa2FjandiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwNzY1NjEsImV4cCI6MjA4MzY1MjU2MX0.Bpr4H2iZPl5JWW8rTXp4nBiB1Z_c7pIhKXiThydeNUw";

document.addEventListener("DOMContentLoaded", () => {
    const boton = document.getElementById("enviar");
    const textarea = document.getElementById("mensaje");

    if (!boton || !textarea) return;

    function enviarComentario() {
        const mensaje = textarea.value.trim();
        if (!mensaje) {
            alert("Escribe algo primero antes de enviar 😊");
            return;
        }

            fetch("https://xcjzydmprmbpbqkacjwb.supabase.co/rest/v1/comentarios", {
            method: "POST",
            headers: {
                "apikey": SUPABASE_KEY,
                "Authorization": "Bearer " + SUPABASE_KEY,
                "Content-Type": "application/json",
                "Prefer": "return=minimal"
            },
            body: JSON.stringify({ mensaje })
        })
        .then(res => {
            if (!res.ok) throw new Error("Error al guardar el mensaje 😓");
            textarea.value = "";
            alert("Guardado y enviado ❤️");
        })
        .catch(err => {
            console.error(err);
            alert("Error al guardar el mensaje 😓");
        });
    }

    boton.addEventListener("click", enviarComentario);
});

/* ============================= */
/* 🖼️ AVATAR COMPARTIDO (SUPABASE) */
/* ============================= */

    document.addEventListener("DOMContentLoaded", () => {
        const avatar = document.getElementById("dynamicAvatar");
        const avatarInput = document.getElementById("avatarInput");

        if (!avatar || !avatarInput) return;

        function isTouchDevice() {
            return (('ontouchstart' in window) || navigator.maxTouchPoints > 0 || window.matchMedia('(pointer: coarse)').matches);
        }

        // En móviles/táctil: un solo toque abre el selector. En escritorio: doble-clic para evitar subidas accidentales.
        if (isTouchDevice()) {
            avatar.addEventListener("click", () => {
                // marcar que el upload fue solicitado (para evitar conflictos con secretos)
                window.lastAvatarUploadTrigger = Date.now();
                avatarInput.click();
            });
            avatar.setAttribute('title', 'Toca para cambiar avatar');
            avatar.setAttribute('aria-label', 'Toca para cambiar avatar');
        } else {
            avatar.addEventListener("dblclick", () => {
                window.lastAvatarUploadTrigger = Date.now();
                avatarInput.click();
            });
            avatar.setAttribute('title', 'Doble clic para cambiar avatar');
            avatar.setAttribute('aria-label', 'Doble clic para cambiar avatar');
        }

        avatarInput.addEventListener("change", async () => {
            const file = avatarInput.files[0];
            if (!file) return;

            // marcar inicio de la operación y evitar que secretos se activen en los siguientes segundos
            window.lastAvatarUploadAt = Date.now();

            await uploadAvatar(file);

            // un pequeño margen temporal más después de una subida
            window.lastAvatarUploadAt = Date.now();
        });

        // Cargar avatar guardado al iniciar (sin esperar desbloqueo)
        if (typeof loadAvatarFromDB === 'function') {
            loadAvatarFromDB().catch(err => console.error('loadAvatarFromDB fallo:', err));
        }

});

async function uploadAvatar(file) {
    const fileExt = file.name.split(".").pop();
    const fileName = `avatar-${Date.now()}.${fileExt}`;

    const response = await fetch(
        `${SUPABASE_URL}storage/v1/object/avatars/${fileName}`,
        {
            method: "PUT",
            headers: {
                "apikey": SUPABASE_KEY,
                "Authorization": "Bearer " + SUPABASE_KEY,
                "Content-Type": file.type,
                "x-upsert": "true"
            },
            body: file
        }
    );

    if (!response.ok) {
        const errorText = await response.text();
        console.error("STORAGE ERROR:", response.status, errorText);
        alert("Error subiendo la imagen 😓\nMira la consola");
        return;
    }

    const publicUrl =
        `${SUPABASE_URL}storage/v1/object/public/avatars/${fileName}`;

    await saveAvatarUrl(publicUrl);
}



async function saveAvatarUrl(url) {
    // Intento PATCH (actualizar fila existente)
    let res = await fetch(
        `${SUPABASE_URL}/rest/v1/avatar_state?id=eq.1`,
        {
            method: "PATCH",
            headers: {
                "apikey": SUPABASE_KEY,
                "Authorization": "Bearer " + SUPABASE_KEY,
                "Content-Type": "application/json",
                "Prefer": "return=minimal"
            },
            body: JSON.stringify({
                image_url: url,
                updated_at: new Date().toISOString()
            })
        }
    );

    // Si no existía la fila (PATCH falló), intentamos INSERTar (crear)
    if (!res.ok) {
        try {
            res = await fetch(`${SUPABASE_URL}/rest/v1/avatar_state`, {
                method: 'POST',
                headers: {
                    "apikey": SUPABASE_KEY,
                    "Authorization": "Bearer " + SUPABASE_KEY,
                    "Content-Type": "application/json",
                    "Prefer": "return=minimal"
                },
                body: JSON.stringify({ id: 1, image_url: url, updated_at: new Date().toISOString() })
            });
        } catch (err) {
            console.error('Error creando avatar_state:', err);
        }
    }

    const avatar = document.getElementById("dynamicAvatar");
    if (avatar) avatar.src = url + "?t=" + Date.now();

    // marcar timestamp de subida exitosa para evitar que secretos se activen inmediatamente después
    window.lastAvatarUploadAt = Date.now();

    // después de guardar en servidor, forzamos una carga inmediata para asegurar sincronía entre dispositivos
    if (typeof loadAvatarFromDB === 'function') {
        loadAvatarFromDB().catch(err => console.error('loadAvatarFromDB fallo tras guardar avatar:', err));
    }
}


async function loadAvatarFromDB() {
    const res = await fetch(
        `${SUPABASE_URL}/rest/v1/avatar_state?id=eq.1&select=image_url`,
        {
            headers: {
                "apikey": SUPABASE_KEY,
                "Authorization": "Bearer " + SUPABASE_KEY
            }
        }
    );

    const data = await res.json();
    if (data[0]?.image_url) {
        const url = data[0].image_url;
        const avatar = document.getElementById("dynamicAvatar");
        if (avatar) avatar.src = url + "?t=" + Date.now();
    }
}

// Poll periódico para mantener sincronizado el avatar entre dispositivos (cada 30s)
setInterval(() => {
    if (typeof loadAvatarFromDB === 'function') {
        loadAvatarFromDB().catch(err => console.error('Error sincronizando avatar:', err));
    }
}, 30000);

// Evitar flash blanco al navegar o recargar: forzamos fondo oscuro justo antes de navegar
document.addEventListener('DOMContentLoaded', () => {
    function protectBackground() {
        try {
            document.documentElement.style.backgroundColor = '#050505';
            if (document.body) document.body.style.background = '#050505';
        } catch (e) {}
    }

    // antes de recargar o salir
    window.addEventListener('beforeunload', protectBackground, {capture: true});

    // al hacer click en enlaces internos, forzar fondo oscuro inmediatamente
    document.querySelectorAll('a[href]').forEach(a => {
        a.addEventListener('click', (e) => {
            const href = a.getAttribute('href');
            if (!href) return;
            if (href.startsWith('#') || a.target === '_blank' || href.startsWith('mailto:') || href.startsWith('javascript:')) return;
            protectBackground();
        }, {passive: true});
    });
});
