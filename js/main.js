document.addEventListener("DOMContentLoaded", function () {

    initSmoothScroll();
    initScrollAnimations();
    initCountdown();

});

/* =========================================
   1. FUNCIÓN: SCROLL SUAVE
   Agrupa todos los botones que llevan al contenido
   ========================================= */
function initSmoothScroll() {
    const targetSection = document.getElementById('inicio-contenido');
    
    // Lista de IDs que disparan el scroll
    const triggerIds = ['click-trigger-overlay', 'click-trigger-arrow'];

    triggerIds.forEach(id => {
        const element = document.getElementById(id);
        if (element && targetSection) {
            element.addEventListener('click', () => {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            });
        }
    });
}

/* =========================================
   2. FUNCIÓN: ANIMACIONES (INTERSECTION OBSERVER)
   Detecta cuando los bloques entran en pantalla
   ========================================= */
function initScrollAnimations() {
    const textBlocks = document.querySelectorAll('.text-block');
    
    const observerOptions = { 
        threshold: 0.2 // Se activa cuando el 20% del elemento es visible
    };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                obs.unobserve(entry.target); // Deja de observar una vez animado
            }
        });
    }, observerOptions);

    textBlocks.forEach(block => {
        observer.observe(block);
    });
}

/* =========================================
   3. FUNCIÓN: CUENTA ATRÁS
   Lógica del temporizador
   ========================================= */
function initCountdown() {
    const targetDate = new Date("Dec 6, 2025 22:00:00").getTime();
    
    // Función auxiliar para agregar el "0" delante (ej: 05 en vez de 5)
    const formatTime = (time) => time < 10 ? `0${time}` : time;

    const updateTimer = () => {
        const now = new Date().getTime();
        const distance = targetDate - now;

        // Si la cuenta termina
        if (distance < 0) {
            clearInterval(timerInterval);
            const wrapper = document.querySelector(".countdown-wrapper");
            if (wrapper) {
                wrapper.innerHTML = "<div class='time-box' style='width:300px'><span class='time-number'>¡EMPIEZA LA FIESTA!</span></div>";
            }
            return;
        }

        // Cálculos de fecha
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Actualizar DOM (con chequeo de seguridad por si falta un ID)
        const setElementText = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.innerText = formatTime(value);
        };

        setElementText("days", days);
        setElementText("hours", hours);
        setElementText("minutes", minutes);
        setElementText("seconds", seconds);
    };

    // Ejecutamos una vez al inicio para evitar el retraso de 1 segundo
    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);
}