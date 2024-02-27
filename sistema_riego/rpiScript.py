from __future__ import division
import threading
from datetime import datetime
from firebase import firebase
from google.cloud import functions
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, db
import time
import random
import json
import subprocess
import numpy as np
# from flask import Flask, render_template, redirect, url_for, flash
# from flask import request, jsonify
from aioconsole import ainput
import numpy
import serial
import struct
import sys
import os
import csv
import asyncio
# import Adafruit_DHT  # Importa la biblioteca Adafruit para el sensor DHT11


# Time variables
current_second = datetime.now()  # time in format: 2023-08-09 17:22:20.248461
# time in format: 2023-08-09 17:22:20.248461
current_date = datetime.date(current_second)
# time in format: 2023-08-09 17:22:20
Start_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

# Credential of service account from firebase proyect console
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
# gs://iotriego-17bad.appspot.com

# Initialize the application with the firebase SDK configuration
firebase_admin.initialize_app(cred, firebaseConfig)

# database Reference representing the node at the specified path (databaseURL).
realtimedb = db.reference()

try:
    # Open the config file in the app directory, filename = config.json
    with open('config.json', 'r') as archive:
        config = json.load(archive)
        proyect = str(config["proyect"])
        settings = config["settings"]
        actions = config["actions"]
        data = config["data"]

        # Firebase
        fb = realtimedb.child(proyect)
        fb.child('settings').set(settings)
        fb.child('actions').set(actions)
        fb.child('data').set(data)

except Exception as e:
    print('Configuration file error (config.json)')
    print('error: ', e)
    try:
        fb = realtimedb.child('CultivoDispFinal')
        config = fb.get()
    except Exception as e:
        print('Firebase error: fail getting settings from ', e)

dataRef = fb.child('data')
actionsRef = fb.child('actions')
settingsRef = fb.child('settings')


# #####################################################
# # Read and  return the current time
def readTime(tipo):  # (tipo):
    # Obtener la marca de tiempo actual en formato 'día mes año hora:minuto:segundo'
    timeStamp = time.strftime("%d %b %Y %H:%M:%S", time.localtime())

    if tipo == 0:
        # Time Day Month Hour Minute
        timeStamp = time.strftime("%d %b %H:%M:%S", time.localtime())
        return timeStamp
    else:
        return timeStamp


#####################################################
# sincronice config.json with Firebase
def firebaseSinchronize():

    global settings, actions
    try:

        # Open the config file in the app directory, filename = config.json
        with open('config.json', 'r') as archive:
            config = json.load(archive)
            n_settings = config["settings"]
            n_actions = config["actions"]

        # if exist changes on config.json that do not come from firebase
        if settings != n_settings or actions != n_actions:

            # Firebase update content
            realtimedb.child(
                config["proyect"]+'/settings').set(n_settings)
            realtimedb.child(config["proyect"]+'/actions').set(n_actions)

            # Get content from config.json
            actions = n_actions
            settings = n_settings

        else:

            n_settings = settingsRef.get()
            n_actions = actionsRef.get()

            if settings != n_settings or actions != n_actions:

                # Get content from firebase
                actions = n_actions
                settings = n_settings

                # Open the config file in the app directory, filename = config.json and write firebase content
                with open('config.json', 'w') as archivo_json:
                    config["settings"] = settings
                    config["actions"] = actions
                    json.dump(config, archivo_json, indent=4)

    except Exception as e:

        print('error: ', e)
        print('Configuration file error (config.json)')


####################################################
# Get data from Sensors or others elements
def outputs():

    try:
        # Add elements value to monitoring here

        # Sensors:
        data["humAire"] = int(random.uniform(60, 75))
        data["humSuelo"] = int(random.uniform(55, 72))
        data["tempAire"] = int(random.uniform(22, 22))

        # Actuators:
        data["riego"] = actions.get("regar")  # water pump status

        # date
        # data["fecha"] = readTime(0)

        # To sensors:
        # Conversion factors in config.json file: devices/device/conversion, example:
        # data["humAire"] = eval(f"{data['humAire']}{devices['humAire']['conversion']}")

    except Exception as e:
        print('Error in outpus:', e)

    return data


#####################################################
# Send data from the proyect to firebase program
def sendData(value):
    # Json to send to firebase
    fb.child('data').update(value)


def monitoring():
    # Envía datos hacia Firebase
    while actionsRef.child("monitoring").get():

        endTime = time.time()
        try:
            processTime = endTime - startTime
            time.sleep(settings.get("dataRate")-(processTime))
        except:
            pass

        startTime = time.time()
        firebaseSinchronize()

        try:
            data = outputs()
            sendData(data)

            dataRate = settings["dataRate"]
            print(f'Datos enviados a Firebase, data rate: {dataRate}s')
            print(data)

        except Exception as e:
            print("Sending data to firebase error:", e)


# Esta es la función que se ejecutará en un hilo separado
def leer_input():

    while True:
        comando = input()
        print(f"Comando: {comando}")

        if comando != '':
            if comando == "salir":
                break
            else:
                # Ejecutar el comando en el sistema
                exCommands(comando)


def exCommands(command):
    # Lista de comandos permitidos sin necesidad de permisos de superusuario
    allowed_commands = ['pgrep', 'top', 'htop',
                        'df', 'ping', 'uname', 'ls', 'cat']

    # Dividir el comando en palabras y verificar si el comando es permitido

    if command in allowed_commands:

        try:
            # Ejecutar el comando y obtener la salida
            result = subprocess.run(
                command, shell=True, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            # Decodificar la salida a texto
            output = result.stdout.decode('utf-8')
            error = result.stderr.decode('utf-8')

            if output:
                print(f'Salida del comando: {output}')

            if error:
                print(f'Error al ejecutar el comando: {error}')

        except subprocess.CalledProcessError as e:
            # Manejar errores en la ejecución del comando
            print(f'Error al ejecutar el comando: {e}')


# Crea y comienza un nuevo hilo que ejecutará la función leer_input
# t = threading.Thread(target=leer_input)
# t.start()


######## Programa principal#############


def main():
    while True:

        # Sincronización de Realtime Database y config.json
        firebaseSinchronize()

        print(readTime(0)+" -- waiting for instructions from Firebase or terminal")

        # Monitoreo y publicación de valores en Realtime Database
        if actions.get("monitoring"):
            monitoring()

        fbCommand = settings.get("command")

        # Ejecución de comandos de Realtime Database
        if fbCommand != "":
            if fbCommand == "salir":
                break
            else:
                # Ejecutar el comando en el sistema
                # settingsRef.child("command").set("")
                fb.child('settings/command').set("")
                exCommands(fbCommand)

        time.sleep(10)

        # Crea y comienza un nuevo hilo que ejecutará la función leer_input
        # t = threading.Thread(target=leer_input)


if __name__ == "__main__":
    main()
