const { admin, db } = require('../utils/admin');
const config = require('../utils/config');

exports.uploadOrgImages = (req, res) => {
    const BusBoy = require('busboy');
    const path = require('path');
    const os = require('os');
    const fs = require('fs');

    const busboy = new BusBoy({ headers: req.headers });

    let imagesToBeUploaded = [];
    let imageFileName;
    let imageExtension;
    let countA = 0;
    let countB = 0;

    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
        if (mimetype !== 'image/jpeg' && mimetype !== 'image/png') {
            return res.status(400).json({ error: 'Wrong file type submitted' });
        }
        imageExtension = filename.split('.')[filename.split('.').length - 1];
        imageFileName = `${Math.round(
            Math.random() * 1000000000000
        ).toString()}.${imageExtension}`;
        const filepath = path.join(os.tmpdir(), imageFileName);
        file.pipe(fs.createWriteStream(filepath));
        imagesToBeUploaded.push({ filepath, mimetype, imageFileName });
    });
    busboy.on('finish', () => {
        let photosList = [];

        console.log(imagesToBeUploaded);
        imagesToBeUploaded.forEach(element => {
            admin
                .storage()
                .bucket(config.storageBucket)
                .upload(element.filepath, {
                    resumable: false,
                    destination: `Organizations-Images/${
                        req.user.uid
                    }/photos/image-${countA++}`,
                    metadata: {
                        metadata: {
                            contentType: element.mimetype,
                        },
                    },
                })
                .then(() => {
                    const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${
                        config.storageBucket
                    }/o/Organizations-Images%2F${
                        req.user.uid
                    }%2Fphotos%2Fimage-${countB++}?alt=media`;

                    photosList.push(imageUrl);
                    return db
                        .doc(`/Organizations/${req.user.uid}`)
                        .update({ photos: photosList });
                })
                .then(() => {
                    if (photosList.length === imagesToBeUploaded.length)
                        return res.json({
                            message: 'images uploaded successfully',
                        });
                    return null;
                })
                .catch(err => {
                    console.error(err);
                    return res
                        .status(500)
                        .json({ error: 'something went wrong' });
                });
        });
    });
    busboy.end(req.rawBody);
};

exports.uploadOppImages = (req, res) => {
    const BusBoy = require('busboy');
    const path = require('path');
    const os = require('os');
    const fs = require('fs');

    const oppId = req.params.id;

    const busboy = new BusBoy({ headers: req.headers });

    let imagesToBeUploaded = [];
    let imageFileName;
    let imageExtension;
    let countA = 0;
    let countB = 0;

    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
        if (mimetype !== 'image/jpeg' && mimetype !== 'image/png') {
            return res.status(400).json({ error: 'Wrong file type submitted' });
        }
        imageExtension = filename.split('.')[filename.split('.').length - 1];
        imageFileName = `${Math.round(
            Math.random() * 1000000000000
        ).toString()}.${imageExtension}`;
        const filepath = path.join(os.tmpdir(), imageFileName);
        file.pipe(fs.createWriteStream(filepath));
        imagesToBeUploaded.push({ filepath, mimetype, imageFileName });
    });
    busboy.on('finish', () => {
        let photosList = [];

        imagesToBeUploaded.forEach(element => {
            admin
                .storage(config.storageBucket)
                .bucket()
                .upload(element.filepath, {
                    resumable: false,
                    destination: `Opportunities-Images/${oppId}/image-${countA++}`,
                    metadata: {
                        metadata: {
                            contentType: element.mimetype,
                        },
                    },
                })
                .then(snapshot => {
                    console.log(snapshot);
                    const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${
                        config.storageBucket
                    }/o/Opportunities-Images%2F${oppId}%2Fimage-${countB++}?alt=media`;
                    photosList.push(imageUrl);
                    return db
                        .doc(`/Opportunities/${oppId}`)
                        .update({ photos: photosList });
                })
                .then(() => {
                    if (photosList.length === imagesToBeUploaded.length)
                        return res.json({
                            message: 'images uploaded successfully',
                        });
                    return null;
                })
                .catch(err => {
                    console.error(err);
                    return res.status(500).json({
                        errors: {
                            photos: 'Something went wrong',
                            err: err,
                        },
                    });
                });
        });
    });
    busboy.end(req.rawBody);
};

exports.uploadPostImage = (req, res) => {
    const BusBoy = require('busboy');
    const path = require('path');
    const os = require('os');
    const fs = require('fs');

    const postId = req.params.id;

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
            .bucket(config.storageBucket)
            .upload(imageToBeUploaded.filepath, {
                resumable: false,
                destination: `Organizations-Images/${req.user.uid}/posts/${postId}-image`,
                metadata: {
                    metadata: {
                        contentType: imageToBeUploaded.mimetype,
                    },
                },
            })
            .then(snapshot => {
                const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/Organizations-Images%2F${req.user.uid}%2Fposts%2F${postId}-image?alt=media`;
                return db
                    .collection('Posts')
                    .doc(postId)
                    .update('image', imageUrl);
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
