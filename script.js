// Control de Ventanas Modales
function openModal(title, content) {
    const modalTitle = document.getElementById('modalTitle');
    const modalContent = document.getElementById('modalContent');
    const modal = document.getElementById('infoModal');

    if (modalTitle && modalContent && modal) {
        modalTitle.innerText = title;
        modalContent.innerText = content;
        modal.style.display = 'flex';
    }
}

function closeModal() {
    const modal = document.getElementById('infoModal');
    if (modal) modal.style.display = 'none';
}

// Simulación de Inicio de Sesión
function handleLogin(event) {
    event.preventDefault();
    const user = document.getElementById('matricula').value;
    openModal('Acceso Correcto', `Bienvenido al Sistema de Tutorías, alumno ${user}.`);
}

// 1. Registro Dinámico de Alumnos (alumnos.html)
function registrarAlumno(event) {
    event.preventDefault();

    const matricula = document.getElementById('alumnoMatricula').value;
    const nombre = document.getElementById('alumnoNombre').value;
    const correo = document.getElementById('alumnoCorreo').value;
    const estatus = document.getElementById('alumnoEstatus').value;

    const tbody = document.getElementById('tablaAlumnosBody');

    if (tbody) {
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid #E0E0E0';
        
        const badgeStyle = estatus === 'Con Tutor' 
            ? 'background: #EBF2FF; color: #003399;' 
            : 'background: #FFF3EB; color: #FF6600;';
        const badgeIcon = estatus === 'Con Tutor' ? 'fa-circle-check' : 'fa-clock';

        tr.innerHTML = `
            <td style="padding: 10px; font-weight: bold; color: #003399;">${matricula}</td>
            <td style="padding: 10px;">${nombre}</td>
            <td style="padding: 10px;">${correo}</td>
            <td style="padding: 10px;">
                <span style="${badgeStyle} padding: 4px 8px; border-radius: 12px; font-weight: bold; font-size: 0.8rem;">
                    <i class="fa-solid ${badgeIcon}"></i> ${estatus}
                </span>
            </td>
        `;

        tbody.appendChild(tr);

        document.getElementById('registroAlumnoForm').reset();
        openModal('Registro Exitoso', `El alumno ${nombre} (${matricula}) ha sido ingresado en el sistema.`);
    }
}

// 2. Registro Dinámico de Tutores (tutor.html)
function registrarTutor(event) {
    event.preventDefault();

    const matricula = document.getElementById('tutorMatricula').value;
    const nombre = document.getElementById('tutorNombre').value;
    const correo = document.getElementById('tutorCorreo').value;
    const materia = document.getElementById('tutorMateria').value;

    const tbody = document.getElementById('tablaTutoresBody');

    if (tbody) {
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid #E0E0E0';
        
        tr.innerHTML = `
            <td style="padding: 10px; font-weight: bold; color: #003399;">${matricula}</td>
            <td style="padding: 10px;">${nombre}</td>
            <td style="padding: 10px;">${correo}</td>
            <td style="padding: 10px;">
                <span style="background: #EBF2FF; color: #003399; padding: 4px 8px; border-radius: 12px; font-weight: bold; font-size: 0.8rem;">
                    <i class="fa-solid fa-book"></i> ${materia}
                </span>
            </td>
        `;

        tbody.appendChild(tr);

        document.getElementById('registroTutorForm').reset();
        openModal('Registro Exitoso', `El tutor ${nombre} (${matricula}) ha sido registrado en el sistema.`);
    }
}

// 3. Vinculación y Asignación de Tutor (asignaciones.html)
function registrarAsignacion(event) {
    event.preventDefault();

    const alumnoRaw = document.getElementById('asigAlumno').value;
    const tutor = document.getElementById('asigTutor').value;
    const materia = document.getElementById('asigMateria').value;

    if (!alumnoRaw || !tutor) return;

    const [matricula, nombre, correo] = alumnoRaw.split('|');
    const tbody = document.getElementById('tablaAsignacionesBody');

    if (tbody) {
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid #E0E0E0';

        tr.innerHTML = `
            <td style="padding: 10px; font-weight: bold; color: #003399;">${matricula}</td>
            <td style="padding: 10px;">${nombre}</td>
            <td style="padding: 10px;">${correo}</td>
            <td style="padding: 10px; font-weight: 600;">${tutor}</td>
            <td style="padding: 10px;">${materia}</td>
            <td style="padding: 10px;">
                <span style="background: #EBF2FF; color: #003399; padding: 4px 8px; border-radius: 12px; font-weight: bold; font-size: 0.8rem;">
                    <i class="fa-solid fa-circle-check"></i> Con Tutor
                </span>
            </td>
        `;

        tbody.appendChild(tr);

        document.getElementById('registroAsignacionForm').reset();
        openModal('Asignación Exitosa', `Se ha asignado formalmente al tutor ${tutor} al alumno ${nombre} (${matricula}).`);
    }
}

async function cargarMetricasInicio() {
    try {
        // Cargar total de alumnos
        const resAlumnos = await fetch(`${API_URL}/alumnos`);
        const alumnos = await resAlumnos.json();
        const statAlumnos = document.getElementById('statTotalAlumnos');
        if (statAlumnos) {
            statAlumnos.innerText = alumnos.length;
        }

        // Cargar total de asignaciones (tutores asignados)
        const resAsignaciones = await fetch(`${API_URL}/asignaciones`);
        const asignaciones = await resAsignaciones.json();
        const statTutores = document.getElementById('statTotalTutores');
        if (statTutores) {
            statTutores.innerText = asignaciones.length;
        }
    } catch (error) {
        console.error("Error cargando métricas:", error);
    }
}

// ==========================================
// EVENTO DE CARGA INICIAL (UI y Datos)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Lógica del Menú Hamburguesa (Móviles)
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('show');
            const icon = navToggle.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-xmark');
            }
        });
    }

    // 2. Lógica de Carga de Datos desde la API
    
    // Si estamos en Inicio (index.html)
    if (document.getElementById('statTotalAlumnos')) {
        cargarMetricasInicio();
    }
    // Si estamos en Alumnos (alumnos.html)
    if (document.getElementById('tablaAlumnosBody')) {
        cargarTablaAlumnos();
    }
    // Si estamos en Tutores (tutor.html)
    if (document.getElementById('tablaTutoresBody')) {
        cargarTablaTutores();
    }
    // Si estamos en Asignaciones (asignaciones.html)
    if (document.getElementById('tablaAsignacionesBody')) {
        cargarTablaAsignaciones();
        cargarSelectoresAsignacion();
    }
});



