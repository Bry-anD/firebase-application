
import { httpsCallable, connectFunctionsEmulator } from "firebase/functions";

import { functions } from "./firebase.js"

if (location.hostname === 'localhost') {
    connectFunctionsEmulator(functions, 'localhost', 5001);
}

const nameProyect = document.getElementById("proyect").innerText

document.getElementById('realtime-action-form').addEventListener('submit', (event) => {
    event.preventDefault();
    console.log('Inicio: función realtimeAction en Cloud Functions');
    const compareRef = document.getElementById("compareRef").value;
    const target = document.getElementById("target").value;
    const resolveRef = document.getElementById("resolveRef").value;
    const resolveVal = document.getElementById("resolveVal").value;
    const operation = document.getElementById("operation").value;

    console.log(compareRef, resolveRef, resolveVal, operation, target);

    const realtimeAction = httpsCallable(functions, 'realtimeAction');
    realtimeAction({
        compareRef: compareRef,
        target: target,
        resolveRef: resolveRef,
        resolveVal: resolveVal,
        operation: operation

    })
        .then((result) => {
            // Read result of the Cloud Function.
            const data = result.data;
            console.log(data);
        })
        .catch((error) => {
            // Getting the Error details.
            const code = error.code;
            const message = error.message;
            const details = error.details;
            console.error(details)
            // ...
        });

});

document.getElementById('realtime-notification-form').addEventListener('submit', (event) => {
    event.preventDefault();
    console.log('Inicio: función realtimeNotification en Cloud Functions');

    const compareRef = document.getElementById("compareRefN").value;
    const target = document.getElementById("targetN").value;
    const msg = document.getElementById("msgN").value;
    const operation = document.getElementById("operationN").value;
    console.log("app", compareRef, target, operation);


    const realtimeNotification = httpsCallable(functions, 'realtimeNotification');
    realtimeNotification({
        compareRef: compareRef,
        target: target,
        msg: msg,
        operation: operation

    })
        .then((result) => {
            // Read result of the Cloud Function.
            const data = result.data;
            console.log(data);
        })
        .catch((error) => {
            // Getting the Error details.
            const code = error.code;
            const message = error.message;
            const details = error.details;
            // ...
        });

});