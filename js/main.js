document.addEventListener("DOMContentLoaded", function () {

    initSmoothScroll();
    initScrollAnimations();
    initCountdown();
    initInventory();

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
        complete: function (results) {
            console.log(results);

            renderList(results.data, listContainer);
        },
        error: function (err) {
            console.error("Error al cargar inventario:", err);
            listContainer.innerHTML = '<li>Error al cargar los datos.</li>';
        }
    });


    // Sub-función para renderizar (mantiene el scope limpio)
    function renderList(data, container) {
    container.innerHTML = ''; // Limpiar contenedor

    if (!data || data.length === 0) {
        container.innerHTML = '<p>No hay datos disponibles.</p>';
        return;
    }

    // Ordenamos con doble criterio: 
    // 1. Primero por Tipo
    // 2. Después por Nombre del elemento
    data.sort((a, b) => {
        const tipoA = a.Tipo || '';
        const tipoB = b.Tipo || '';
        const nombreA = a["Nombre del elemento"] || '';
        const nombreB = b["Nombre del elemento"] || '';

        // Comparamos tipos
        const comparacionTipo = tipoA.localeCompare(tipoB);

        // Si los tipos son diferentes, devolvemos ese orden
        if (comparacionTipo !== 0) return comparacionTipo;

        // Si los tipos son iguales, ordenamos alfabéticamente por nombre
        return nombreA.localeCompare(nombreB);
    });
    // -------------------

    // 2. Agrupar los datos por "Tipo"
    const grupos = {};
    data.forEach(item => {
        const tipo = item.Tipo || 'Otros';
        if (!grupos[tipo]) {
            grupos[tipo] = [];
        }
        grupos[tipo].push(item);
    });

    // 3. Renderizar cada grupo
    Object.keys(grupos).forEach(tipo => {
        const itemsDelGrupo = grupos[tipo];

        // A. Título del Separador
        const tituloSeccion = document.createElement('h3');
        tituloSeccion.className = 'tipo-separator';
        tituloSeccion.textContent = tipo; 
        container.appendChild(tituloSeccion);

        // B. Contenedor (Grid) del grupo
        const subGrid = document.createElement('div');
        subGrid.className = 'drinks-subgrid'; 
        
        // C. Renderizar items
        itemsDelGrupo.forEach(row => {
            const nombre = row["Nombre del elemento"];
            const estado = row["Estado"];

            if (!nombre) return;

            const drink_item = document.createElement('div');
            drink_item.className = 'drink-item';

            // Nombre
            const spanNombre = document.createElement('div');
            spanNombre.className = 'drink-name';
            spanNombre.textContent = nombre;

            // Stock
            const spanStock = document.createElement('div');
            spanStock.textContent = estado;
            spanStock.className = 'drink-desc';
            
            // Colores neon
            spanStock.classList.add(estado == "Agotado" ? 'neon-rojo' : 'neon-verde');

            drink_item.appendChild(spanNombre);
            drink_item.appendChild(spanStock);
            subGrid.appendChild(drink_item);
        });

        container.appendChild(subGrid);
    });
}
}