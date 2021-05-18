const { admin, db } = require('../utils/admin');
const config = require('../utils/config');
const {
    validateSignUpData,
    validateSignInData,
    validateUploadData,
    reduceOrgDetails,
} = require('../utils/validators');

const firebase = require('firebase');
firebase.initializeApp(config);

exports.signUp = (req, res) => {
    const newOrg = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
    };

    const { errors, valid } = validateSignUpData(newOrg);

    let mToken, mUserId;

    if (!valid) {
        return res.status(400).json({ errors: errors });
    }
    db.collection('Organizations')
        .where('name', '==', newOrg.name)
        .get()
        .then(data => {
            if (!data.empty)
                return res
                    .status(400)
                    .json({ errors: { name: 'Name is already in use' } });
            return firebase
                .auth()
                .createUserWithEmailAndPassword(newOrg.email, newOrg.password);
        })
        .then(data => {
            mUserId = data.user.uid;
            return data.user.getIdToken();
        })
        .then(token => {
            mToken = token;
            const orgCredentials = {
                email: newOrg.email,
                name: newOrg.name,
                rating: 5,
                logo: 'https://firebasestorage.googleapis.com/v0/b/socialep-3bdd5.appspot.com/o/user.jpg?alt=media&token=b22c4b74-b1fe-4f81-b459-ef8f760ebb6a',
                id: mUserId,
                accountFilled: false,
            };
            return db.doc(`Organizations/${mUserId}`).set(orgCredentials);
        })
        .then(() => {
            let user = firebase.auth().currentUser;
            return user.sendEmailVerification();
        })
        .then(() => {
            return res.status(201).json({ mToken });
        })
        .catch(err => {
            console.error(err);
            if (err.code === 'auth/email-already-in-use')
                return res
                    .status(400)
                    .json({ errors: { email: 'Email is already in use' } });
            else if (err.code === 'auth/weak-password')
                return res
                    .status(400)
                    .json({ errors: { password: 'Password weak' } });
            return res.status(500).json({ errors: { general: err.code } });
        });
};

exports.signIn = (req, res) => {
    const user = {
        email: req.body.email,
        password: req.body.password,
    };
    const { errors, valid } = validateSignInData(user);
    if (!valid) return res.status(400).json({ errors: errors });

    firebase
        .auth()
        .signInWithEmailAndPassword(user.email, user.password)
        .then(data => {
            return data.user.getIdToken();
        })
        .then(token => {
            return res.json({ token });
        })
        .catch(err => {
            console.log(err);
            if (err === 'The email address is badly formatted.')
                return res
                    .status(400)
                    .json({
                        errors: {
                            email: 'The email address is badly formatted.',
                        },
                    });
            if (err.code === 'auth/too-many-requests')
                return res
                    .status(500)
                    .json({
                        errors: {
                            general: 'Too many attempts, try again later',
                        },
                    });
            return res
                .status(500)
                .json({
                    errors: {
                        general: 'Invalid credentials. Please try again',
                    },
                });
        });
};

exports.signOut = (req, res) => {
    firebase
        .auth()
        .signOut()
        .then(() => {
            return res.json({ message: 'signed out complete' });
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        });
};

exports.uploadLogo = (req, res) => {
    const BusBoy = require('busboy');
    const path = require('path');
    const os = require('os');
    const fs = require('fs');

    const busboy = new BusBoy({ headers: req.headers });

    let imageToBeUploaded = {};
    let imageFileName;
    let imageExtension;

    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
        if (mimetype !== 'image/jpeg' && mimetype !== 'image/png') {
            return res.status(400).json({ error: 'Wrong file type submitted' });
        }
        imageExtension = filename.split('.')[filename.split('.').length - 1];
        imageFileName = `${Math.round(
            Math.random() * 1000000000000
        ).toString()}.${imageExtension}`;
        const filepath = path.join(os.tmpdir(), imageFileName);
        imageToBeUploaded = { filepath, mimetype };
        file.pipe(fs.createWriteStream(filepath));
    });
    busboy.on('finish', () => {
        admin
            .storage()
            .bucket()
            .upload(imageToBeUploaded.filepath, {
                resumable: false,
                destination: `Organizations-Images/${req.user.uid}/logo`,
                metadata: {
                    metadata: {
                        contentType: imageToBeUploaded.mimetype,
                    },
                },
            })
            .then(snapshot => {
                const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/Organizations-Images%2F${req.user.uid}%2Flogo?alt=media`;
                return db
                    .doc(`/Organizations/${req.user.uid}`)
                    .update({ logo: imageUrl });
            })
            .then(() => {
                return res.json({ message: 'image uploaded successfully' });
            })
            .catch(err => {
                console.error(err);
                return res.status(500).json({ error: 'something went wrong' });
            });
    });
    busboy.end(req.rawBody);
};

exports.uploadData = (req, res) => {
    const newData = {
        name: req.body.name,
        address: req.body.address,
        description: req.body.description,
        interests: req.body.interests,
        phone: req.body.phone,
        country: req.body.country,
        accountFilled: true,
    };
    const { errors, valid } = validateUploadData(newData);

    if (!valid) return res.status(400).json({ errors: errors });

    db.collection('Organizations')
        .where('name', '==', newData.name)
        .get()
        .then(data => {
            if (!data.empty && req.body.nameChanged)
                return res
                    .status(400)
                    .json({ errors: { name: 'Name is already in use' } });
            return db.doc(`Organizations/${req.user.uid}`).update(newData);
        })
        .then(() => {
            return res.status(201).json({ message: 'Data uploaded' });
        })
        .catch(err => {
            console.log(err);
            return res.status(500).json({ errors: { general: err.code } });
        });
};

exports.editData = (req, res) => {
    const { valid, errors, details } = reduceOrgDetails(req.body);

    if (!valid) return res.status(400).json({ errors: errors });

    db.collection('Organizations')
        .doc(req.user.uid)
        .update(details)
        .then(() => {
            return res.status(201).json({ message: 'Data uploaded' });
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.message });
        });
};

exports.getData = (req, res) => {
    db.collection('Organizations')
        .doc(req.user.uid)
        .get()
        .then(doc => {
            return res.json({ user: doc.data() });
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.message });
        });
};
