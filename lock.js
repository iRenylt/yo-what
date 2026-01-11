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

    setTimeout(() => {
        const text = document.getElementById('welcomeText');
        if (text) {
            text.style.opacity = '1';
            text.style.transform = 'translateY(0)';
        }
    }, 100);

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
        // No guardamos estado de autenticación persistente para que siempre pida PIN al recargar
        
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
            alert("Escribe algo primero por favor");
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
            if (!res.ok) throw new Error("Error al guardar");
            textarea.value = "";
            alert("Enviado ❤️");
        })
        .catch(err => {
            console.error(err);
            alert("Error al guardar");
        });
    }

    boton.addEventListener("click", enviarComentario);
});
