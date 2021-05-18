const functions = require('firebase-functions');
const app = require('express')();
const { db } = require('./utils/admin');

const {
    addOpportunity,
    removeOpportunity,
    openOpportunity,
    closeOpportunity,
    getOpportunities,
    editOpportunity,
    getOpportunity,
} = require('./handlers/opportunities');

const {
    signUp,
    signIn,
    signOut,
    uploadLogo,
    uploadData,
    editData,
    getData,
} = require('./handlers/organization');

const {
    getUsersRegisterd,
    getUser,
    selectUser,
} = require('./handlers/registrations');

const {
    uploadOrgImages,
    uploadOppImages,
    uploadPostImage,
} = require('./utils/uploadImage');

const { getPosts, addPost, removePost } = require('./handlers/posts');

const {
    getUserData,
    uploadInterests,
    getOpps,
    getAllPosts,
    getFavOpps,
    uploadFavList,
    uploadOppLikes,
    getOrgData,
    registerForOpp,
    cancelRegistration,
    uploadPushToken,
    changePhoto,
    editProfile,
    likePost,
    loginWithThirdParty,
} = require('./handlers/app');

const FBAuth = require('./utils/fbAuth');

const cors = require('cors');
app.use(cors());

//Manage opportunities
app.post('/opportunity/add', FBAuth, addOpportunity);
app.post('/opportunity/remove', FBAuth, removeOpportunity);
app.post('/opportunity/open', FBAuth, openOpportunity);
app.post('/opportunity/close', FBAuth, closeOpportunity);
app.post('/opportunity/edit', FBAuth, editOpportunity);
app.post('/opportunity/photos/:id', FBAuth, uploadOppImages);
app.get('/opportunity/get/:id', FBAuth, getOpportunity);
app.get('/opportunities/get', FBAuth, getOpportunities);

//Manage organization
app.post('/signUp', signUp);
app.post('/signIn', signIn);
app.post('/signOut', signOut);
app.post('/organization/logo', FBAuth, uploadLogo);
app.post('/organization/data', FBAuth, uploadData);
app.post('/organization/photos', FBAuth, uploadOrgImages);
app.post('/organization/edit', FBAuth, editData);
app.get('/organization/get', FBAuth, getData);

//Manage registrations
app.post('/registrations/get', FBAuth, getUsersRegisterd);
app.post('/registrations/user/get', FBAuth, getUser);
app.post('/registrations/user/select', FBAuth, selectUser);

//Manage posts
app.get('/posts/get', FBAuth, getPosts);
app.post('/posts/add', FBAuth, addPost);
app.post('/posts/remove', FBAuth, removePost);
app.post('/posts/uploadImage/:id', FBAuth, uploadPostImage);

//Manage App
app.post('/app/login', loginWithThirdParty);
app.post('/app/getUser', getUserData);
app.post('/app/uploadInterests/:id', uploadInterests);
app.post('/app/getOpps', getOpps);
app.get('/app/getPosts', getAllPosts);
app.post('/app/getFavOpps', getFavOpps);
app.post('/app/uploadFavList/:id', uploadFavList);
app.post('/app/uploadOppLikes', uploadOppLikes);
app.get('/app/getOrgData/:id', getOrgData);
app.post('/app/registerForOpp/:oppId', registerForOpp);
app.post('/app/cancelRegistration/:userId/:oppId', cancelRegistration);
app.post('/app/uploadPushToken', uploadPushToken);
app.post('/app/changePhoto/:id', changePhoto);
app.post('/app/editProfile/:id', editProfile);
app.post('/app/likePost/:userId/:postId', likePost);

exports.api = functions.https.onRequest(app);

//When the organization data changes
exports.onOrgUpdate = functions.firestore
    .document('Organizations/{orgId}')
    .onUpdate(change => {
        const newValue = change.after.data();
        const oldValue = change.before.data();
        if (newValue.logo !== oldValue.logo) {
            db.collection('Posts')
                .where('orgId', '==', newValue.id)
                .get()
                .then(data => {
                    data.forEach(doc => {
                        db.collection('Posts')
                            .doc(doc.data().id)
                            .update('orgLogo', newValue.logo);
                    });
                    return;
                })
                .catch(err => {
                    console.error(err);
                });
        }
        if (newValue.name !== oldValue.name) {
            db.collection('Posts')
                .where('orgId', '==', newValue.id)
                .get()
                .then(data => {
                    data.forEach(doc => {
                        db.collection('Posts')
                            .doc(doc.data().id)
                            .update('orgName', newValue.name);
                    });
                    return;
                })
                .catch(err => {
                    console.error(err);
                });
        }
    });

//When the User data changes
exports.onUserUpdate = functions.firestore
    .document('Users/{userId}')
    .onUpdate(change => {
        const newValue = change.after.data();
        const oldValue = change.before.data();
        if (newValue.name !== oldValue.name) {
            db.collection('Comments')
                .where('userId', '==', change.after.id)
                .get()
                .then(data => {
                    data.forEach(doc => {
                        db.collection('Comments')
                            .doc(doc.id)
                            .update('userName', newValue.name);
                    });
                    return;
                })
                .catch(err => {
                    console.error(err);
                });
        }
        if (newValue.photo !== oldValue.photo) {
            db.collection('Comments')
                .where('userId', '==', change.after.id)
                .get()
                .then(data => {
                    data.forEach(doc => {
                        db.collection('Comments')
                            .doc(doc.id)
                            .update('userPhoto', newValue.photo);
                    });
                    return;
                })
                .catch(err => {
                    console.error(err);
                });
        }
    });
