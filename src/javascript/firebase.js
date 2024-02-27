
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { getFunctions } from 'firebase/functions';
import { getMessaging, isSupported } from "firebase/messaging";
import { getPerformance } from "firebase/performance";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";


//Configuración del proyecto de firebase de la aplicación
const firebaseConfig = {
    apiKey: "AIzaSyBcLGOVLIr-R64vY7dT1mWGdYhd4M26bp8",
    authDomain: "iotriego-17bad.firebaseapp.com",
    databaseURL: "https://iotriego-17bad-default-rtdb.firebaseio.com",
    projectId: "iotriego-17bad",
    storageBucket: "iotriego-17bad.appspot.com",
    messagingSenderId: "842817138478",
    appId: "1:842817138478:web:3cc5b91a6b3a0196bb94bf"
};


// Inicializa Firebase
export const app = initializeApp(firebaseConfig);

// Inicializa Realtime Database and y obtiene una referencia al servicio
export const database = getDatabase(app);

//  Initializa Cloud Firestore and y obtiene una referencia al servicio
export const firestone = getFirestore(app);

// Inicializa Firebase Auth 
export const auth = getAuth(app);

// Inicializa Firebase functions 
export const functions = getFunctions(app);

// Initialize Firebase Cloud Messaging 
// llamada mediante await messaging() cada vez que la instancia es necesitada
export const messaging = async () => await isSupported() && getMessaging(app);

// Inicializa Performance Monitoring y obtiene una referencia al servicio
export const performance = getPerformance(app);


export const analytics = getAnalytics(app);
