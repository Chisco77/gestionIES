import xml.etree.ElementTree as ET
import psycopg2
import sys
import os

# Establecer conexión con la base de datos
def conectar_db():
    try:
        conn = psycopg2.connect(
            dbname="becarios",
            user="postgres",
            password="79Mor77Men2009",
            host="localhost",
            port="5432"
        )
        return conn
    except Exception as e:
        print(f"Error de conexión: {e}")
        sys.exit(1)

# Función para insertar un registro de alumno y grupo en la base de datos
def insertar_datos(nie, nombre, apellido1, apellido2, fecha_nacimiento, login_rayuela, id_rayuela, grupo):
    conn = conectar_db()
    cursor = conn.cursor()

    # Si el grupo es None o vacío, asignar "No asignado" como valor predeterminado
    if grupo is None or grupo == '':
        grupo = 'No asignado'

    # Comprobar si el grupo existe en la tabla de grupos
    cursor.execute("SELECT id FROM api_grupos WHERE grupo = %s", (grupo,))
    result = cursor.fetchone()

    if result:
        idgrupo = result[0]
    else:
        # Si el grupo no existe, lo insertamos
        cursor.execute("INSERT INTO api_grupos (grupo) VALUES (%s) RETURNING id", (grupo,))
        idgrupo = cursor.fetchone()[0]

    # Insertar el alumno en la tabla de alumnos
    cursor.execute("""
        INSERT INTO api_alumnos (nie, nombre, apellido1, apellido2, fecha_nacimiento, login_rayuela, id_rayuela, idgrupo)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """, (nie, nombre, apellido1, apellido2, fecha_nacimiento, login_rayuela, id_rayuela, idgrupo))

    conn.commit()
    print(f"Registro insertado: {nombre} {apellido1} {apellido2} - Grupo: {grupo}")

    cursor.close()
    conn.close()

# Función para procesar el XML
def procesar_xml(xml_file):
    # Intentamos parsear el archivo XML
    try:
        tree = ET.parse(xml_file)
        root = tree.getroot()
    except ET.ParseError as e:
        print(f"Error al parsear XML: {e}")
        sys.exit(1)

    for alumno in root.findall('alumno'):
        # Obtener datos, si no se encuentran, asignar valores por defecto
        nie = alumno.find('nie').text if alumno.find('nie') is not None else '-1'
        nombre = alumno.find('nombre').text if alumno.find('nombre') is not None else ''
        apellido1 = alumno.find('primer-apellido').text if alumno.find('primer-apellido') is not None else ''
        apellido2 = alumno.find('segundo-apellido').text if alumno.find('segundo-apellido') is not None else ''
        fecha_nacimiento = alumno.find('fecha-nacimiento').text if alumno.find('fecha-nacimiento') is not None else '1900-01-01'
        login_rayuela = alumno.find('datos-usuario-rayuela/login').text if alumno.find('datos-usuario-rayuela/login') is not None else ''
        id_rayuela = alumno.find('datos-usuario-rayuela/id-usuario').text if alumno.find('datos-usuario-rayuela/id-usuario') is not None else '-1'
        grupo = alumno.find('grupo').text if alumno.find('grupo') is not None and alumno.find('grupo').text != '' else 'No asignado'
        
        # Mostrar el registro que se va a insertar
        print(f"Inserta alumno: {nombre} {apellido1} {apellido2}, NIE: {nie}, Fecha nacimiento: {fecha_nacimiento}, Login Rayuela: {login_rayuela}, ID Rayuela: {id_rayuela}, Grupo: {grupo}")
        
        # Insertar los datos del alumno en la base de datos
        insertar_datos(nie, nombre, apellido1, apellido2, fecha_nacimiento, login_rayuela, id_rayuela, grupo)

if __name__ == "__main__":
    # Leer el archivo XML desde el parámetro
    if len(sys.argv) < 2:
        print("Por favor, proporciona el archivo XML como argumento.")
        sys.exit(1)

    xml_file = sys.argv[1]
    procesar_xml(xml_file)

