const { admin, db } = require('../utils/admin');
const config = require('../utils/config');

const firebase = require('firebase');

exports.loginWithThirdParty = ({ body }, res) => {
    const { name, email, photoUrl, id } = body;

    let userData = {};

    firebase
        .auth()
        .createUserWithEmailAndPassword(email, id)
        .then(({ user }) => {
            userData = {
                id: user.uid,
                name: name,
                email: email,
                photo: photoUrl,
                bornDay: '',
                nationality: '',
                course: '',
                institution: '',
                presentation: '',
                linkedin: '',
                facebook: '',
                twitter: '',
                gender: '',
                languages: [],
                skills: [],
                interests: {},
                favoritesOpportunities: [],
                accountFilled: false,
            };
            return db.doc(`Users/${user.uid}`).set(userData);
        })
        .then(() => {
            return res.status(200).json(userData);
        })
        .catch(err => {
            console.log(err);
            if (err.code === 'auth/email-already-in-use')
                firebase
                    .auth()
                    .signInWithEmailAndPassword(email, id)
                    .then(({ user }) => {
                        return db.collection('Users').doc(user.uid).get();
                    })
                    .then(doc => {
                        userData = doc.data();
                        return res.status(200).json(userData);
                    })
                    .catch(() => {
                        return res.status(500);
                    });
            else return res.status(500);
        });
};

exports.getUserData = ({ body }, res) => {
    const { uid, name, email, photo } = body;

    let interestsFilled = false;
    let user = {};

    db.collection('Users')
        .doc(uid)
        .get()
        .then(doc => {
            const userData = doc.data();
            if (userData) {
                user = userData;
                return (interestsFilled =
                    Object.keys(userData.interests).length !== 0);
            } else {
                user = {
                    id: uid,
                    name: name,
                    email: email,
                    photo: photo,
                    bornDay: '',
                    nationality: '',
                    course: '',
                    institution: '',
                    presentation: '',
                    linkedin: '',
                    facebook: '',
                    twitter: '',
                    gender: '',
                    languages: [],
                    skills: [],
                    interests: {},
                    favoritesOpportunities: [],
                    accountFilled: false,
                };
                return db.collection('Users').doc(uid).set(user);
            }
        })
        .then(_ => {
            return res.status(200).json({ user, interestsFilled });
        })
        .catch(err => {
            console.log(err);
            return res.status(500);
        });
};

exports.uploadInterests = (req, res) => {
    const { interests } = req.body;
    const { id } = req.params;

    db.collection('Users')
        .doc(id)
        .update('interests', interests)
        .then(_ => {
            return res.status(200).json({ status: 'Ok' });
        })
        .catch(err => {
            console.log(err);
            return res.status(500);
        });
};

exports.getOpps = ({ body }, res) => {
    const { interests, modalities } = body;

    const opps = [];

    if (
        !interests.animals &&
        !interests.arts &&
        !interests.education &&
        !interests.sports &&
        !interests.environment &&
        !interests.others &&
        !interests.health &&
        !interests.humanRights
    ) {
        db.collection('Opportunities')
            .where('open', '==', true)
            .orderBy('createdAt', 'desc')
            .get()
            .then(docs => {
                docs.forEach(doc => {
                    opps.push(doc.data());
                });
                return res.status(200).json(opps);
            })
            .catch(err => {
                console.log(err);
                return res.status(500);
            });
    } else if (
        interests.animals &&
        interests.arts &&
        interests.education &&
        interests.sports &&
        interests.environment &&
        interests.others &&
        interests.health &&
        interests.humanRights
    ) {
        db.collection('Opportunities')
            .where('open', '==', true)
            .orderBy('createdAt', 'desc')
            .get()
            .then(docs => {
                docs.forEach(doc => {
                    opps.push(doc.data());
                });
                return res.status(200).json(opps);
            })
            .catch(err => {
                console.log(err);
                return res.status(500);
            });
    } else {
        db.collection('Opportunities')
            .where('open', '==', true)
            .where('interests.animals', '==', interests.animals)
            .orderBy('createdAt', 'desc')
            .get()
            .then(docs => {
                docs.forEach(doc => {
                    const docData = doc.data();
                    if (!opps.includes(docData) && docData.interests.animals)
                        opps.push(docData);
                });
                return db
                    .collection('Opportunities')
                    .where('open', '==', true)
                    .where('interests.environment', '==', interests.environment)
                    .orderBy('createdAt', 'desc')
                    .get();
            })
            .then(docs => {
                docs.forEach(doc => {
                    const docData = doc.data();
                    if (
                        !opps.includes(docData) &&
                        docData.interests.environment
                    )
                        opps.push(docData);
                });
                return db
                    .collection('Opportunities')
                    .where('open', '==', true)
                    .where('interests.humanRights', '==', interests.humanRights)
                    .orderBy('createdAt', 'desc')
                    .get();
            })
            .then(docs => {
                docs.forEach(doc => {
                    console.log(doc.data());
                    const docData = doc.data();
                    if (
                        !opps.includes(docData) &&
                        docData.interests.humanRights
                    )
                        opps.push(docData);
                });
                return db
                    .collection('Opportunities')
                    .where('open', '==', true)
                    .where('interests.sports', '==', interests.sports)
                    .orderBy('createdAt', 'desc')
                    .get();
            })
            .then(docs => {
                docs.forEach(doc => {
                    const docData = doc.data();
                    if (!opps.includes(docData) && docData.interests.sports)
                        opps.push(docData);
                });
                return db
                    .collection('Opportunities')
                    .where('open', '==', true)
                    .where('interests.education', '==', interests.education)
                    .orderBy('createdAt', 'desc')
                    .get();
            })
            .then(docs => {
                docs.forEach(doc => {
                    const docData = doc.data();
                    if (!opps.includes(docData) && docData.interests.education)
                        opps.push(docData);
                });
                return db
                    .collection('Opportunities')
                    .where('open', '==', true)
                    .where('interests.health', '==', interests.health)
                    .orderBy('createdAt', 'desc')
                    .get();
            })
            .then(docs => {
                docs.forEach(doc => {
                    const docData = doc.data();
                    if (!opps.includes(docData) && docData.interests.health)
                        opps.push(docData);
                });
                return db
                    .collection('Opportunities')
                    .where('open', '==', true)
                    .where('interests.arts', '==', interests.arts)
                    .orderBy('createdAt', 'desc')
                    .get();
            })
            .then(docs => {
                docs.forEach(doc => {
                    const docData = doc.data();
                    if (!opps.includes(docData) && docData.interests.arts)
                        opps.push(docData);
                });
                return db
                    .collection('Opportunities')
                    .where('open', '==', true)
                    .where('interests.others', '==', interests.others)
                    .orderBy('createdAt', 'desc')
                    .get();
            })
            .then(docs => {
                docs.forEach(doc => {
                    const docData = doc.data();
                    if (!opps.includes(docData) && docData.interests.others)
                        opps.push(docData);
                });
                return res.status(200).json(opps);
            })
            .catch(err => {
                console.log(err);
                return res.status(500);
            });
    }
};

exports.getAllPosts = ({ body }, res) => {
    const posts = [];

    db.collection('Posts')
        .get()
        .then(docs => {
            docs.forEach(doc => {
                const docData = doc.data();
                posts.push(docData);
            });
            return res.status(200).json(posts);
        })
        .catch(err => {
            console.log(err);
            return res.status(500);
        });
};

exports.uploadFavList = (req, res) => {
    const { favoritesOpportunities } = req.body;
    const { id } = req.params;
    db.collection('Users')
        .doc(id)
        .update('favoritesOpportunities', favoritesOpportunities)
        .then(_ => {
            return res.status(200).json({ status: 'Ok' });
        })
        .catch(err => {
            console.log(err);
            return res.status(500);
        });
};

exports.getFavOpps = ({ body }, res) => {
    const { favoritesOpportunities } = body;
    const opps = [];

    db.collection('Opportunities')
        .get()
        .then(docs => {
            docs.forEach(doc => {
                const docData = doc.data();
                if (favoritesOpportunities.includes(docData.id))
                    opps.push(docData);
            });
            return res.status(200).json(opps);
        })
        .catch(err => {
            console.log(err);
            return res.status(500);
        });
};

exports.uploadOppLikes = ({ body }, res) => {
    const { likes, id } = body;
    db.collection('Posts')
        .doc(id)
        .update('likes', likes)
        .then(_ => {
            return res.status(200).json({ status: 'Ok' });
        })
        .catch(err => {
            console.log(err);
            return res.status(500);
        });
};

exports.getOrgData = ({ params }, res) => {
    const { id } = params;
    db.collection('Organizations')
        .doc(id)
        .get()
        .then(doc => {
            const orgData = doc.data();
            return res.status(200).json(orgData);
        })
        .catch(err => {
            console.log(err);
            return res.status(500);
        });
};

exports.registerForOpp = ({ body, params }, res) => {
    const { registrationData } = body;
    const { oppId } = params;

    db.collection('Opportunities')
        .doc(oppId)
        .collection('Registrations')
        .doc(registrationData.userUid)
        .set(registrationData)
        .then(_ => {
            return db.collection('Opportunities').doc(oppId).get();
        })
        .then(opp => {
            const { usersRegistered } = opp.data();
            usersRegistered.push(registrationData.userUid);
            return db
                .collection('Opportunities')
                .doc(oppId)
                .update('usersRegistered', usersRegistered);
        })
        .then(_ => {
            return res.status(200).json({ status: 'Ok' });
        })
        .catch(err => {
            console.log(err);
            return res.status(500);
        });
};

exports.cancelRegistration = ({ params }, res) => {
    const { oppId, userId } = params;
    const aux = [];

    db.collection('Opportunities')
        .doc(oppId)
        .collection('Registrations')
        .doc(userId)
        .delete()
        .then(_ => {
            return db.collection('Opportunities').doc(oppId).get();
        })
        .then(opp => {
            const { usersRegistered } = opp.data();
            usersRegistered.forEach(id => {
                if (id !== userId) aux.push(id);
            });
            return db
                .collection('Opportunities')
                .doc(oppId)
                .update('usersRegistered', aux);
        })
        .then(_ => {
            return res.status(200).json(aux);
        })
        .catch(err => {
            console.log(err);
            return res.status(500);
        });
};

exports.uploadPushToken = ({ body }, res) => {
    const { id, token } = body;
    db.collection('Users')
        .doc(id)
        .update('token', token)
        .then(_ => {
            return res.status(200).json({ status: 'Ok' });
        })
        .catch(err => {
            console.log(err);
            return res.status(500);
        });
};

exports.changePhoto = (req, res) => {
    const { id } = req.params;
    const BusBoy = require('busboy');
    const path = require('path');
    const os = require('os');
    const fs = require('fs');

    const busboy = new BusBoy({ headers: req.headers });

    let imageToBeUploaded = {};
    let imageFileName;
    let imageExtension;

    let imageUrl;

    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
        if (
            mimetype !== 'image/jpeg' &&
            mimetype !== 'image/png' &&
            mimetype !== 'image/jpg'
        ) {
            return res.status(400).json({
                error: 'Wrong file type submitted',
                headers: req.headers,
                body: req.body,
            });
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
            .bucket(config.storageBucket)
            .upload(imageToBeUploaded.filepath, {
                resumable: false,
                destination: `Users-Images/${imageFileName}`,
                metadata: {
                    metadata: {
                        contentType: imageToBeUploaded.mimetype,
                    },
                },
            })
            .then(snapshot => {
                imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/Users-Images%2F${imageFileName}?alt=media`;
                return db.doc(`/Users/${id}`).update('photo', imageUrl);
            })
            .then(() => {
                return res.json(imageUrl);
            })
            .catch(err => {
                console.error(err);
                return res.status(500).json({ error: 'Something went wrong' });
            });
    });
    busboy.end(req.rawBody);
};

exports.editProfile = ({ body, params }, res) => {
    const { id } = params;
    db.collection('Users')
        .doc(id)
        .update(body)
        .then(_ => {
            return res.status(200).json({ status: 'Ok' });
        })
        .catch(err => {
            console.log(err);
            return res.status(500);
        });
};

exports.likePost = ({ params }, res) => {
    const { postId, userId } = params;
    let result = [];

    db.collection('Posts')
        .doc(postId)
        .get()
        .then(doc => {
            const { likes } = doc.data();
            if (likes.includes(userId))
                result = likes.filter(value => {
                    return value !== userId;
                });
            else result = [...likes, userId];
            return db.collection('Posts').doc(postId).update('likes', result);
        })
        .then(_ => {
            return res.status(200).json(result);
        })
        .catch(err => {
            console.log(err);
            return res.status(500);
        });
};
