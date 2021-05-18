const { db } = require('../utils/admin');
const { validatePost } = require('../utils/validators');

exports.getPosts = (req, res) => {
    db.collection('Posts')
        .where('orgId', '==', req.user.uid)
        .orderBy('createdAt', 'desc')
        .get()
        .then(data => {
            let posts = [];
            data.forEach(doc => {
                posts.push(doc.data());
            });
            return res.json(posts);
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        });
};

exports.removePost = (req, res) => {
    db.collection('Posts')
        .doc(req.body.postId)
        .delete()
        .then(() => {
            return res
                .status(201)
                .json({ message: `Post ${req.body.postId} removed` });
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        });
};

exports.addPost = (req, res) => {
    const post = {
        body: req.body.body,
        orgId: req.user.uid,
        orgLogo: req.body.orgLogo,
        orgName: req.body.orgName,
        image: null,
        createdAt: new Date().toISOString(),
        likes: [],
    };

    let postId;

    const { errors, valid } = validatePost(post);

    if (!valid) return res.status(400).json({ errors: errors });

    db.collection('Posts')
        .add(post)
        .then(data => {
            postId = data.id;
            return db.collection('Posts').doc(data.id).update('id', postId);
        })
        .then(() => {
            return res.json({ postId: postId });
        })
        .catch(err => {
            console.error(err);
            return res
                .status(500)
                .json({ errors: { body: 'Something Went Wrong' } });
        });
};
