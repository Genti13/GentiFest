document.addEventListener("DOMContentLoaded", function () {
    // --- 1. LÓGICA DEL SCROLL AL CLICKEAR ---
    const trigger = document.getElementById('click-trigger-overlay');
    const targetSection = document.getElementById('inicio-contenido');

    trigger.addEventListener('click', function () {
        targetSection.scrollIntoView({
            behavior: 'smooth' // Desplazamiento suave
        });
    });

    const trigger_arrow = document.getElementById('click-trigger-arrow');

    trigger_arrow.addEventListener('click', function () {
        targetSection.scrollIntoView({
            behavior: 'smooth' // Desplazamiento suave
        });
    });


    const textBlocks = document.querySelectorAll('.text-block');
    const observerOptions = { threshold: 0.2 };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    textBlocks.forEach(block => {
        observer.observe(block);
    });
});

