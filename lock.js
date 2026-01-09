
const PIN_CORRECTO = "0906";
const TIEMPO_BLOQUEO = 7 * 60 * 1000; // 7 minutos en ms

function actualizarUltimaActividad() {
    localStorage.setItem('lastActivity', Date.now());
}

function verificarBloqueo() {
    const lastActivity = localStorage.getItem('lastActivity');
    const ahora = Date.now();
    const esIndex = window.location.pathname.endsWith('index.html') || window.location.pathname === '/';
    
    // Si es index, siempre bloquear al cargar
    // De lo contrario, verificar tiempo de inactividad
    if (esIndex || !lastActivity || (ahora - lastActivity > TIEMPO_BLOQUEO)) {
        document.body.classList.add("locked");
        if (document.getElementById("pageLock")) {
            document.getElementById("pageLock").style.display = "flex";
        }
    } else {
        document.body.classList.remove("locked");
        if (document.getElementById("pageLock")) {
            document.getElementById("pageLock").style.display = "none";
        }
    }
}

function unlockPage() {
    const input = document.getElementById("pinInput").value;
    const error = document.getElementById("errorMsg");

    if (input === PIN_CORRECTO) {
        document.getElementById("pageLock").style.display = "none";
        document.body.classList.remove("locked");
        actualizarUltimaActividad();
    } else {
        error.style.display = "block";
    }
}

// Escuchar eventos para mantener la sesión activa mientras navega
window.addEventListener('mousedown', actualizarUltimaActividad);
window.addEventListener('keypress', actualizarUltimaActividad);
window.addEventListener('touchstart', actualizarUltimaActividad);
window.addEventListener('scroll', actualizarUltimaActividad);

// Verificar al cargar la página
verificarBloqueo();
actualizarUltimaActividad();
