const PIN_CORRECTO = "0906";

/* ============================= */
/* 🔒 BLOQUEO Y AUTENTICACIÓN */
/* ============================= */

function actualizarUltimaActividad() {
    localStorage.setItem('lastActivity', Date.now());
}

function verificarBloqueo() {
    document.body.classList.add("locked");
    const pageLock = document.getElementById("pageLock");
    if (pageLock) {
        pageLock.style.display = "flex";
    }
}

function showWelcomeAnimation() {
    const pageLock = document.getElementById("pageLock");
    if (!pageLock) return;

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
            pageLock.style.transition = 'all 2s cubic-bezier(0.19, 1, 0.22, 1)';
            pageLock.style.backgroundColor = 'transparent';
            pageLock.style.backdropFilter = 'blur(0px)';
            pageLock.style.opacity = '0';
            pageLock.style.transform = 'scale(1.1)';

            setTimeout(() => {
                pageLock.style.display = 'none';
                document.body.classList.remove("locked");
                actualizarUltimaActividad();
                loadAvatarFromDB(); // 👈 AQUI TAMBIÉN
            }, 2000);

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
            if (pageLock) pageLock.style.display = "none";
            document.body.classList.remove("locked");
            actualizarUltimaActividad();
            loadAvatarFromDB(); // 👈 AQUI
        }
    } else {
        if (error) error.style.display = "block";
    }
}

/* ============================= */
/* 🚫 BLOQUEO INICIAL FORZADO */
/* ============================= */

    document.addEventListener('DOMContentLoaded', () => {
        // Siempre bloqueamos al inicio para forzar el PIN en cada carga
        verificarBloqueo();
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

