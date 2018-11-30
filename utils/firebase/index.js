// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

//TODO Formalize config instead of stubbing it in window. Dangerous!!

const config = {
    apiKey: 'AIzaSyAbnjLKuAmTPTWnsLRNZ3V8i6D455ZReNk',
    authDomain: 'riff-1e882.firebaseapp.com',
    databaseURL: 'https://riff-1e882.firebaseio.com',
    messagingSenderId: 876860777687,
    projectId: 'riff-1e882',
    storageBucket: 'riff-1e882.appspot.com',
};

const app = firebase.initializeApp(config);

// The following (we aren't yet storing Date objects, so there are no ramifications)
// is needed to address the following warning from Firebase:
//   [2018-10-09T19:48:08.741Z]  @firebase/firestore: Firestore (5.5.0):
//   The behavior for Date objects stored in Firestore is going to change
//   AND YOUR APP MAY BREAK.
const firestore = app.firestore();
const settings = {timestampsInSnapshots: true};
firestore.settings(settings);

export default app;
