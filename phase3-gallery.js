/**
 * 🎬 Phase 3 - Enhanced Gallery System
 * Polaroid effects, lightbox, social sharing, advanced animations
 */

class PolaroidGallery {
    constructor(containerSelector = '.gallery-grid') {
        this.container = document.querySelector(containerSelector);
        this.lightbox = null;
        this.currentIndex = 0;
        this.images = [];
        this.init();
    }

    init() {
        if (!this.container) return;
        this.createLightbox();
        this.setupGallery();
        this.setupKeyboardNavigation();
        this.setupTouchNavigation();
    }

    createLightbox() {
        const lightboxHTML = `
            <div id="polaroidLightbox" class="polaroid-lightbox">
                <button class="lightbox-close" onclick="polaroidGallery?.closeLightbox()">✕</button>
                <button class="lightbox-nav lightbox-prev" onclick="polaroidGallery?.prevImage()">‹</button>
                <button class="lightbox-nav lightbox-next" onclick="polaroidGallery?.nextImage()">›</button>
                
                <div class="lightbox-container">
                    <div class="polaroid-frame">
                        <img id="lightboxImage" src="" alt="Galería">
                        <div class="polaroid-caption" id="lightboxCaption"></div>
                    </div>
                </div>
                
                <div class="lightbox-info">
                    <span id="imageCounter" class="image-counter">1/1</span>
                    <div class="social-share-inline">
                        <button class="share-btn share-pinterest" onclick="polaroidGallery?.shareImage('pinterest')">📌</button>
                        <button class="share-btn share-whatsapp" onclick="polaroidGallery?.shareImage('whatsapp')">💬</button>
                        <button class="share-btn share-copy" onclick="polaroidGallery?.copyImageLink()">🔗</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', lightboxHTML);
        this.lightbox = document.getElementById('polaroidLightbox');
    }

    setupGallery() {
        if (!this.container) return;

        const images = this.container.querySelectorAll('img');
        images.forEach((img, index) => {
            this.images.push({
                src: img.src,
                alt: img.alt || `Foto ${index + 1}`,
                caption: img.dataset.caption || ''
            });

            // Hacer clickeable
            img.parentElement.style.cursor = 'pointer';
            img.addEventListener('click', () => this.openLightbox(index));

            // Agregar efecto Polaroid al hover
            img.parentElement.addEventListener('mouseenter', (e) => {
                const card = img.closest('[data-polaroid]') || img.parentElement;
                card.style.transform = 'rotateZ(2deg) translateY(-8px)';
                card.style.boxShadow = '0 20px 40px rgba(212, 165, 116, 0.4)';
            });

            img.parentElement.addEventListener('mouseleave', (e) => {
                const card = img.closest('[data-polaroid]') || img.parentElement;
                card.style.transform = '';
                card.style.boxShadow = '';
            });
        });
    }

    openLightbox(index) {
        if (this.images.length === 0) return;
        
        this.currentIndex = index;
        this.updateLightbox();
        this.lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeLightbox() {
        this.lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    updateLightbox() {
        const image = this.images[this.currentIndex];
        const lightboxImg = document.getElementById('lightboxImage');
        const caption = document.getElementById('lightboxCaption');
        const counter = document.getElementById('imageCounter');

        lightboxImg.src = image.src;
        lightboxImg.alt = image.alt;
        caption.textContent = image.caption || image.alt;
        counter.textContent = `${this.currentIndex + 1}/${this.images.length}`;

        // Animación de entrada
        lightboxImg.style.animation = 'fadeInScale 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
    }

    nextImage() {
        this.currentIndex = (this.currentIndex + 1) % this.images.length;
        this.updateLightbox();
    }

    prevImage() {
        this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
        this.updateLightbox();
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (!this.lightbox?.classList.contains('active')) return;
            if (e.key === 'ArrowRight') this.nextImage();
            if (e.key === 'ArrowLeft') this.prevImage();
            if (e.key === 'Escape') this.closeLightbox();
        });
    }

    setupTouchNavigation() {
        let startX = 0;
        this.lightbox?.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        });

        this.lightbox?.addEventListener('touchend', (e) => {
            const endX = e.changedTouches[0].clientX;
            const diff = startX - endX;
            if (Math.abs(diff) > 50) {
                diff > 0 ? this.nextImage() : this.prevImage();
            }
        });
    }

    shareImage(platform) {
        const image = this.images[this.currentIndex];
        const text = `Mira esta foto: ${image.alt}`;
        const url = window.location.href;

        const shareUrls = {
            pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(text)}`,
            whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
            twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
        };

        if (shareUrls[platform]) {
            window.open(shareUrls[platform], '_blank', 'width=600,height=400');
        }
    }

    copyImageLink() {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            alert('✅ Link copiado al portapapeles');
        });
    }
}

/**
 * 🎞️ Advanced Cinema Animations
 */
class CinemaAnimations {
    static init() {
        this.setupScrollReveal();
        this.setupParallaxHero();
        this.setup3DCards();
        this.setupSmoothScroll();
    }

    static setupScrollReveal() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal');
                    entry.target.style.animation = 'slideInUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: '50px' });

        document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
    }

    static setupParallaxHero() {
        const hero = document.querySelector('[data-parallax-hero]');
        if (!hero || APP_CONFIG.isMobile()) return;

        document.addEventListener('mousemove', (e) => {
            const x = (e.clientX / window.innerWidth) * 10;
            const y = (e.clientY / window.innerHeight) * 10;
            hero.style.transform = `perspective(1000px) rotateX(${y}deg) rotateY(${x}deg)`;
        });

        document.addEventListener('mouseleave', () => {
            hero.style.transform = '';
        });
    }

    static setup3DCards() {
        document.querySelectorAll('[data-3d-card]').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = (y - centerY) / 10;
                const rotateY = (centerX - x) / 10;

                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    static setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }
}

/**
 * 📱 Share & Social Features
 */
class SocialSharing {
    static init() {
        this.setupShareButtons();
    }

    static setupShareButtons() {
        const shareButtons = document.querySelectorAll('.share-button, [data-share]');
        shareButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const platform = btn.dataset.share || btn.dataset.platform;
                this.share(platform);
            });
        });
    }

    static share(platform) {
        const url = window.location.href;
        const title = document.title;
        const text = document.querySelector('meta[name="description"]')?.content || title;

        const shareUrls = {
            whatsapp: `https://wa.me/?text=${encodeURIComponent(title + '\n' + url)}`,
            telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
            facebook: `https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
            twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
            pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(text)}`,
            email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text + '\n\n' + url)}`
        };

        if (shareUrls[platform]) {
            if (platform === 'email') {
                window.location.href = shareUrls[platform];
            } else {
                window.open(shareUrls[platform], '_blank', 'width=600,height=400');
            }
        }
    }

    static copyLink() {
        navigator.clipboard.writeText(window.location.href).then(() => {
            alert('✅ Link copiado');
        });
    }
}

/**
 * 🎪 Cinema Theme Controller
 */
class CinemaTheme {
    static init() {
        this.setupThemeToggle();
        this.loadSavedTheme();
    }

    static setupThemeToggle() {
        const toggle = document.querySelector('[data-theme-toggle]');
        if (toggle) {
            toggle.addEventListener('click', () => this.toggleTheme());
        }
    }

    static toggleTheme() {
        const current = document.documentElement.dataset.theme || 'cinema';
        const next = current === 'cinema' ? 'light' : 'cinema';
        this.setTheme(next);
    }

    static setTheme(theme) {
        document.documentElement.dataset.theme = theme;
        localStorage.setItem('theme', theme);
    }

    static loadSavedTheme() {
        const saved = localStorage.getItem('theme') || 'cinema';
        this.setTheme(saved);
    }
}

/**
 * 📊 Analytics & Tracking
 */
class GalleryAnalytics {
    static init() {
        this.trackPageView();
        this.setupEventTracking();
    }

    static trackPageView() {
        const pageData = {
            page: window.location.pathname,
            title: document.title,
            timestamp: new Date().toISOString(),
            referrer: document.referrer
        };

        // Guardar en localStorage para análisis local
        const visits = JSON.parse(localStorage.getItem('gallery_visits') || '[]');
        visits.push(pageData);
        if (visits.length > 100) visits.shift();
        localStorage.setItem('gallery_visits', JSON.stringify(visits));
    }

    static setupEventTracking() {
        // Rastrear clics en galería
        document.addEventListener('click', (e) => {
            if (e.target.closest('.gallery-grid img')) {
                this.trackEvent('gallery_image_clicked', { image: e.target.src });
            }
            if (e.target.closest('.share-btn')) {
                this.trackEvent('social_share', { platform: e.target.dataset.platform });
            }
        });
    }

    static trackEvent(eventName, data = {}) {
        const event = {
            name: eventName,
            data,
            timestamp: new Date().toISOString()
        };

        const events = JSON.parse(localStorage.getItem('gallery_events') || '[]');
        events.push(event);
        if (events.length > 200) events.shift();
        localStorage.setItem('gallery_events', JSON.stringify(events));
    }
}

/**
 * 🚀 Init All Phase 3 Features
 */
window.polaroidGallery = null;

document.addEventListener('DOMContentLoaded', () => {
    // Verificar que APP_CONFIG existe (de shared.js)
    if (typeof APP_CONFIG !== 'undefined') {
        // Inicializar galerías
        window.polaroidGallery = new PolaroidGallery('.gallery-grid');

        // Inicializar animaciones
        CinemaAnimations.init();

        // Compartir social
        SocialSharing.init();

        // Tema
        CinemaTheme.init();

        // Analytics
        GalleryAnalytics.init();

        console.log('🎬 Phase 3 features initialized');
    }
});
