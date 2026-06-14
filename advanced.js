/* ========================================
   🎬 PHASE 3: ADVANCED FEATURES JAVASCRIPT
   Galerías, Lightbox, Compartir Social, etc
   ======================================== */

// ═══════════════════════════════════════════════════════════
// 📸 LIGHTBOX - VISOR DE IMÁGENES
// ═══════════════════════════════════════════════════════════

class Lightbox {
    constructor() {
        this.lightbox = document.createElement('div');
        this.lightbox.className = 'lightbox';
        this.lightbox.innerHTML = `
            <div class="lightbox-content">
                <button class="lightbox-prev" onclick="lightboxInstance.prev()">‹</button>
                <img class="lightbox-image" src="" alt="Image">
                <button class="lightbox-next" onclick="lightboxInstance.next()">›</button>
                <button class="lightbox-close" onclick="lightboxInstance.close()">✕</button>
                <div class="lightbox-info"><span id="lightbox-counter">1 / 10</span></div>
            </div>
        `;
        document.body.appendChild(this.lightbox);
        
        this.currentIndex = 0;
        this.images = [];
        this.setupKeyboardControls();
    }

    open(images, startIndex = 0) {
        this.images = images;
        this.currentIndex = startIndex;
        this.updateImage();
        this.lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    next() {
        this.currentIndex = (this.currentIndex + 1) % this.images.length;
        this.updateImage();
    }

    prev() {
        this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
        this.updateImage();
    }

    updateImage() {
        const img = this.lightbox.querySelector('.lightbox-image');
        const info = document.getElementById('lightbox-counter');
        
        img.src = this.images[this.currentIndex].src;
        img.alt = this.images[this.currentIndex].alt || 'Image';
        info.textContent = `${this.currentIndex + 1} / ${this.images.length}`;
        
        // Animación
        img.style.animation = 'none';
        setTimeout(() => img.style.animation = 'zoomIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)', 10);
    }

    setupKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            if (!this.lightbox.classList.contains('active')) return;
            
            if (e.key === 'ArrowRight') this.next();
            if (e.key === 'ArrowLeft') this.prev();
            if (e.key === 'Escape') this.close();
        });
    }
}

// Instancia global
let lightboxInstance = null;

// Inicializar Lightbox
document.addEventListener('DOMContentLoaded', () => {
    lightboxInstance = new Lightbox();
});

// ═══════════════════════════════════════════════════════════
// 📸 GALERÍA - HACER IMÁGENES CLICKEABLES
// ═══════════════════════════════════════════════════════════

function initializeGallery() {
    const polaroidFrames = document.querySelectorAll('.polaroid-frame');
    const galleryImages = [];

    polaroidFrames.forEach((frame, index) => {
        const img = frame.querySelector('.polaroid-image');
        const label = frame.querySelector('.polaroid-label')?.textContent || 'Photo';
        
        if (img && img.src) {
            galleryImages.push({
                src: img.src,
                alt: label,
                title: label
            });

            // Hacer clickeable
            frame.addEventListener('click', () => {
                if (lightboxInstance) {
                    lightboxInstance.open(galleryImages, index);
                }
            });
        }
    });
}

// ═══════════════════════════════════════════════════════════
// 📤 COMPARTIR EN REDES SOCIALES
// ═══════════════════════════════════════════════════════════

class ShareManager {
    constructor() {
        this.pageTitle = document.title || 'Footage Archive';
        this.pageURL = window.location.href;
        this.setupShareButtons();
    }

    setupShareButtons() {
        const shareButtons = document.querySelectorAll('.share-button');
        
        shareButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const platform = btn.dataset.social;
                this.share(platform);
            });
        });
    }

    share(platform) {
        const message = "Mira este proyecto especial: Footage Archive 💕";
        const encodedURL = encodeURIComponent(this.pageURL);
        const encodedMessage = encodeURIComponent(message);

        let shareURL = '';

        switch(platform) {
            case 'whatsapp':
                shareURL = `https://wa.me/?text=${encodedMessage}%20${encodedURL}`;
                break;
            case 'instagram':
                // Instagram no tiene share URL directo en web, copiar enlace
                this.copyToClipboard();
                return;
            case 'facebook':
                shareURL = `https://www.facebook.com/sharer/sharer.php?u=${encodedURL}`;
                break;
            case 'twitter':
                shareURL = `https://twitter.com/intent/tweet?text=${encodedMessage}&url=${encodedURL}`;
                break;
            case 'copy':
                this.copyToClipboard();
                return;
            default:
                return;
        }

        if (shareURL) {
            window.open(shareURL, 'share', 'width=600,height=400');
        }
    }

    copyToClipboard() {
        const text = `${this.pageTitle}\n${this.pageURL}`;
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                this.showNotification('✓ Enlace copiado al portapapeles');
            });
        } else {
            // Fallback para navegadores antiguos
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            this.showNotification('✓ Enlace copiado');
        }
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(212, 165, 116, 0.95);
            color: #0d0d0d;
            padding: 1.5rem 2.5rem;
            border-radius: 50px;
            font-weight: 600;
            z-index: 10000;
            animation: slideDown 0.4s ease-out;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(245, 230, 211, 0.5);
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideUp 0.4s ease-in';
            setTimeout(() => document.body.removeChild(notification), 400);
        }, 2000);
    }
}

// ═══════════════════════════════════════════════════════════
// 🎭 FLIPCARD 3D - TARJETAS QUE SE VOLTEAN
// ═══════════════════════════════════════════════════════════

class FlipCard3D {
    constructor(element) {
        this.card = element;
        this.isFlipped = false;
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.card.addEventListener('click', () => this.toggle());
        this.card.addEventListener('touchstart', () => this.toggle());
    }

    toggle() {
        this.isFlipped = !this.isFlipped;
        this.card.classList.toggle('flipped');
    }
}

function initializeFlipCards() {
    document.querySelectorAll('.card-3d').forEach(card => {
        new FlipCard3D(card);
    });
}

// ═══════════════════════════════════════════════════════════
// 🎬 CINE MODE - MODO PELÍCULA FULLSCREEN
// ═══════════════════════════════════════════════════════════

class CinemaMode {
    constructor() {
        this.cinemaMode = document.createElement('div');
        this.cinemaMode.className = 'cinema-mode';
        this.cinemaMode.innerHTML = `
            <div class="cinema-content">
                <img src="" alt="Cinema Image" style="display: none;">
                <video controls style="display: none;"></video>
            </div>
            <div class="cinema-controls">
                <button class="cinema-btn" onclick="cinemaModeInstance.toggleFullscreen()">⛶</button>
                <button class="cinema-btn" onclick="cinemaModeInstance.close()">✕</button>
            </div>
        `;
        document.body.appendChild(this.cinemaMode);
    }

    open(src, isVideo = false) {
        const img = this.cinemaMode.querySelector('img');
        const video = this.cinemaMode.querySelector('video');

        if (isVideo) {
            img.style.display = 'none';
            video.style.display = 'block';
            video.src = src;
        } else {
            video.style.display = 'none';
            img.style.display = 'block';
            img.src = src;
        }

        this.cinemaMode.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.cinemaMode.classList.remove('active');
        document.body.style.overflow = '';
    }

    toggleFullscreen() {
        const elem = this.cinemaMode.querySelector('img, video');
        if (!document.fullscreenElement) {
            elem.requestFullscreen?.();
        } else {
            document.exitFullscreen?.();
        }
    }
}

// Instancia global
let cinemaModeInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    cinemaModeInstance = new CinemaMode();
});

// ═══════════════════════════════════════════════════════════
// 📽️ FILMSTRIP - TIRA DE PELÍCULA INTERACTIVA
// ═══════════════════════════════════════════════════════════

function initializeFilmstrip() {
    const filmstripItems = document.querySelectorAll('.filmstrip-item');
    const filmstripImages = [];

    filmstripItems.forEach((item, index) => {
        const img = item.querySelector('img');
        
        if (img && img.src) {
            filmstripImages.push({
                src: img.src,
                alt: img.alt || 'Filmstrip Photo'
            });

            img.addEventListener('click', () => {
                if (lightboxInstance) {
                    lightboxInstance.open(filmstripImages, index);
                }
            });
        }
    });
}

// ═══════════════════════════════════════════════════════════
// 🎨 INICIALIZACIÓN GENERAL
// ═══════════════════════════════════════════════════════════

// Esperar a que cargue el DOM
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar todas las características
    initializeGallery();
    initializeFlipCards();
    initializeFilmstrip();
    
    // Inicializar compartir (si hay botones)
    const shareButtons = document.querySelectorAll('.share-button');
    if (shareButtons.length > 0) {
        new ShareManager();
    }

    // Agregar estilos de animación si no existen
    if (!document.querySelector('style[data-advanced="true"]')) {
        const style = document.createElement('style');
        style.dataset.advanced = 'true';
        style.textContent = `
            @keyframes slideDown {
                from { transform: translate(-50%, -150%); opacity: 0; }
                to { transform: translate(-50%, -50%); opacity: 1; }
            }
            @keyframes slideUp {
                from { transform: translate(-50%, -50%); opacity: 1; }
                to { transform: translate(-50%, -150%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    // Log de inicialización
    console.log('🎬 Advanced Features initialized successfully!');
    console.log('✓ Gallery initialized');
    console.log('✓ Lightbox ready');
    console.log('✓ Social sharing ready');
    console.log('✓ 3D effects ready');
    console.log('✓ Cinema mode ready');
});

// ═══════════════════════════════════════════════════════════
// 🎯 UTILIDADES GLOBALES
// ═══════════════════════════════════════════════════════════

// Función para agregar galería dinámicamente
window.addGalleryImages = function(images) {
    const container = document.querySelector('.gallery-container');
    if (!container) return;

    images.forEach((image, index) => {
        const frame = document.createElement('div');
        frame.className = 'polaroid-frame fade-up';
        frame.innerHTML = `
            <img src="${image.src}" alt="${image.title}" class="polaroid-image" loading="lazy">
            <div class="polaroid-label">${image.title}</div>
            <div class="polaroid-date">${image.date || ''}</div>
        `;
        container.appendChild(frame);
    });

    // Re-inicializar galería
    initializeGallery();
};

// Función para abrir lightbox programáticamente
window.openLightbox = function(images, startIndex = 0) {
    if (lightboxInstance) {
        lightboxInstance.open(images, startIndex);
    }
};

// Función para entrar en modo cine
window.openCinemaMode = function(src, isVideo = false) {
    if (cinemaModeInstance) {
        cinemaModeInstance.open(src, isVideo);
    }
};

// Función para compartir
window.shareContent = function(platform) {
    const shareManager = new ShareManager();
    shareManager.share(platform);
};

// Export para módulos (si es necesario)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Lightbox,
        ShareManager,
        FlipCard3D,
        CinemaMode,
        initializeGallery,
        initializeFlipCards,
        initializeFilmstrip
    };
}
