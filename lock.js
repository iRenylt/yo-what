const PIN_CORRECTO = "0906";
const LOCK_PHRASES = [
    "REGISTROS FANTASMAS",
    "UN ARCHIVO SECRETO",
    "EN CADA MOMENTO",
    "CADA SEGUNDO CONTIGO",
    "RECUERDOS QUE VIVEN",
    "UN VIAJE ESPECIAL",
    "TÚ LUGAR ESPECIAL",
    "CORAZÓN EN LA MANO",
    "AMOR SIN MEDIDA",
    "MI DESTINO ERES TÚ",
    "EL TIEMPO SE DETIENE",
    "PARA TI, SIEMPRE"
];

function aplicarFraseAleatoriaDelBloqueo() {
    try {
        const phraseTarget = document.getElementById('lockPhrase') || document.querySelector('.lock-box h2') || document.querySelector('.page-lock h2');
        if (phraseTarget) {
            const phrase = LOCK_PHRASES[Math.floor(Math.random() * LOCK_PHRASES.length)];
            phraseTarget.textContent = phrase;
        }
    } catch (e) {
        console.warn('No se pudo aplicar la frase aleatoria del bloqueo:', e);
    }
}

// Priorizar la animación inicial: ocultar todo excepto el splash y el overlay
// hasta que se complete el proceso de bloqueo/desbloqueo. Esto evita
// cualquier "flash" de contenido detrás de la animación incluso al recargar.
(function ensureInitialSplashPriority() {
    try {
        const css = `
        /* Oculta todo menos #initialSplash, #pageLock, #devModal y .sakura durante la inicialización */
        .initializing > *:not(#initialSplash):not(#pageLock):not(#devModal):not(.sakura) { visibility: hidden !important; }
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
    @keyframes shimmer { 0% { background-position: -1000px 0; } 100% { background-position: 1000px 0; } }
    @keyframes glow { 0%, 100% { box-shadow: 0 20px 50px rgba(0,0,0,0.6), 0 0 40px rgba(200,200,220,0.05); } 50% { box-shadow: 0 20px 50px rgba(0,0,0,0.6), 0 0 60px rgba(200,200,220,0.15); } }
    @keyframes floatUp { 0% { transform: translateY(30px) scale(0.95); opacity: 0; } 100% { transform: translateY(0) scale(1); opacity: 1; } }
    @keyframes slideInFade { 0% { transform: translateY(20px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
    @keyframes shake { 0% { transform: translateX(0); } 25% { transform: translateX(-6px); } 50% { transform: translateX(6px); } 75% { transform: translateX(-4px); } 100% { transform: translateX(0); } }
    @keyframes pulseGlow { 0%, 100% { text-shadow: 0 0 30px rgba(200,200,220,0.15); } 50% { text-shadow: 0 0 50px rgba(200,200,220,0.3); } }
    @keyframes floatParticles { 0% { opacity: 0; transform: translateY(100vh) rotate(0deg); } 25% { opacity: 1; } 75% { opacity: 1; } 100% { opacity: 0; transform: translateY(-100vh) rotate(360deg); } }
    @keyframes borderGlow { 0%, 100% { border-color: rgba(200,200,220,0.15); } 50% { border-color: rgba(200,200,220,0.3); } }
    .page-lock { display: none; align-items: center; justify-content: center; }
    .page-lock.active { display: flex; }
    .page-lock { position: fixed; inset: 0; background: radial-gradient(circle at top, rgba(212,165,116,0.14), rgba(10,10,10,0.98)); z-index: 99999; padding: 20px; backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); }
    .page-lock.force-solid { backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }
    .lock-box { width: min(92%, 420px); max-width: 92vw; border-radius: 20px; padding: clamp(20px, 3.2vw, 40px); background: linear-gradient(180deg, rgba(255,244,224,0.08), rgba(212,165,116,0.04)); border: 1.5px solid rgba(212,165,116,0.28); box-shadow: 0 20px 50px rgba(0,0,0,0.6), 0 0 40px rgba(212,165,116,0.12); text-align: center; transform-origin: center; animation: glow 3s ease-in-out infinite, floatUp 0.8s cubic-bezier(0.19, 1, 0.22, 1); }
    .lock-box h2 { font-size: clamp(1.1rem, 3.4vw, 1.6rem); margin-bottom: 8px; letter-spacing: 4px; color: #f7e7c9; text-shadow: 0 0 30px rgba(212,165,116,0.2); animation: pulseGlow 2.5s ease-in-out infinite; }
    .lock-box p { margin: 0 0 20px; color: rgba(255,242,220,0.7); font-size: 0.85rem; letter-spacing: 2px; animation: slideInFade 0.8s ease-out 0.2s both; }
    .lock-box input { width: 100%; padding: 14px 16px; font-size: 16px; border-radius: 12px; border: 1.5px solid rgba(212,165,116,0.26); background: rgba(255,248,235,0.06); color: #fff; outline: none; transition: box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1), transform 280ms cubic-bezier(0.4, 0, 0.2, 1), border-color 280ms cubic-bezier(0.4, 0, 0.2, 1), background 280ms cubic-bezier(0.4, 0, 0.2, 1); text-align: center; animation: slideInFade 0.8s ease-out 0.3s both; }
    .lock-box input:focus { box-shadow: 0 6px 20px rgba(0,0,0,0.6), 0 0 30px rgba(212,165,116,0.16), inset 0 0 15px rgba(212,165,116,0.08); border-color: rgba(212,165,116,0.4); background: rgba(255,244,224,0.1); transform: translateY(-2px); }
    .lock-box button { margin-top: 14px; padding: 13px 36px; border-radius: 999px; border: 1.5px solid rgba(212,165,116,0.28); background: linear-gradient(135deg, rgba(212,165,116,0.22), rgba(232,196,143,0.12)); color: #fff; cursor: pointer; font-weight: 600; transition: transform 260ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 260ms cubic-bezier(0.4, 0, 0.2, 1), all 260ms cubic-bezier(0.4, 0, 0.2, 1); animation: slideInFade 0.8s ease-out 0.4s both; position: relative; overflow: hidden; }
    .lock-box button::before { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent); transform: translateX(-100%); transition: transform 400ms ease; }
    .lock-box button:hover::before { transform: translateX(100%); }
    .lock-box button:hover { background: linear-gradient(135deg, rgba(200,200,220,0.18), rgba(170,170,190,0.1)); border-color: rgba(200,200,220,0.35); box-shadow: 0 12px 35px rgba(200,200,220,0.15); transform: translateY(-3px); }
    .lock-box button:active { transform: translateY(-1px) scale(0.98); box-shadow: 0 4px 12px rgba(200,200,220,0.1); }
    .lock-error { color: #ff6b6b; font-size: 0.85rem; margin-top: 12px; display: none; animation: shake 420ms ease; }
    .lock-error.show { display: block; }
    .page-lock.unlocking { transition: opacity 480ms cubic-bezier(0.4, 0, 0.2, 1), transform 480ms cubic-bezier(0.4, 0, 0.2, 1); opacity: 0; transform: scale(1.08); }
    @media (max-width: 480px) { .lock-box { padding: 16px; border-radius: 14px; } .lock-box h2 { letter-spacing: 2px; } }
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
            zIndex: '99998',
            transition: 'opacity 700ms cubic-bezier(0.4, 0, 0.2, 1), transform 700ms cubic-bezier(0.4, 0, 0.2, 1), filter 700ms ease',
            padding: '20px',
            overflow: 'hidden'
        });

        // Contenedor para partículas de fondo
        const particlesContainer = document.createElement('div');
        Object.assign(particlesContainer.style, {
            position: 'absolute',
            inset: '0',
            pointerEvents: 'none',
            zIndex: '1'
        });
        
        // Crear partículas sutiles
        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            const delay = (i * 0.1) + 's';
            const duration = (2 + Math.random() * 1.5) + 's';
            const size = (Math.random() * 60 + 20) + 'px';
            Object.assign(particle.style, {
                position: 'absolute',
                width: size,
                height: size,
                borderRadius: '50%',
                background: `radial-gradient(circle, rgba(200,200,220,0.15), rgba(200,200,220,0))`,
                left: (Math.random() * 100) + '%',
                top: (Math.random() * 100) + '%',
                animation: `floatParticles ${duration} ease-in-out infinite`,
                animationDelay: delay,
                filter: 'blur(1px)'
            });
            particlesContainer.appendChild(particle);
        }
        splash.appendChild(particlesContainer);

        // Contenedor interno para centrar imagen + texto y controlar responsividad
        const inner = document.createElement('div');
        Object.assign(inner.style, {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '18px',
            textAlign: 'center',
            filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.8))',
            position: 'relative',
            zIndex: '2'
        });

        // Intentamos obtener el favicon de la página; si no existe, usamos la URL por defecto
        const iconHref = (document.querySelector('link[rel="icon"]') || document.querySelector('link[rel~="icon"]'))?.href || 'https://xcjzydmprmbpbqkacjwb.supabase.co/storage/v1/object/public/avatars/avatar.png';

        const img = document.createElement('img');
        img.src = iconHref;
        img.alt = document.title ? `${document.title} logo` : 'Logo';
        Object.assign(img.style, {
            width: 'min(44vw, 220px)',
            maxWidth: '220px',
            height: 'auto',
            borderRadius: '16px',
            boxShadow: '0 0 0 0 rgba(200,200,220,0.4), 0 20px 50px rgba(0,0,0,0.8)',
            opacity: '0',
            transform: 'translateY(20px) scale(0.92) rotateX(-15deg)',
            transition: 'all 700ms cubic-bezier(0.19, 1, 0.22, 1)',
            filter: 'brightness(0.95)'
        });

        const logo = document.createElement('div');
        const logoText = document.title && document.title.trim() ? document.title : 'FOOTAGE ARCHIVE';
        logo.textContent = logoText.toUpperCase();
        Object.assign(logo.style, {
            color: '#fff',
            fontSize: 'clamp(1.6rem, 4vw, 3.2rem)',
            fontWeight: '700',
            letterSpacing: '8px',
            opacity: '0',
            transform: 'translateY(15px)',
            transition: 'opacity 800ms ease, transform 800ms cubic-bezier(0.19, 1, 0.22, 1)',
            textTransform: 'uppercase',
            textAlign: 'center',
            padding: '0 8px',
            maxWidth: '90vw',
            wordBreak: 'break-word',
            backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.8), rgba(200,200,220,0.4), rgba(255,255,255,0.8))',
            backgroundSize: '200% 100%',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: 'none'
        });

        inner.appendChild(img);
        inner.appendChild(logo);
        splash.appendChild(inner);
        document.body.appendChild(splash);

        // Entrada suave secuenciada (imagen primero, texto después)
        requestAnimationFrame(() => {
            setTimeout(() => {
                img.style.opacity = '1';
                img.style.transform = 'translateY(0) scale(1) rotateX(0deg)';
                img.style.filter = 'brightness(1)';
            }, 80);

            setTimeout(() => {
                logo.style.opacity = '1';
                logo.style.transform = 'translateY(0)';
            }, 250);
        });

        // Mantener visible un instante y luego desvanecer splash
        setTimeout(() => {
            splash.style.opacity = '0';
            splash.style.transform = 'scale(1.06)';
            splash.style.filter = 'blur(8px)';
            // impedir interacciones mientras se desvanece
            splash.style.pointerEvents = 'none';
        }, 2000);

        // Remover splash después de que se desvanezca completamente
        setTimeout(() => {
            if (splash && splash.parentNode) splash.parentNode.removeChild(splash);
            // Después de remover el splash, mostrar el PIN
            try { verificarBloqueo(); } catch (e) { /* no bloquear si falla */ }
        }, 2350);
    } catch (err) {
        // En caso de fallo, caer al comportamiento anterior
        console.error('showInitialLogoSplash fallo:', err);
        verificarBloqueo();
    }
}

function bindPinInputEvents() {
    const pinInput = document.getElementById('pinInput');
    if (!pinInput || pinInput.dataset.pinBound === 'true') return;

    pinInput.dataset.pinBound = 'true';
    pinInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            unlockPage();
        }
    });
}

function verificarBloqueo() {
    document.body.classList.add("locked");
    const pageLock = document.getElementById("pageLock");
    if (!pageLock) {
        console.error('[lock.js] CRÍTICO: Elemento #pageLock no encontrado. El bloqueo no funcionará.');
        return;
    }
    if (pageLock) {
        aplicarFraseAleatoriaDelBloqueo();
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
            bindPinInputEvents();
            setTimeout(() => { try { pin.focus(); } catch(e){} }, 60);
        }
    }
}

function showWelcomeAnimation() {
    const pageLock = document.getElementById("pageLock");
    if (!pageLock) return;
    
    // Inyectar estilos para animaciones de bienvenida
    if (!document.getElementById('welcome-styles')) {
        const welcomeCss = `
        @keyframes fadeInScale { 0% { opacity: 0; transform: scale(0.7); } 100% { opacity: 1; transform: scale(1); } }
        @keyframes slideUpFade { 0% { opacity: 0; transform: translateY(40px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes heartBeat { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.15); } }
        @keyframes shimmerText { 0% { background-position: 0 0; } 100% { background-position: 200% 0; } }
        @keyframes lineGrow { 0% { width: 0; opacity: 0; } 50% { opacity: 1; } 100% { width: 100%; opacity: 0; } }
        #welcomeIcon { animation: fadeInScale 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), heartBeat 1.5s ease-in-out 0.5s infinite !important; }
        #welcomeText { animation: slideUpFade 1s cubic-bezier(0.19, 1, 0.22, 1) 0.3s both !important; }
        #welcomeSub { animation: slideUpFade 1s cubic-bezier(0.19, 1, 0.22, 1) 0.5s both !important; }
        #welcomeLine { animation: lineGrow 2s cubic-bezier(0.19, 1, 0.22, 1) 0.8s both !important; }
        #welcomeFinal { animation: slideUpFade 0.8s ease 1.2s both !important; }
        `;
        const style = document.createElement('style');
        style.id = 'welcome-styles';
        style.appendChild(document.createTextNode(welcomeCss));
        document.head.appendChild(style);
    }
    
    // Arrays de frases y emojis para la bienvenida
    const welcomePhrases = [
        "HOLA NOHELIA",
        "ME ALEGRA VERTE",
    ];
    
    const heartEmojis = [
        "❤️",
        "💖",
        "❣️"
    ];
    
    const subMessages = [
        "TU ARCHIVO ESTÁ LISTO",
        "RECUERDO COMPARTIDO LISTO",
        "MOMENTOS ESPECIALES LISTOS",
    ];
    
    // Seleccionar elementos aleatorios
    const selectedPhrase = welcomePhrases[Math.floor(Math.random() * welcomePhrases.length)];
    const selectedHeart = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
    const selectedSub = subMessages[Math.floor(Math.random() * subMessages.length)];
    
    // Forzar overlay opaco mientras dure la animación de bienvenida
    pageLock.style.display = 'flex';
    pageLock.style.backgroundColor = '#000';
    pageLock.style.zIndex = '99999';
    pageLock.style.opacity = '1';
    pageLock.style.pointerEvents = 'auto';
    pageLock.style.backdropFilter = 'blur(20px)';
    pageLock.style.transition = 'all 1.2s cubic-bezier(0.19, 1, 0.22, 1)';
    // evitar fugas visuales en móviles: desactivar backdrop-filter vía clase
    pageLock.classList.add('force-solid');

    const lockBox = pageLock.querySelector('.lock-box');
    if (lockBox) {
        lockBox.style.transition = "all 1.2s cubic-bezier(0.19, 1, 0.22, 1)";
        lockBox.style.opacity = "0";
        lockBox.style.transform = "scale(0.7) translateY(-80px)";
        lockBox.style.filter = "blur(15px)";
    }

    setTimeout(() => {
        // Crear fragmento DOM antes de insertar (evita reflow)
        const container = document.createElement('div');
        container.style.textAlign = 'center';
        container.style.color = 'white';
        container.style.width = '100%';
        container.style.maxWidth = '90vw';
        container.style.padding = 'clamp(16px, 4vw, 30px)';
        container.innerHTML = `
            <div id="welcomeIcon" style="
                font-size: clamp(2.5rem, 10vw, 4rem); 
                margin-bottom: clamp(12px, 3vw, 20px); 
                opacity: 0; 
                transform: scale(0.5);
                line-height: 1;
                filter: drop-shadow(0 10px 30px rgba(0,0,0,0.6));
            ">${selectedHeart}</div>
            <h1 id="welcomeText" style="
                font-size: clamp(1.8rem, 6vw, 3.5rem);
                font-weight: 400;
                background: linear-gradient(135deg, #fff 0%, #e0e0ff 50%, #c0c0ff 100%);
                backgroundSize: '200% 200%';
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                opacity: 0;
                transform: translateY(40px);
                letter-spacing: clamp(2px, 1.5vw, 8px);
                margin-bottom: clamp(12px, 3vw, 15px);
                margin-top: 0;
                text-transform: uppercase;
                word-wrap: break-word;
                word-break: break-word;
                line-height: 1.2;
                filter: drop-shadow(0 0 20px rgba(200,200,220,0.3));
            ">
                ${selectedPhrase}
            </h1>
            <p id="welcomeSub" style="
                font-size: clamp(0.75rem, 2vw, 0.9rem);
                letter-spacing: clamp(1px, 1vw, 12px);
                color: rgba(255,255,255,0.5);
                opacity: 0;
                transform: translateY(15px);
                text-transform: uppercase;
                margin: clamp(8px, 2vw, 15px) 0;
                word-wrap: break-word;
                word-break: break-word;
                line-height: 1.3;
            ">
                ${selectedSub}
            </p>
            <div id="welcomeLine" style="
                width: 0;
                height: 1.5px;
                background: linear-gradient(90deg, transparent, rgba(200,200,220,0.6), transparent);
                margin: clamp(16px, 4vw, 30px) auto;
                boxShadow: 0 0 20px rgba(200,200,220,0.3);
            "></div>
            <p id="welcomeFinal" style="
                font-size: clamp(0.6rem, 1.5vw, 0.7rem);
                color: rgba(255,255,255,0.3);
                opacity: 0;
                letter-spacing: clamp(2px, 1vw, 4px);
                margin: 0;
                line-height: 1.2;
                textTransform: 'uppercase';
            ">DESBLOQUEANDO RECUERDOS...</p>
        `;
        pageLock.innerHTML = '';
        pageLock.appendChild(container);

        setTimeout(() => {
            // Hacemos fade-out (sin volver transparente el fondo antes de tiempo)
            pageLock.style.transition = 'opacity 1.4s cubic-bezier(0.4, 0, 0.2, 1), filter 1.4s ease';
            pageLock.style.opacity = '0';
            pageLock.style.filter = 'blur(12px)';

            setTimeout(() => {
                pageLock.style.display = 'none';
                pageLock.style.visibility = 'hidden';
                pageLock.style.pointerEvents = 'none';
                pageLock.classList.remove('force-solid');
                document.body.classList.remove("locked");
                document.body.classList.remove("initializing");
                
                // Restaurar visibilidad de todos los elementos
                const allElements = document.body.querySelectorAll('*');
                allElements.forEach(el => {
                    if (el.id !== 'pageLock' && el.id !== 'devModal' && !el.id.startsWith('initialSplash')) {
                        el.style.visibility = 'visible';
                    }
                });
                
                if (typeof window.__removeInitializing === 'function') window.__removeInitializing();
                actualizarUltimaActividad();
                loadAvatarFromDB(); // 👈 AQUI TAMBIÉN
            }, 1400);

        }, 4400);
    }, 800);
}

function ensurePageLockMarkup() {
    let pageLock = document.getElementById('pageLock');
    if (pageLock) return pageLock;

    pageLock = document.createElement('div');
    pageLock.id = 'pageLock';
    pageLock.className = 'page-lock';
    pageLock.setAttribute('aria-modal', 'true');
    pageLock.setAttribute('role', 'dialog');
    pageLock.innerHTML = `
        <div class="lock-box">
            <h2 id="lockPhrase">ARCHIVO SECRETO</h2>
            <p>INGRESA EL PIN PARA CONTINUAR</p>
            <input id="pinInput" type="password" placeholder="PIN SEGURIDAD" maxlength="4" inputmode="numeric" pattern="[0-9]*" autocomplete="off" />
            <button type="button" id="unlockButton">ABRIR</button>
            <div id="errorMsg" class="lock-error"></div>
        </div>`;

    document.body.prepend(pageLock);
    return pageLock;
}

function revealLockedContent() {
    const root = document.documentElement;
    const body = document.body;

    if (body) {
        body.classList.remove('locked');
        body.classList.remove('initializing');
        body.style.visibility = 'visible';
        body.style.opacity = '1';
        body.style.display = 'block';
        body.style.overflow = 'auto';
        body.style.background = '#050505';
        body.style.minHeight = '100%';
        body.style.height = 'auto';
    }

    if (root) {
        root.classList.remove('initializing');
        root.style.visibility = 'visible';
        root.style.opacity = '1';
        root.style.height = 'auto';
        root.style.minHeight = '100%';
    }

    const initializingStyle = document.getElementById('initializing-style');
    if (initializingStyle && initializingStyle.parentNode) {
        initializingStyle.parentNode.removeChild(initializingStyle);
    }

    const unlockOverride = document.getElementById('unlock-override');
    if (unlockOverride && unlockOverride.parentNode) {
        unlockOverride.parentNode.removeChild(unlockOverride);
    }

    const pageLock = ensurePageLockMarkup();
    if (pageLock) {
        pageLock.classList.remove('active');
        pageLock.classList.remove('unlocking');
        pageLock.style.transition = 'opacity 500ms cubic-bezier(0.4, 0, 0.2, 1), transform 500ms cubic-bezier(0.4, 0, 0.2, 1), filter 500ms ease';
        pageLock.style.opacity = '0';
        pageLock.style.filter = 'blur(10px)';
        pageLock.style.visibility = 'hidden';
        pageLock.style.pointerEvents = 'none';
        pageLock.style.zIndex = '-1';
        pageLock.style.display = 'none';
    }

    if (body) {
        body.querySelectorAll('*').forEach((el) => {
            if (el.id === 'pageLock' || el.id === 'devModal' || el.id.startsWith('initialSplash') || el.classList.contains('stars')) {
                return;
            }
            el.style.visibility = 'visible';
            el.style.display = '';
        });
    }

    requestAnimationFrame(() => {
        if (body) {
            body.style.visibility = 'visible';
            body.style.opacity = '1';
        }
        if (pageLock) {
            pageLock.style.display = 'none';
            pageLock.style.visibility = 'hidden';
            pageLock.style.pointerEvents = 'none';
        }
    });

    if (typeof window.__removeInitializing === 'function') window.__removeInitializing();
    actualizarUltimaActividad();
    if (typeof loadAvatarFromDB === 'function') loadAvatarFromDB();
}

function unlockPage() {
    const inputElement = document.getElementById("pinInput");
    if (!inputElement) {
        console.error('[lock.js] CRÍTICO: Elemento #pinInput no encontrado');
        return;
    }
    const input = inputElement.value;
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
            inputElement.style.borderColor = 'rgba(100, 200, 100, 0.6)';
            inputElement.style.boxShadow = '0 0 30px rgba(100, 200, 100, 0.3), inset 0 0 15px rgba(100, 200, 100, 0.1)';
            revealLockedContent();
        }
    } else {
        if (error) {
            error.style.display = "block";
            error.style.animation = 'none';
            void error.offsetWidth;
            error.style.animation = 'shake 420ms cubic-bezier(0.36, 0, 0.66, -0.56)';
        }

        inputElement.style.borderColor = 'rgba(255, 107, 107, 0.6)';
        inputElement.style.boxShadow = '0 0 25px rgba(255, 107, 107, 0.3), inset 0 0 10px rgba(255, 107, 107, 0.05)';

        setTimeout(() => {
            inputElement.style.borderColor = 'rgba(200,200,220,0.15)';
            inputElement.style.boxShadow = '';
        }, 500);
    }
}

/* ============================= */
/* 🚫 BLOQUEO INICIAL FORZADO */
/* ============================= */

    document.addEventListener('DOMContentLoaded', () => {
        // Forzar bloqueo visual inmediato en todas las páginas.
        document.body.classList.add('locked');

        // En el index aún mostramos el splash, pero el overlay del PIN ya está activo.
        const isIndex =
            window.location.pathname.endsWith('index.html') ||
            window.location.pathname === '/' ||
            window.location.pathname.endsWith('/');

        if (isIndex) {
            showInitialLogoSplash();
        } else {
            verificarBloqueo();
        }
    });

    // Evitar zoom automático en iOS al enfocar/ocultar el teclado en el input del PIN
    document.addEventListener('DOMContentLoaded', () => {
        const pinInput = document.getElementById('pinInput');
        if (!pinInput) {
            console.warn('[lock.js] #pinInput no encontrado - iOS zoom prevention desactivado');
            return;
        }

        function isIOS() {
            return /iP(ad|hone|od)/.test(navigator.userAgent) && !window.MSStream;
        }

        const metaViewport = document.querySelector('meta[name=viewport]');
        const originalViewport = metaViewport ? metaViewport.getAttribute('content') : 'width=device-width, initial-scale=1.0';

        // Aseguramos tamaño de fuente mínimo 16px para evitar zoom en iOS como primera defensa
        pinInput.style.fontSize = '16px';

        if (isIOS() && metaViewport) {
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
    if (!pin || !pageLock) {
        console.warn('[lock.js] No se puede activar force-solid (falta #pinInput o #pageLock)');
        return;
    }

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

    if (!boton || !textarea) {
        console.warn('[lock.js] Elementos comentarios (#enviar, #mensaje) no encontrados');
        return;
    }

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

        if (!avatar || !avatarInput) {
            console.warn('[lock.js] Elementos avatar (#dynamicAvatar, #avatarInput) no encontrados');
            return;
        }

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
        `${SUPABASE_URL}rest/v1/avatar_state?id=eq.1`,
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
            res = await fetch(`${SUPABASE_URL}rest/v1/avatar_state`, {
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
        `${SUPABASE_URL}rest/v1/avatar_state?id=eq.1&select=image_url`,
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
// Solo mientras la página esté activa (no bloqueada)
let avatarPollInterval = null;
document.addEventListener('DOMContentLoaded', () => {
    // Iniciar poll después de desbloquear
    const startAvatarPolling = () => {
        if (!avatarPollInterval && !document.body.classList.contains('locked')) {
            avatarPollInterval = setInterval(() => {
                if (typeof loadAvatarFromDB === 'function') {
                    loadAvatarFromDB().catch(err => console.error('Error sincronizando avatar:', err));
                }
            }, 30000);
        }
    };
    // Limpiar poll al bloquear
    const stopAvatarPolling = () => {
        if (avatarPollInterval) {
            clearInterval(avatarPollInterval);
            avatarPollInterval = null;
        }
    };
    // Observer para cambios en la clase 'locked'
    const observer = new MutationObserver(() => {
        if (document.body.classList.contains('locked')) stopAvatarPolling();
        else startAvatarPolling();
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
});

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

    // Event delegation: un solo listener en body para todos los links
    document.body.addEventListener('click', (e) => {
        const a = e.target.closest('a[href]');
        if (!a) return;
        const href = a.getAttribute('href');
        if (!href) return;
        if (href.startsWith('#') || a.target === '_blank' || href.startsWith('mailto:') || href.startsWith('javascript:')) return;
        protectBackground();
    }, {passive: true, capture: false});
});
