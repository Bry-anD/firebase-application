
// New js file with the firbase methods 

import { database, performance } from './firebase.js';
import { ref, onValue, child, get, set, update } from 'firebase/database';
// import { trace } from 'firebase/performance'

// Como llamar al realtimeGet :
// realtimeGet('tu/referencia/aquí').then((valor) => {
//     console.log(valor);
// }).catch((error) => {
//     console.error(error);0
// });


export function realtimeGet(reference = '/') {

    return new Promise((resolve, reject) => {

        let Elements_ref = ref(database, reference);

        get(Elements_ref).then((snapshot) => {

            if (snapshot.exists()) {
                const data = snapshot.val();
                resolve(data);
            }

        }).catch((error) => {
            console.error(`The read failed, method realtimeGet('${reference}')`, error.name);
            reject(error);

        });

    });
}


export function realtimeVal(reference = '/', callback) {

    let Elements_ref = ref(database, reference);

    onValue(Elements_ref, (snapshot) => {

        if (snapshot.exists()) {
            const changedPost = snapshot.val();
            callback(changedPost)
        }
    }, (error) => {
        console.error(`The read failed realtimeVal('${reference}')` + error.name);
        reject(error);
    });
}

export function realtimeElement(reference = '/', elementID) {

    // const t = trace(performance, "traceRealtimeDataSync")
    // t.start()
    let Elements_ref = ref(database, reference)

    onValue(Elements_ref, (snapshot) => {

        if (snapshot.exists()) {
            const changedPost = snapshot.val();
            document.getElementById(elementID).innerText = changedPost;
        } else {
            document.getElementById(elementID).innerText = 'null';
            console.log(`No data available  realtimeElement('${reference}', '${elementID}')`);
        }

    }, (error) => {
        console.error(`The read failed  realtimeElement('${reference}')` + error.name);
        // t.putAttribute('errorCode', error)
    });

    // t.stop()
}

export function realtimeObject(reference = '/', object) {

    let Elements_ref = ref(database, reference)

    onValue(Elements_ref, (snapshot) => {

        if (snapshot.exists()) {
            const changedPost = snapshot.val();
            updateObject(changedPost)
        } else {
            updateObject('0')
            console.log(`No data available  realtimeObject('${reference}', '${object}')`);
        }

    }, (error) => {
        console.error(`The read failed realtimeObject('${reference}')` + error.name);
    });

    function updateObject(changedValue) {
        try {
            object.value = changedValue;
        } catch (error) {
            console.error(`failed updateObject('${object.title}')`, error);
        }

    }
}

export function write(reference = '/', content) {
    // const t = trace(performance, "traceRealtimeSetData")
    // t.start()
    let Elements_ref = ref(database, reference)

    set(Elements_ref, content)
        .then(() => {
            // Data saved successfully!
            // console.log(`Data saved succesfully in ${Elements_ref}`, content);

        })
        .catch((error) => {
            console.error(`The write failed in ${Elements_ref}`, error);
            // t.putAttribute('codeError', error)
            // The write failed...
        });
    // t.stop()
}



