document.addEventListener("DOMContentLoaded", function () {

    initSmoothScroll();
    initScrollAnimations();
    initCountdown();
    initInventory(); // <--- Nueva función agregada

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
    const targetDate = new Date("Dec 13, 2025 22:00:00").getTime();
    
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

/* =========================================
   4. FUNCIÓN: INVENTARIO (GOOGLE SHEETS)
   Carga y renderiza el stock de bebidas
   ========================================= */
function initInventory() {
    // ID del contenedor en tu HTML (asegúrate de tener un <ul id="inventario-lista"></ul>)
    const listContainer = document.getElementById('drinks-grid');
    
    // Si no existe el contenedor en la página actual, salimos para evitar errores
    if (!listContainer) return;

    // URL de tu Google Sheet publicado como CSV
    const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQlWl9vq7EiIY060LA8kHAyA4QSkXZpMg8ZJD3rGgmnmd-WAeqaYfBEpIrWQRSV0Rw5DJ5uO-aa1avC/pub?gid=0&single=true&output=csv'; 

    // Verificamos que PapaParse esté cargado
    if (typeof Papa === 'undefined') {
        console.error('PapaParse no está definido. Asegúrate de incluir la librería.');
        listContainer.innerHTML = '<li>Error: Librería no cargada.</li>';
        return;
    }

    listContainer.innerHTML = '<li>Cargando stock...</li>';

    Papa.parse(SHEET_URL, {
        download: true,
        header: true,
        complete: function(results) {
            console.log(results);
            
            renderList(results.data, listContainer);
        },
        error: function(err) {
            console.error("Error al cargar inventario:", err);
            listContainer.innerHTML = '<li>Error al cargar los datos.</li>';
        }
    });

    // Sub-función para renderizar (mantiene el scope limpio)
    function renderList(data, container) {
        container.innerHTML = ''; 

        if (!data || data.length === 0) {
            container.innerHTML = '<li>No hay datos disponibles.</li>';
            return;
        }

        data.forEach(row => {
            // Mapeo de columnas exactas del Excel
            const nombre = row["Nombre del elemento"];
            const estado = row["Estado"];

            // Si la fila está vacía o no tiene nombre, la saltamos
            if (!nombre) return;

            const drink_item = document.createElement('div');
            drink_item.className = 'drink-item'; // Clase para CSS

            // Nombre
            const spanNombre = document.createElement('div');
            spanNombre.className = 'drink-name';
            spanNombre.textContent = nombre;

            // Stock
            const spanStock = document.createElement('div'); 
            spanStock.textContent = estado;
            spanStock.className = 'drink-desc';
            
            // Clases de estado para CSS
            spanStock.classList.add(estado == "Agotado" ? 'neon-rojo' : 'neon-verde');

            drink_item.appendChild(spanNombre);
            drink_item.appendChild(spanStock);
            container.appendChild(drink_item);
        });
    }
}