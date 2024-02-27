import time
import sqlite3
import os
import json
import firebase_admin
from firebase_admin import credentials, db, storage
from datetime import datetime, timedelta
import pytz

# from google.cloud import storage

proyect = str('CultivoDispFinal')
dataBaseName = 'baseDatosCultivo.db'
tiempoMuestra = 1  # minutos


cred = credentials.Certificate(
    'iotriego-17bad-firebase-adminsdk-pcsm5-38d08da6a5.json')

firebaseConfig = {
    "apiKey": "AIzaSyBcLGOVLIr-R64vY7dT1mWGdYhd4M26bp8",
    "authDomain": "iotriego-17bad.firebaseapp.com",
    "databaseURL": "https://iotriego-17bad-default-rtdb.firebaseio.com",
    "projectId": "iotriego-17bad",
    "storageBucket": "iotriego-17bad.appspot.com",
    "messagingSenderId": "842817138478",
    "appId": "1:842817138478:web:3cc5b91a6b3a0196bb94bf"
}

# Initialize the application with the firebase SDK configuration
firebase_admin.initialize_app(cred, firebaseConfig)

# database Reference representing the node at the specified path (databaseURL).
realtimedb = db.reference()

# fb = firebase.FirebaseApplication(urlDB, None)
fb = realtimedb.child(proyect)

# dirección del bucket de Firebase Storage
bucketURL = 'iotriego-17bad.appspot.com'


def downloadDB(archive_name):
    try:
        conn = sqlite3.connect(dataBaseName)
        c = conn.cursor()

        # Ejecutar una consulta SELECT para obtener los datos de la tabla
        c.execute(f"SELECT * FROM {'History'}")
        columns = c.fetchall()

        # Convertir los datos a una lista de diccionarios
        global datos
        datos = []
        for column in columns:
            diccionario_columna = {
                "id": column[0],
                "tiempo": column[1],
                "humedad_suelo": column[2],
                "humedad_aire": column[3],
                "temperatura": column[4],
            }
            datos.append(diccionario_columna)

        # Escribir los datos en un archivo JSON
        with open(archive_name+".json", 'w') as archivo_json:
            json.dump(datos, archivo_json, indent=4)

        print(
            f"La entidad History ha sido exportada a {archive_name}.json.")

    except sqlite3.Error as e:
        print(f"Error al exportar la tabla '{archive_name}': {e}")
    finally:
        conn.close()


def uploadDB(blobName, filePath):

    # Enviar los datos de la base de datos a Firebase
    try:
        # Referencia al bucket de Firebase Cloud Storage.
        bucket = storage.bucket(f'{bucketURL}')
        # Crea la dirección del nuevo blob (objeto) en tu bucket.
        Objeto = bucket.blob(blobName)
        # sube un archivo a tu blob desde tu sistema de archivos local.
        Objeto.upload_from_filename(filePath)
        print(f"{readTime(1)}File {filePath} uploaded to {blobName}.")

    except Exception as e:
        # muestra del error en la consola
        print("Error al enviar datos a Firebase:", e)

    # Devuelve una URL de descarga pública
    return Objeto.public_url


#################################################################


def getData():
    # Obtención de datos en tiempo real desde Firebase

    try:
        result = fb.child('data').get()
        humSuelo = fb.child('data/humSuelo').get()
        humAire = fb.child('data/humAire').get()
        tempAire = fb.child('data/tempAire').get()
        irrigate = fb.child('data/riego').get()
    except Exception as e:
        print(e)

    return result, humSuelo, humAire, tempAire, irrigate

################################################################
# Creación de la base de datos SQlite


def initDB():
    conn = sqlite3.connect(dataBaseName)
    c = conn.cursor()
    c.execute('''CREATE TABLE History (ID integer primary key, EstampaTiempo real, \
	       HumedadSuelo real, HumedadAire real, TemperaturaAire real, Riego real)''')
    conn.commit()  # save changes
    conn.close()

################################################################
# Añadir datos a la base de datos SQlite


def addDataDB():
    global humedadSuelo, humedadAire, temperaturaAire, riego
    conn = sqlite3.connect(dataBaseName)
    c = conn.cursor()
    c.execute('''INSERT INTO History
    	(EstampaTiempo, HumedadSuelo, HumedadAire, TemperaturaAire, Riego)
    	VALUES (?, ?, ?, ?, ?)''', (time.time(), humedadSuelo, humedadAire, temperaturaAire, riego))
    conn.commit()
    conn.close()


def dataChanges(event):
    global humedadSuelo, humedadAire, temperaturaAire, riego

    try:

        humedadSuelo = fb.child('data/humSuelo').get()
        humedadAire = fb.child('data/humAire').get()
        temperaturaAire = fb.child('data/tempAire').get()
        riego = fb.child('data/riego').get()
        addDataDB()
        print(f"{readTime(0)} - cambios agregados a la base de datos:", event.data)

    except Exception as e:
        print(e)
        print("Error al cargar datos del listen() la base de datos")


################################################################
# Obtener la datos en intervalos de tiempo
def readWithRange(inicio=time.time(), fin=time.time()):
    # Conectar a la base de datos
    conn = sqlite3.connect(dataBaseName)
    c = conn.cursor()
    if inicio == fin:
        fecha_inicio = time.time() - 86400
        fecha_fin = time.time()
    elif fin == 0:
        # Establecer el rango de tiempo
        fecha_inicio = inicio
        fecha_fin = time.time()
    else:
        fecha_inicio = inicio
        fecha_fin = fin

    # Realizar la consulta
    c.execute("SELECT * FROM History WHERE EstampaTiempo BETWEEN ? AND ?",
              (fecha_inicio, fecha_fin))
    columns = c.fetchall()
    datos = {}
    for i, column in enumerate(columns):
        if i >= 100:  # Limita a 100 iteraciones
            break
        id = column[0]
        diccionario_columna = {
            "tiempo": column[1],
            "humedad_suelo": column[2],
            "humedad_aire": column[3],
            "temperatura": column[4],
        }
        datos[id] = diccionario_columna

    fb.child(f'sqlite/consulta').set(datos)

################################################################
# Obtener la marca de tiempo actual en el formato requerido


def readTime(tipo):
    # Obtener la marca de tiempo actual en formato 'día mes hora:minuto:segundo'
    timeStamp = time.strftime("%d %b %Y %H:%M:%S", time.localtime())

    if tipo == 0:
        # Time Day Month Hour Minute
        timeStamp = time.strftime("%d %b %H:%M", time.localtime())
        return timeStamp
    else:
        return timeStamp

######## Programa principal###############


def main():

    # Obtén el valor de 'actions/sqliteRead' obtener la base de datos SQLite
    sqliteRead = fb.child('actions/sqliteRead').get()
    if bool(sqliteRead):
        fb.child('actions/sqliteRead').set(False)
        url = uploadDB(f'{dataBaseName}', f'./{dataBaseName}')
        print(url)
        print("se ha exportado la base de datos SQlite en firebase")

    # Obtén parametros para la consulta en la base de datos SQlite
    consulta = fb.child('sqlite/EstampaTiempo')
    # Verifica si el valor es un objeto (dict en Python)
    if isinstance(consulta, dict):
        try:
            # print(consulta["inicio"], consulta["fin"])
            inicio = consulta["inicial"]
            fin = consulta["final"]
            readWithRange(inicio, fin)
            fb.child('actions/sqliteRead').set(False)

        except Exception as e:
            print(e, 'error al consultar la base de datos')

    listener = None
    while bool(fb.child('actions/sqliteWrite').get()):
        if listener is None:
            try:
                print("Listen Realtime Database Proyect Data")
                listener = fb.child('data').listen(dataChanges)
            except Exception:
                listener.close()
                print("Error listening", Exception)

    if listener is not None:
        print("Finish listening Realtime Database Proyect Data")
        listener.close()


if __name__ == "__main__":

    if os.path.isfile(dataBaseName) == False:  # verifica si existe la base de datos
        initDB()  # si no existe, se la crea
        print("Un nuevo archivo de base de datos ha sido creado")
    else:
        print("Un archivo de base de datos ha sido encontrado")

    while True:
        # programa de la base de datos
        main()
        time.sleep(tiempoMuestra*10)
        print("Esperando instrucciones de firebase")


# try:
#         result, humedadSuelo, humedadAire, temperaturaAire, riego = getData()
#         print("Datos cargados a la base de datos:", result)
#         addDataDB()

#     except Exception as e:
#         print(e)
#         print("Error al cargar datos a la base de datos")
