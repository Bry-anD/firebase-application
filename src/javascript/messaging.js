// import { doc, setDoc } from 'firebase/firestore';
// import { db } from './firebase'; // para firestore getFirestore(app)

import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from "./firebase";
import { write } from "./realtime"


const VAPID_KEY = 'BIloYkHdmoS-tZFgg6Oj2cre3AeQUQq4bFCB55rbPlZ4pcDMSh-5SxPiNT2C0T28dnHJK0x70fZpFWLPZvEbYbQ'

// Requests permissions to show notifications.
async function requestNotificationsPermissions(uid) {
    console.log('Requesting notifications permission...');
    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
        console.log('Notification permission granted.');
        // Notification permission granted.
        await saveMessagingDeviceToken(uid);
    } else {
        console.log('Unable to get permission to notify.');
    }
}


// Saves the messaging device token to Cloud Firestore.
export async function saveMessagingDeviceToken(uid) {
    // console.log('save msg device token');

    try {
        const msg = await messaging();
        const fcmToken = await getToken(msg, { vapidKey: VAPID_KEY });

        if (fcmToken) {
            console.log('Got FCM device token:', fcmToken);

            // Save device token to realtime Database
            write(`CultivoDispFinal/users/${uid}/fcmToken`, fcmToken);


            // This will fire when a message is received while the app is in the foreground.
            // When the app is in the background, firebase-messaging-sw.js will receive the message instead.
            onMessage(msg, (message) => {
                console.log(
                    'New foreground notification from Firebase Messaging!',
                    message.notification
                );
                new Notification(message.notification.title, { body: message.notification.body });
            });
        } else {
            // Need to request permissions to show notifications.
            requestNotificationsPermissions(uid);
        }
    } catch (error) {
        console.error('Unable to get messaging token.', error);
    };
}










