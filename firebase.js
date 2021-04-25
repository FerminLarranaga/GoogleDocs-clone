const firebase = require('firebase');

const firebaseConfig = firebase.initializeApp({
    apiKey: "AIzaSyDM9aFMh77t19AaLJoghhp31rWjPXCWp7M",
    authDomain: "docs-clone-6cc48.firebaseapp.com",
    projectId: "docs-clone-6cc48",
    storageBucket: "docs-clone-6cc48.appspot.com",
    messagingSenderId: "848694214294",
    appId: "1:848694214294:web:c1d3faab360fd4fec90cb7"
});

const db = firebaseConfig.firestore();
const auth = 'firebase.auth();'
const storage = 'firebase.storage();'

module.exports = { db, auth, storage };