/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// const { onRequest } = require("firebase-functions/v2/https");
// const logger = require("firebase-functions/logger");



// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });


// import * as v2 from "firebase-functions/v2";
// import * as v1 from "firebase-functions/v1";
// const functionsV2 = require("firebase-functions/v2");

// const firebase = require("firebase-admin");
// const functions = firebase.functions();


const { logger } = require("firebase-functions");
const { onCall, onRequest, HttpsError } = require("firebase-functions/v2/https");
const { onValueUpdated, onValueWritten } = require("firebase-functions/v2/database");

const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getDatabase } = require("firebase-admin/database");
const { getMessaging } = require("firebase-admin/messaging");
const { getFunctions } = require("firebase-admin/functions");

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
const app = initializeApp(firebaseConfig);

// Instancia de firebase functions
const functions = getFunctions(app);

// Inicializa Realtime Database and get a reference to the service
const database = getDatabase(app);

// Inicializa Realtime Database and get a reference to the service
const messaging = getMessaging(app);

exports.subscribeTopicFCM = onValueUpdated('/CultivoDispFinal/users', (event) => {

    const afterUsers = event.data.after.val()
    // These registration tokens come from the client FCM SDKs.
    const registrationTokens = [];

    // Itera sobre cada hijo de afterUser
    for (let userId in afterUsers) {
        const user = afterUsers[userId];
        const token = user.fcmtoken; // Obtiene el valor de fcmtoken
        registrationTokens.push(token); // Agrega el token al arreglo
    }

    // Subscribe the devices corresponding to the registration tokens to the topic

    messaging.subscribeToTopic(registrationTokens, 'general')
        .then((response) => {
            // See the MessagingTopicManagementResponse reference documentation
            // for the contents of response.
            console.log('Successfully subscribed to topic:', response);
        })
        .catch((error) => {
            console.log('Error subscribing to topic:', error);
        });

});

exports.riegoAutomatico = onValueUpdated('CultivoDispFinal/data', (event) => {
    if (!event.data.after.exists()) {
        return null;
    }
    // Obtén el valor después del cambio
    const afterData = event.data.after.val();

    database.ref('CultivoDispFinal/actions/mode').get()
        .then((snapshot) => {
            if (snapshot.exists() || snapshot.val() == 'auto') {

                database.ref('CultivoDispFinal/settings').get()
                    .then(async (snapshot2) => {
                        if (snapshot2.exists()) {

                            const settings = snapshot2.val();
                            let humSuelo = afterData.humSuelo


                            if (humSuelo < settings.humSueloMin) {
                                await database.ref('CultivoDispFinal/actions/regar').set(true);

                                async function finalizarRiego() {
                                    await database.ref('CultivoDispFinal/actions/regar').set(false)
                                }
                                setTimeout(finalizarRiego, settings.tiempoRiego);

                            } else if (humSuelo > settings.humSueloMax) {
                                await database.ref('CultivoDispFinal/actions/regar').set(false)
                            }

                            let tempAire = afterData.tempAire

                            if (tempAire < settings.tempAireMin) {
                                const topic = 'general';
                                const message = {
                                    notification: {
                                        title: `IotRiego : Alerta FRIO Excesivo`,
                                        body: `(${tempAire}°C) proteger el cultivo`,
                                    },
                                    topic: topic
                                };

                                // Send a message to devices subscribed to the provided topic.
                                messaging.send(message).then((response) => {
                                    console.log('Successfully sent message:', response);
                                }).catch((error) => {
                                    console.log('Error sending message:', error);
                                });

                            } else if (tempAire > settings.tempAireMax) {
                                const topic = 'general';
                                const message = {
                                    notification: {
                                        title: `IotRiego : Alerta CALOR Excesivo`,
                                        body: `(${tempAire}°C) proteger el cultivo`,
                                    },
                                    data: {
                                        time: new Date()
                                    },
                                    topic: topic
                                };

                                // Send a message to devices subscribed to the provided topic.
                                messaging.send(message).then((response) => {
                                    console.log('Successfully sent message:', response);
                                }).catch((error) => {
                                    console.log('Error sending message:', error);
                                });
                            }

                        } else {
                            console.log('realtimeNotification: settings does not exist. User has to accept page notifications');
                        };
                    }).catch((error) => {
                        console.error(error);
                    });
            }
        }).catch((error) => {
            console.error(error);
        });
    return null;
});

exports.realtimeNotification = onCall({ cors: [/firebase\.com$/, "https://iotriego-17bad.web.app"] }, (data, context) => {
    const uid = data.auth.uid;
    const compareRef = data.data.compareRef;
    const msg = data.data.msg;
    const target = data.data.target;
    const operation = data.data.operation;
    console.log(compareRef, operation, target);

    // Comprueba si el nodo tiene las propiedades necesarias
    if (compareRef && target && operation) {

        const reference = database.ref(compareRef);
        // Lee los datos en la ruta especificada
        const listener = reference.on('value', function (snapshot) {

            let actVal = snapshot.val()
            let conditionMet = false;
            console.log(actVal);

            // Comprueba la condición basada en la operación
            switch (operation) {
                case '==':
                    conditionMet = actVal == target;
                    break;
                case '>':
                    conditionMet = actVal > target;
                    break;
                case '<':
                    conditionMet = actVal < target;
                    break;
                default:
                    console.log('Operación no soportada.');
                    return null;
            }

            // Si se cumple la condición, envía la notificación
            if (conditionMet) {
                reference.off('value', listener);
                console.log('Condicion se ha cumplido');

                database.ref(`CultivoDispFinal/users/${uid}/fcmToken`).get()
                    .then((snapshot) => {
                        if (snapshot.exists()) {
                            const token = snapshot.val()
                            console.log('token', token);

                            const message = msg.toString();

                            const condition = {
                                token,
                                notification: {
                                    title: `IoT riego functions: La condición se ha cumplido (${actVal}${operation}${target})`,
                                    body: message,
                                }
                            };

                            messaging.send(condition).then((response) => {
                                // Response is a message ID string.
                                console.log('Successfully sent message: ', response);
                            }).catch((error) => {
                                console.log('error: ', error);
                            });

                            console.log('realtimeNotification: finished successfully', compareRef, operation, target);

                        } else {
                            console.log('realtimeNotification: fcm_token does not exist. User has to accept page notifications');
                        }
                    }).catch((error) => {
                        console.error(error);
                    });
                // Envía la notificación a todos los dispositivos
                return `realtimeNotification: finished successfully, user: ${uid}`;
            }

        });
    } else {
        console.log('function to Notify failed: El nodo no tiene las propiedades necesarias.');
        return `cloud function realtimeNotification no tiene las propiedades necesarias, user: ${uid},${data}:{compareRef:${compareRef},target:${target},operation:${operation}}`;
    }

});

exports.realtimeAction = onCall({ cors: [/firebase\.com$/, "https://iotriego-17bad.web.app"] }, (data, context) => {
    const uid = data.auth.uid;
    const compareRef = data.data.compareRef;
    const resolveRef = data.data.resolveRef;
    const resolveVal = data.data.resolveVal;
    const target = data.data.target;
    const operation = data.data.operation;

    // Comprueba si el nodo tiene las propiedades necesarias
    if (compareRef && target && operation) {


        const ref = database.ref(compareRef);
        // Lee los datos en la ruta especificada
        const listener = ref.on('value', async function (snapshot) {

            let actVal = snapshot.val()
            let conditionMet = false;
            console.log(actVal);

            // Comprueba la condición basada en la operación
            switch (operation) {
                case '==':
                    conditionMet = actVal == target;
                    break;
                case '>':
                    conditionMet = actVal > target;
                    break;
                case '<':
                    conditionMet = actVal < target;
                    break;
                case '!=':
                    conditionMet = actVal != target;
                    break;
                default:
                    console.log('Operación no soportada.');
                    return null;
            }

            // Si se cumple la condición, envía la notificación
            if (conditionMet) {
                ref.off('value', listener);
                try {
                    await database.ref(resolveRef).set(resolveVal);
                } catch (error) {
                    console.log('error: ', error);
                }
                console.log('realtimeAction: finished successfully', compareRef, operation, target);
                return `realtimeAction: finished successfully, user: ${uid}`;
                // Envía la notificación a todos los dispositivos
            }
        });
    } else {
        return `cloud function realtimeAction no tiene las propiedades necesarias ${time}, user: ${uid};{compareRef:${compareRef},target:${target},operation:${operation},${resolveRef},${resolveVal}}`;
    }

});






