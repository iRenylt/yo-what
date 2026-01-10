const PIN_CORRECTO = "0906";

function actualizarUltimaActividad() {
    localStorage.setItem('lastActivity', Date.now());
}

function verificarBloqueo() {
    // Forzamos el bloqueo visual total de inmediato
    document.body.classList.add("locked");
    const pageLock = document.getElementById("pageLock");
    if (pageLock) {
        pageLock.style.display = "flex";
    }
}

function showWelcomeAnimation() {
    const pageLock = document.getElementById("pageLock");
    if (!pageLock) return;

    // Limpiar el cuadro de bloqueo para la animación
    const lockBox = pageLock.querySelector('.lock-box');

    lockBox.innerHTML = `
        <h1 id="welcomeText" style="
            font-size: 2.5rem;
            background: linear-gradient(to bottom, #fff, #888);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            opacity: 0;
            transform: translateY(20px);
            transition: all 1.5s ease;
            letter-spacing: 2px;
        ">
            Bienvenida Nohelia ❤️
        </h1>
    `;


    // Activar animación
    setTimeout(() => {
        const text = document.getElementById('welcomeText');
        text.style.opacity = '1';
        text.style.transform = 'translateY(0)';
    }, 100);

    // Desvanecer todo el overlay y mostrar contenido
    setTimeout(() => {
        pageLock.style.transition = 'opacity 1s ease';
        pageLock.style.opacity = '0';
        setTimeout(() => {
            pageLock.style.display = 'none';
            document.body.classList.remove("locked");
            actualizarUltimaActividad();
        }, 1000);
    }, 2500);
}

function unlockPage() {
    const input = document.getElementById("pinInput").value;
    const error = document.getElementById("errorMsg");

    if (input === PIN_CORRECTO) {
        // Guardamos en sessionStorage que el PIN ha sido validado para esta pestaña/sesión
        sessionStorage.setItem('authenticated', 'true');
        
        const isIndex = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/');
        if (isIndex) {
            showWelcomeAnimation();
        } else {
            const pageLock = document.getElementById("pageLock");
            if (pageLock) pageLock.style.display = "none";
            document.body.classList.remove("locked");
            actualizarUltimaActividad();
        }
    } else {
        if (error) error.style.display = "block";
    }
}

// Bloqueo inmediato preventivo
verificarBloqueo();

document.addEventListener('DOMContentLoaded', () => {
    const isHistory = window.location.pathname.endsWith('historia.html');
    const isAuthenticated = sessionStorage.getItem('authenticated') === 'true';

    // Si es historia.html, SIEMPRE pedimos el PIN (ignoramos autenticación previa)
    // Si es otra página, solo pedimos PIN si no se ha autenticado en esta sesión
    if (isHistory || !isAuthenticated) {
        verificarBloqueo();
    } else {
        // Ya está autenticado y no es historia.html, desbloqueamos directamente
        const pageLock = document.getElementById("pageLock");
        if (pageLock) pageLock.style.display = "none";
        document.body.classList.remove("locked");
    }
});
