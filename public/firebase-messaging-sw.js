importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-messaging.js');

const firebaseConfig = {
    apiKey: "AIzaSyBcLGOVLIr-R64vY7dT1mWGdYhd4M26bp8",
    authDomain: "iotriego-17bad.firebaseapp.com",
    databaseURL: "https://iotriego-17bad-default-rtdb.firebaseio.com",
    projectId: "iotriego-17bad",
    storageBucket: "iotriego-17bad.appspot.com",
    messagingSenderId: "842817138478",
    appId: "1:842817138478:web:3cc5b91a6b3a0196bb94bf"
};


firebase.initializeApp(firebaseConfig);

// Retrieve firebase messaging
const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
    console.log('Received background message ', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});