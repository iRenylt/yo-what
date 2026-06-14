/**
 * SHARED UTILITIES - Funciones compartidas para todas las páginas
 * Evita duplicación y garantiza consistencia
 * Optimizado para móvil y desktop
 */

// ============================================
// 🎬 CONFIGURACIÓN GLOBAL Y DETECTORES
// ============================================
const APP_CONFIG = {
    isTouch: () => matchMedia('(hover: none)').matches,
    isMobile: () => window.innerWidth < 768,
    prefersReducedMotion: () => matchMedia('(prefers-reduced-motion: reduce)').matches,
};

// ============================================
// 🌸 SISTEMA MEJORADO Y OPTIMIZADO DE SAKURA
// ============================================
(function initSakura() {
    const sakuraContainer = document.getElementById('sakura');
    if (!sakuraContainer) return;

    // Reducir partículas en móvil para mejor rendimiento
    const maxParticles = APP_CONFIG.isMobile() ? 3 : 8;
    let sakuraInterval = null;
    let activeLeaves = 0;

    function createSakuraLeaf() {
        if (activeLeaves >= maxParticles) return;
        
        const leaf = document.createElement('div');
        leaf.className = 'sakura-leaf';
        const size = Math.random() * 10 + 12;
        leaf.style.width = size + 'px';
        leaf.style.height = size + 'px';
        const xPos = Math.random() * 100;
        leaf.style.left = xPos + '%';
        const duration = Math.random() * 8 + 8;
        leaf.style.animationDuration = duration + 's';
        const txVariation = Math.random() * 200 - 100;
        leaf.style.setProperty('--tx', txVariation + 'px');
        const opacity = Math.random() * 0.25 + 0.35;
        leaf.style.opacity = opacity;
        
        activeLeaves++;
        sakuraContainer.appendChild(leaf);
        
        setTimeout(() => {
            leaf.remove();
            activeLeaves--;
        }, duration * 1000);
    }

    function startSakura() {
        if (!sakuraInterval && !document.hidden && !APP_CONFIG.prefersReducedMotion()) {
            sakuraInterval = setInterval(() => createSakuraLeaf(), Math.random() * 400 + 600);
        }
    }

    function stopSakura() {
        if (sakuraInterval) {
            clearInterval(sakuraInterval);
            sakuraInterval = null;
        }
    }

    // Iniciar inmediatamente
    if (!APP_CONFIG.prefersReducedMotion()) {
        startSakura();
        for (let i = 0; i < 3; i++) {
            setTimeout(() => createSakuraLeaf(), i * 300);
        }
    }

    // Pausar/reanudar cuando la pestaña se oculta/muestra
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopSakura();
        } else {
            startSakura();
        }
    });

    // Detener al navegar
    window.__sakuraStop = stopSakura;
    
    // Pausar en scroll agresivo (mobile)
    let scrollTimeout = null;
    document.addEventListener('scroll', () => {
        if (APP_CONFIG.prefersReducedMotion()) return;
        stopSakura();
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => startSakura(), 500);
    }, { passive: true });
})();

// ============================================
// ✨ ANIMACIONES AL SCROLL (INTERSECTION OBSERVER)
// ============================================
(function initScrollAnimations() {
    if (!('IntersectionObserver' in window)) return;

    const animationElements = document.querySelectorAll('[data-scroll-animate], .fade-up, .fade-in, .card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '50px'
    });

    animationElements.forEach(el => observer.observe(el));
})();

// ============================================
// 🖱️ EFECTO PARALLAX SUAVE EN HERO
// ============================================
(function initParallax() {
    if (APP_CONFIG.prefersReducedMotion() || APP_CONFIG.isTouch()) return;
    
    const hero = document.querySelector('.hero');
    if (!hero) return;

    let ticking = false;
    
    window.addEventListener('mousemove', (e) => {
        if (ticking) return;
        ticking = true;
        
        requestAnimationFrame(() => {
            const x = (e.clientX / window.innerWidth) * 10 - 5;
            const y = (e.clientY / window.innerHeight) * 10 - 5;
            hero.style.transform = `perspective(1000px) rotateX(${y * 0.3}deg) rotateY(${x * 0.3}deg)`;
            ticking = false;
        });
    });
    
    // Reset on mouse leave
    document.addEventListener('mouseleave', () => {
        hero.style.transform = '';
    });
})();

// ============================================
// 🎯 EFECTOS DE HOVER MEJORADOS PARA TARJETAS
// ============================================
(function initCardEffects() {
    const cards = document.querySelectorAll('.card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.willChange = 'transform, box-shadow';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.willChange = 'auto';
        });
    });
})();

// ============================================
// 🧹 LIMPIEZA AL DESCARGAR/NAVEGAR
// ============================================
window.addEventListener('beforeunload', () => {
    if (typeof window.__sakuraStop === 'function') {
        window.__sakuraStop();
    }
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

// ============================================
// 🔧 UTILIDADES Y HELPERS
// ============================================

/**
 * Añadir clase con delay para animaciones escalonadas
 */
function staggerElements(selector, delay = 100) {
    const elements = document.querySelectorAll(selector);
    elements.forEach((el, index) => {
        setTimeout(() => {
            el.classList.add('in-view');
        }, delay * index);
    });
}

/**
 * Usar prefers-reduced-motion
 */
function respectMotionPreference() {
    if (APP_CONFIG.prefersReducedMotion()) {
        document.documentElement.style.setProperty('--transition-smooth', 'all 0.01s ease');
        document.documentElement.style.setProperty('--transition-fast', 'all 0.01s ease');
    }
}

// Aplicar preferencias de movimiento
respectMotionPreference();

// Exportar utilidades
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        sakuraStop: () => typeof window.__sakuraStop === 'function' && window.__sakuraStop(),
        staggerElements,
        APP_CONFIG,
        respectMotionPreference
    };
}
