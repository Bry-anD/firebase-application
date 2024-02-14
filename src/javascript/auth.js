import {
    connectAuthEmulator,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    sendEmailVerification,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signOut,
    GoogleAuthProvider,
    signInWithRedirect,
    getRedirectResult,
    signInWithPopup
} from 'firebase/auth';

// } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';

import { auth } from './firebase.js';
// if (window.location.hostname === 'localhost') {
//     connectAuthEmulator(auth, 'http://127.0.0.1:9099');
// }

const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const signInButton = document.getElementById('quickstart-sign-in');
const googleSignInButton = document.getElementById('quickstart-sign-in-google');
const signUpButton = document.getElementById('quickstart-sign-up');
const passwordResetButton = document.getElementById('quickstart-password-reset');
const verifyEmailButton = document.getElementById('quickstart-verify-email');
const signInStatus = document.getElementById('quickstart-sign-in-status');
const accountDetails = document.getElementById('quickstart-account-details');
//Google provider elements
// const oauthToken = document.getElementById('quickstart-oauthtoken');

const authUser = document.getElementById('auth-user');
const authSign = document.getElementById('auth-sign');
const userUid = document.getElementById('user-uid');
const userEmail = document.getElementById('user-email');
const userPhoto = document.getElementById('user-photo');


/**
 * Handles the sign in button press.
 */
function toggleSignIn() {
    if (auth.currentUser) {
        signOut(auth);
        alert('User Signed Out.');
        location.reload()
    } else {
        const email = emailInput.value;
        const password = passwordInput.value;
        if (email.length < 1) {
            alert('Please enter an email address.');
            return;
        }
        if (password.length < 1) {
            alert('Please enter a password.');
            return;
        }
        // Sign in with email and pass.
        signInWithEmailAndPassword(auth, email, password).then(() => {
            // User signed in successfully.
            alert('Sesión iniciada exitosamente.');
            console.log('User Signed In.');
            // const accountModal = document.getElementById("accountModal");
            // accountModal.style.display = "none";
        }).catch(function (error) {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            if (errorCode === 'auth/invalid-credential') {
                alert('Usuario o contraseña incorrectos.');
            } else {
                alert(`Error al iniciar sesión:  ${errorMessage}`);
            }
            console.log(error);
            signInButton.disabled = false;
        });
    }
    signInButton.disabled = true;
}

/**
 * Handles the sign up button press.
 */
function handleSignUp() {
    const email = emailInput.value;
    const password = passwordInput.value;
    if (email.length < 4) {
        alert('Please enter an email address.');
        return;
    }
    if (password.length < 4) {
        alert('Please enter a password.');
        return;
    }
    // Create user with email and pass.
    createUserWithEmailAndPassword(auth, email, password).catch(function (error) {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        if (errorCode == 'auth/weak-password') {
            alert('The password is too weak.');
        } else {
            alert(errorMessage);
        }
        console.log(error);
    });
}

/**
 * Sends an email verification to the user.
 */
function sendVerificationEmailToUser() {
    sendEmailVerification(auth.currentUser).then(function () {
        // Email Verification sent!
        alert('Email Verification Sent!');
    });
}

function sendPasswordReset() {
    const email = emailInput.value;
    sendPasswordResetEmail(auth, email)
        .then(function () {
            // Password Reset Email Sent!
            alert('Password Reset Email Sent!');
        })
        .catch(function (error) {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            if (errorCode == 'auth/invalid-email') {
                alert(errorMessage);
            } else if (errorCode == 'auth/user-not-found') {
                alert(errorMessage);
            }
            console.log(error);
        });
}


function googleSingIn() {
    if (!auth.currentUser) {
        const provider = new GoogleAuthProvider();
        provider.addScope('https://www.googleapis.com/auth/plus.login');
        signInWithRedirect(auth, provider);

    } else {
        signOut(auth);
    }
    // signInButton.disabled = true;
    googleSignInButton.disabled = true;

}

//Google Provider authentication
getRedirectResult(auth)
    .then(function (result) {
        if (!result) return;
        const credential = GoogleAuthProvider.credentialFromResult(result);
        // const token = credential.accessToken;
        // oauthToken.textContent = token ? token : '';
        if (credential) {
            // This gives you a Google Access Token. You can use it to access the Google API.
            const token = credential?.accessToken;
            oauthToken.textContent = token ?? '';
        } else {
            oauthToken.textContent = 'null';
        }
        // The signed-in user info.
        const user = result.user;
    })
    .catch(function (error) {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        const credential = error.credential;
        if (errorCode === 'auth/account-exists-with-different-credential') {
            alert(
                'You have already signed up with a different auth provider for that email.',
            );
            // If you are using multiple auth providers on your app you should handle linking
            // the user's accounts here.
        } else {
            console.error(error);
        }
    });

// signInWithPopup(auth, provider)
//     .then((result) => {
//         console.log('pop up in progress');

//         // This gives you a Google Access Token. You can use it to access the Google API.
//         // const credential = GoogleAuthProvider.credentialFromResult(result);
//         const token = credential.accessToken;
//         // The signed-in user info.
//         const user = result.user;
//         // IdP data available using getAdditionalUserInfo(result)
//         // ...
//         console.log('popup success');

//     }).catch((error) => {
//         // Handle Errors here.
//         console.error(error);

//         const errorCode = error.code;
//         const errorMessage = error.message;
//         // The email of the user's account used.
//         const email = error.customData.email;
//         // The AuthCredential type that was used.
//         const credential = GoogleAuthProvider.credentialFromError(error);
//         // ...
//     }

// Listening for auth state changes.
onAuthStateChanged(auth, function (user) {
    verifyEmailButton.style.display = "none";
    if (user) {
        // User is signed in.
        const displayName = user.displayName;
        const email = user.email;
        const emailVerified = user.emailVerified;
        const photoURL = user.photoURL;
        const isAnonymous = user.isAnonymous;
        const uid = user.uid;
        const providerData = user.providerData;
        signInStatus.textContent = 'Signed in';
        signInButton.textContent = 'Sign out';
        userUid.textContent = uid;
        userEmail.textContent = email;
        userPhoto.textContent = photoURL;
        accountDetails.textContent = JSON.stringify(user, null, '  ');
        authUser.style.display = "block";
        authSign.style.display = "none";
        if (!emailVerified) {
            verifyEmailButton.disabled = false;
            verifyEmailButton.style.display = "block";
        }
        console.log(uid + ": " + email);


    } else {
        // User is signed out.
        signInStatus.textContent = 'Signed out';
        signInButton.textContent = 'Sign in';
        accountDetails.textContent = 'null';
        // oauthToken.textContent = 'null';
        // googleSignInButton.disabled = false;
        authUser.style.display = "none";
        authSign.style.display = "block";
    }
    signInButton.disabled = false;
});


signInButton.addEventListener('click', toggleSignIn, false);
// signUpButton.addEventListener('click', handleSignUp, false);
verifyEmailButton.addEventListener('click', sendVerificationEmailToUser, false);
passwordResetButton.addEventListener('click', sendPasswordReset, false);
// googleSignInButton.addEventListener('click', googleSingIn, false);

