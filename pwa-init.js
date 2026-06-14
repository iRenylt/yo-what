/**
 * 🎬 PWA Init Script
 * Inicializa funcionalidades de Progressive Web App
 */

class PWAManager {
    constructor() {
        this.hasUpdate = false;
        this.serviceWorkerReg = null;
        this.init();
    }

    init() {
        this.initServiceWorker();
        this.setupInstallPrompt();
        this.checkOnlineStatus();
        this.setupAutoUpdate();
    }

    /**
     * Registrar Service Worker
     */
    async initServiceWorker() {
        if (!('serviceWorker' in navigator)) {
            console.log('ℹ️ Service Worker no soportado');
            return;
        }

        try {
            this.serviceWorkerReg = await navigator.serviceWorker.register('sw.js', {
                scope: '/'
            });

            console.log('✅ Service Worker activo:', this.serviceWorkerReg.scope);
            this.setupUpdateListener();
        } catch (err) {
            console.error('❌ SW error:', err);
        }
    }

    /**
     * Escuchar actualizaciones del Service Worker
     */
    setupUpdateListener() {
        if (!this.serviceWorkerReg) return;

        this.serviceWorkerReg.addEventListener('updatefound', () => {
            const newWorker = this.serviceWorkerReg.installing;
            newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    this.hasUpdate = true;
                    this.showUpdateNotification();
                }
            });
        });

        // Chequear actualizaciones cada 30 minutos
        setInterval(() => {
            this.serviceWorkerReg?.update();
        }, 30 * 60 * 1000);
    }

    /**
     * Mostrar notificación de actualización
     */
    showUpdateNotification() {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            background: linear-gradient(135deg, #d4a574, #e8c48f);
            color: #0d0d0d;
            padding: 1.5rem 2rem;
            border-radius: 12px;
            font-weight: 600;
            z-index: 10000;
            box-shadow: 0 10px 40px rgba(212, 165, 116, 0.4);
            animation: slideInUp 0.4s ease;
        `;

        notification.innerHTML = `
            <div style="display: flex; gap: 1rem; align-items: center;">
                <span>🔄 Nueva versión disponible</span>
                <button onclick="window.location.reload()" style="
                    background: #0d0d0d;
                    color: #f5e6d3;
                    border: none;
                    padding: 0.5rem 1rem;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 600;
                ">Actualizar</button>
            </div>
        `;

        document.body.appendChild(notification);
    }

    /**
     * Prompt de instalación PWA
     */
    setupInstallPrompt() {
        let deferredPrompt;

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;

            // Mostrar botón de instalar
            this.createInstallButton(deferredPrompt);
        });

        window.addEventListener('appinstalled', () => {
            console.log('✅ PWA instalada');
            deferredPrompt = null;
        });
    }

    /**
     * Crear botón de instalación
     */
    createInstallButton(deferredPrompt) {
        const installBtn = document.createElement('button');
        installBtn.style.cssText = `
            position: fixed;
            bottom: 2rem;
            left: 2rem;
            background: linear-gradient(135deg, #d4a574, #e8c48f);
            color: #0d0d0d;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 25px;
            cursor: pointer;
            font-weight: 600;
            font-size: 0.9rem;
            z-index: 9999;
            box-shadow: 0 8px 20px rgba(212, 165, 116, 0.3);
            animation: slideInUp 0.4s ease;
            transition: all 0.3s ease;
        `;

        installBtn.innerHTML = '📱 Instalar App';

        installBtn.addEventListener('mouseenter', () => {
            installBtn.style.transform = 'translateY(-3px)';
            installBtn.style.boxShadow = '0 12px 30px rgba(212, 165, 116, 0.4)';
        });

        installBtn.addEventListener('mouseleave', () => {
            installBtn.style.transform = '';
            installBtn.style.boxShadow = '';
        });

        installBtn.addEventListener('click', async () => {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`📱 Usuario: ${outcome}`);
            installBtn.remove();
        });

        document.body.appendChild(installBtn);
    }

    /**
     * Monitorear estado de conexión
     */
    checkOnlineStatus() {
        window.addEventListener('online', () => {
            console.log('✅ Online');
            this.showOnlineStatus(true);
        });

        window.addEventListener('offline', () => {
            console.log('⚠️ Offline');
            this.showOnlineStatus(false);
        });
    }

    /**
     * Mostrar indicador de conexión
     */
    showOnlineStatus(isOnline) {
        let indicator = document.getElementById('connection-indicator');

        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'connection-indicator';
            indicator.style.cssText = `
                position: fixed;
                top: 1rem;
                right: 1rem;
                padding: 0.5rem 1rem;
                border-radius: 20px;
                font-size: 0.8rem;
                z-index: 9998;
                font-weight: 600;
            `;
            document.body.appendChild(indicator);
        }

        if (isOnline) {
            indicator.textContent = '✅ Online';
            indicator.style.background = '#4ade80';
            indicator.style.color = '#fff';
        } else {
            indicator.textContent = '⚠️ Offline';
            indicator.style.background = '#f97316';
            indicator.style.color = '#fff';
        }
    }

    /**
     * Configurar auto-actualización
     */
    setupAutoUpdate() {
        // Verificar actualizaciones al ganar foco
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.serviceWorkerReg) {
                this.serviceWorkerReg.update();
            }
        });
    }

    /**
     * Compartir aplicación
     */
    static async share(data = {}) {
        if (!navigator.share) {
            console.log('ℹ️ Web Share API no disponible');
            return;
        }

        try {
            await navigator.share({
                title: data.title || document.title,
                text: data.text || 'Mira esto',
                url: data.url || window.location.href
            });
        } catch (err) {
            console.error('Share error:', err);
        }
    }

    /**
     * Guardar datos offline
     */
    static saveOfflineData(key, data) {
        try {
            localStorage.setItem(`offline_${key}`, JSON.stringify(data));
        } catch (err) {
            console.error('Storage error:', err);
        }
    }

    /**
     * Recuperar datos offline
     */
    static getOfflineData(key) {
        try {
            const data = localStorage.getItem(`offline_${key}`);
            return data ? JSON.parse(data) : null;
        } catch (err) {
            console.error('Retrieve error:', err);
            return null;
        }
    }

    /**
     * Limpiar datos offline
     */
    static clearOfflineData(key) {
        try {
            localStorage.removeItem(`offline_${key}`);
        } catch (err) {
            console.error('Clear error:', err);
        }
    }
}

// Inicializar PWA al cargar
document.addEventListener('DOMContentLoaded', () => {
    window.pwaManager = new PWAManager();
    console.log('🎬 PWA Manager inicializado');
});

// Exportar para uso global
window.PWAManager = PWAManager;
