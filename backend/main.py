from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import psycopg2
from psycopg2.extras import RealDictCursor
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware, 
    allow_origins=["*"], 
    allow_methods=["*"], 
    allow_headers=["*"]
)

# --- MODELOS DE DATOS ---
class Alumno(BaseModel):
    matricula: str
    nombre: str
    correo: str

class Tutor(BaseModel):
    matricula: str
    nombre: str
    correo: str
    materia: str

class AsignacionRequest(BaseModel):
    alumno_matricula: str
    tutor_matricula: str

# --- CONEXIÓN A BD ---
def get_db_connection():
    return psycopg2.connect(
        host="db", 
        database="tutorias", 
        user="admin", 
        password="password123",
        cursor_factory=RealDictCursor # Devuelve diccionarios en lugar de tuplas
    )

# ==========================================
# RUTAS PARA ALUMNOS
# ==========================================
@app.get("/api/alumnos")
def obtener_alumnos():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT matricula, nombre, correo, estatus FROM alumnos ORDER BY fecha_registro DESC")
    alumnos = cursor.fetchall()
    conn.close()
    return alumnos

@app.post("/api/alumnos")
def registrar_alumno(alumno: Alumno):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO alumnos (matricula, nombre, correo) VALUES (%s, %s, %s)", 
            (alumno.matricula, alumno.nombre, alumno.correo)
        )
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail="Error al guardar alumno")
    finally:
        conn.close()
    return {"mensaje": "Alumno registrado"}

# ==========================================
# RUTAS PARA TUTORES
# ==========================================
@app.get("/api/tutores")
def obtener_tutores():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT matricula, nombre, correo, materia FROM tutores ORDER BY fecha_registro DESC")
    tutores = cursor.fetchall()
    conn.close()
    return tutores

@app.post("/api/tutores")
def registrar_tutor(tutor: Tutor):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO tutores (matricula, nombre, correo, materia) VALUES (%s, %s, %s, %s)", 
            (tutor.matricula, tutor.nombre, tutor.correo, tutor.materia)
        )
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail="Error al guardar tutor")
    finally:
        conn.close()
    return {"mensaje": "Tutor registrado"}

# ==========================================
# RUTAS PARA ASIGNACIONES
# ==========================================
@app.get("/api/asignaciones")
def obtener_asignaciones():
    conn = get_db_connection()
    cursor = conn.cursor()
    # Hacemos un JOIN para traer los nombres desde sus tablas usando la estructura de tu baseDatos.sql
    query = """
        SELECT a.matricula as alumno_matricula, a.nombre as alumno_nombre, a.correo as alumno_correo, 
               t.nombre as tutor_nombre, t.materia
        FROM asignaciones asig
        JOIN alumnos a ON asig.alumno_id = a.id
        JOIN tutores t ON asig.tutor_id = t.id
        ORDER BY asig.fecha_asignacion DESC
    """
    cursor.execute(query)
    asignaciones = cursor.fetchall()
    conn.close()
    return asignaciones

@app.post("/api/asignaciones")
def registrar_asignacion(asig: AsignacionRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # 1. Obtener IDs buscando por MATRÍCULA en ambos casos
        cursor.execute("SELECT id FROM alumnos WHERE matricula = %s", (asig.alumno_matricula,))
        alumno = cursor.fetchone()
        cursor.execute("SELECT id FROM tutores WHERE matricula = %s", (asig.tutor_matricula,)) 
        tutor = cursor.fetchone()

        if not alumno or not tutor:
            raise HTTPException(status_code=404, detail="Alumno o Tutor no encontrado")

        # 2. Insertar asignación
        cursor.execute(
            "INSERT INTO asignaciones (alumno_id, tutor_id) VALUES (%s, %s)", 
            (alumno['id'], tutor['id'])
        )
        
        # 3. Actualizar estatus del alumno
        cursor.execute("UPDATE alumnos SET estatus = 'Con Tutor' WHERE id = %s", (alumno['id'],))
        
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail="El alumno ya tiene asignación o hubo un error")
    finally:
        conn.close()
    return {"mensaje": "Asignación registrada exitosamente"}