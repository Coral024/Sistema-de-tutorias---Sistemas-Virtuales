const API_URL = 'http://localhost:8000/api';

// ==========================================
// CONTROL DE VENTANAS MODALES
// ==========================================
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

// ==========================================
// 1. FUNCIONES PARA LEER DATOS (GET)
// ==========================================

async function cargarMetricasInicio() {
    try {
        const resAlumnos = await fetch(`${API_URL}/alumnos`);
        const alumnos = await resAlumnos.json();
        const statAlumnos = document.getElementById('statTotalAlumnos');
        if (statAlumnos) {
            statAlumnos.innerText = alumnos.length;
        }

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

async function cargarTablaAlumnos() {
    try {
        const res = await fetch(`${API_URL}/alumnos`);
        const alumnos = await res.json(); // <--- AQUÍ ESTABA EL ERROR, YA ESTÁ CORREGIDO
        const tbody = document.getElementById('tablaAlumnosBody');
        if(!tbody) return;
        tbody.innerHTML = ''; 
        
        alumnos.forEach(al => {
            const badgeStyle = al.estatus === 'Con Tutor' ? 'background: #EBF2FF; color: #003399;' : 'background: #FFF3EB; color: #FF6600;';
            const badgeIcon = al.estatus === 'Con Tutor' ? 'fa-circle-check' : 'fa-clock';
            
            tbody.innerHTML += `
                <tr style="border-bottom: 1px solid #E0E0E0;">
                    <td style="padding: 10px; font-weight: bold; color: #003399;">${al.matricula}</td>
                    <td style="padding: 10px;">${al.nombre}</td>
                    <td style="padding: 10px;">${al.correo}</td>
                    <td style="padding: 10px;">
                        <span style="${badgeStyle} padding: 4px 8px; border-radius: 12px; font-weight: bold; font-size: 0.8rem;">
                            <i class="fa-solid ${badgeIcon}"></i> ${al.estatus}
                        </span>
                    </td>
                </tr>`;
        });
    } catch (error) { console.error("Error cargando alumnos:", error); }
}

async function cargarTablaTutores() {
    try {
        const res = await fetch(`${API_URL}/tutores`);
        const tutores = await res.json();
        const tbody = document.getElementById('tablaTutoresBody');
        if(!tbody) return;
        tbody.innerHTML = ''; 
        
        tutores.forEach(tutor => {
            tbody.innerHTML += `
                <tr style="border-bottom: 1px solid #E0E0E0;">
                    <td style="padding: 10px; font-weight: bold; color: #003399;">${tutor.matricula}</td>
                    <td style="padding: 10px;">${tutor.nombre}</td>
                    <td style="padding: 10px;">${tutor.correo}</td>
                    <td style="padding: 10px;">
                        <span style="background: #EBF2FF; color: #003399; padding: 4px 8px; border-radius: 12px; font-weight: bold; font-size: 0.8rem;">
                            <i class="fa-solid fa-book"></i> ${tutor.materia}
                        </span>
                    </td>
                </tr>`;
        });
    } catch (error) { console.error("Error cargando tutores:", error); }
}

async function cargarTablaAsignaciones() {
    try {
        const res = await fetch(`${API_URL}/asignaciones`);
        const asig = await res.json();
        const tbody = document.getElementById('tablaAsignacionesBody');
        if(!tbody) return;
        tbody.innerHTML = ''; 
        
        asig.forEach(a => {
            tbody.innerHTML += `
                <tr style="border-bottom: 1px solid #E0E0E0;">
                    <td style="padding: 10px; font-weight: bold; color: #003399;">${a.alumno_matricula}</td>
                    <td style="padding: 10px;">${a.alumno_nombre}</td>
                    <td style="padding: 10px;">${a.alumno_correo}</td>
                    <td style="padding: 10px; font-weight: 600;">${a.tutor_nombre}</td>
                    <td style="padding: 10px;">${a.materia}</td>
                    <td style="padding: 10px;">
                        <span style="background: #EBF2FF; color: #003399; padding: 4px 8px; border-radius: 12px; font-weight: bold; font-size: 0.8rem;">
                            <i class="fa-solid fa-circle-check"></i> Con Tutor
                        </span>
                    </td>
                </tr>`;
        });
    } catch (error) { console.error("Error cargando asignaciones:", error); }
}

async function cargarSelectoresAsignacion() {
    try {
        const resAlumnos = await fetch(`${API_URL}/alumnos`);
        const alumnos = await resAlumnos.json();
        const selectAlumno = document.getElementById('asigAlumno');
        
        if (selectAlumno) {
            selectAlumno.innerHTML = '<option value="" disabled selected>-- Selecciona un alumno --</option>';
            alumnos.forEach(al => {
                selectAlumno.innerHTML += `<option value="${al.matricula}">${al.matricula} - ${al.nombre}</option>`;
            });
        }

        const resTutores = await fetch(`${API_URL}/tutores`);
        const tutores = await resTutores.json();
        const selectTutor = document.getElementById('asigTutor');
        
        if (selectTutor) {
            selectTutor.innerHTML = '<option value="" disabled selected>-- Selecciona un tutor --</option>';
            tutores.forEach(tutor => {
                selectTutor.innerHTML += `<option value="${tutor.matricula}">${tutor.nombre} (${tutor.materia})</option>`;
            });
        }
    } catch (error) {
        console.error("Error cargando los selectores:", error);
    }
}


// ==========================================
// 2. FUNCIONES PARA ESCRIBIR DATOS (POST)
// ==========================================

async function registrarAlumno(event) {
    event.preventDefault();
    const matricula = document.getElementById('alumnoMatricula').value;
    const nombre = document.getElementById('alumnoNombre').value;
    const correo = document.getElementById('alumnoCorreo').value;

    try {
        const response = await fetch(`${API_URL}/alumnos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ matricula, nombre, correo })
        });

        if (response.ok) {
            document.getElementById('registroAlumnoForm').reset();
            openModal('Registro Exitoso', `El alumno ${nombre} ha sido ingresado en el sistema.`);
            cargarTablaAlumnos(); 
        } else {
            openModal('Error', 'La matrícula o correo ya existen en la base de datos.');
        }
    } catch (error) {
        console.error("Error conectando con la API", error);
    }
}


async function registrarTutor(event) {
    event.preventDefault();
    const matricula = document.getElementById('tutorMatricula').value;
    const nombre = document.getElementById('tutorNombre').value;
    const correo = document.getElementById('tutorCorreo').value;
    const materia = document.getElementById('tutorMateria').value;

    const response = await fetch(`${API_URL}/tutores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matricula, nombre, correo, materia })
    });

    if (response.ok) {
        document.getElementById('registroTutorForm').reset();
        openModal('Registro Exitoso', `El tutor ${nombre} ha sido registrado en el sistema.`);
        cargarTablaTutores(); 
    } else {
        openModal('Error', 'No se pudo registrar al tutor. Verifique la matrícula.');
    }
}


async function registrarAsignacion(event) {
    event.preventDefault();
    const alumno_matricula = document.getElementById('asigAlumno').value;
    const tutor_matricula = document.getElementById('asigTutor').value;

    if (!alumno_matricula || !tutor_matricula) return;

    const response = await fetch(`${API_URL}/asignaciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alumno_matricula, tutor_matricula })
    });

    if (response.ok) {
        document.getElementById('registroAsignacionForm').reset();
        openModal('Asignación Exitosa', `Se ha asignado el tutor correctamente.`);
        cargarTablaAsignaciones(); 
        cargarSelectoresAsignacion(); 
    } else {
        openModal('Error', 'No se pudo realizar la asignación. El alumno ya podría tener tutor.');
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
    if (document.getElementById('statTotalAlumnos')) {
        cargarMetricasInicio();
    }
    if (document.getElementById('tablaAlumnosBody')) {
        cargarTablaAlumnos();
    }
    if (document.getElementById('tablaTutoresBody')) {
        cargarTablaTutores();
    }
    if (document.getElementById('tablaAsignacionesBody')) {
        cargarTablaAsignaciones();
        cargarSelectoresAsignacion();
    }
});