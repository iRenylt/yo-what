/**
 * SHARED UTILITIES - Funciones compartidas para todas las páginas
 * Evita duplicación y garantiza consistencia
 */

// ============================================
// 🌸 SISTEMA MEJORADO DE SAKURA
// ============================================
(function initSakura() {
    const sakuraContainer = document.getElementById('sakura');
    if (!sakuraContainer) return;

    let sakuraInterval = null;

    function createSakuraLeaf() {
        const leaf = document.createElement('div');
        leaf.className = 'sakura-leaf';
        const size = Math.random() * 10 + 15;
        leaf.style.width = size + 'px';
        leaf.style.height = size + 'px';
        const xPos = Math.random() * 100;
        leaf.style.left = xPos + '%';
        const duration = Math.random() * 8 + 8;
        leaf.style.animationDuration = duration + 's';
        const txVariation = Math.random() * 200 - 100;
        leaf.style.setProperty('--tx', txVariation + 'px');
        const opacity = Math.random() * 0.3 + 0.5;
        leaf.style.opacity = opacity;
        sakuraContainer.appendChild(leaf);
        setTimeout(() => leaf.remove(), duration * 1000);
    }

    function startSakura() {
        if (!sakuraInterval && !document.hidden) {
            sakuraInterval = setInterval(() => createSakuraLeaf(), Math.random() * 300 + 500);
        }
    }

    function stopSakura() {
        if (sakuraInterval) {
            clearInterval(sakuraInterval);
            sakuraInterval = null;
        }
    }

    // Iniciar inmediatamente
    startSakura();
    for (let i = 0; i < 5; i++) {
        setTimeout(() => createSakuraLeaf(), i * 200);
    }

    // Pausar/reanudar cuando la pestaña se oculta/muestra
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopSakura();
        } else {
            startSakura();
        }
    });

    // Exponer funciones globalmente para limpieza en beforeunload
    window.__sakuraStop = stopSakura;
})();

// ============================================
// 🧹 LIMPIEZA AL DESCARGAR/NAVEGAR
// ============================================
window.addEventListener('beforeunload', () => {
    // Detener animaciones
    if (typeof window.__sakuraStop === 'function') {
        window.__sakuraStop();
    }
    
    // Limpiar todos los intervals activos
    // (Este es un cleanup genérico - idealmente cada página tiene su propio control)
    let id = setInterval(() => {}, 1);
    clearInterval(id - 1);
});

// ============================================
// 📱 DETECTAR INACTIVIDAD
// ============================================
window.addEventListener('beforeunload', () => {
    document.body.classList.add('page-hidden');
});

window.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        document.body.classList.add('page-hidden');
    } else {
        document.body.classList.remove('page-hidden');
    }
});

// Exportar utilidades para otros archivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        sakuraStop: () => typeof window.__sakuraStop === 'function' && window.__sakuraStop()
    };
}
